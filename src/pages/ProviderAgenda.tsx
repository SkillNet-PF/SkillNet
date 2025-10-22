import { useEffect, useMemo, useState } from "react";
import { listAppointments, AppointmentItem, updateAppointmentStatus } from "../services/appointments";
import { Paper, Typography, Stack, Chip, Divider, Button, Avatar, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

export default function ProviderAgenda() {
  const [items, setItems] = useState<AppointmentItem[]>([]);
  const [status] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [savingId, setSavingId] = useState<string>("");
  const [details, setDetails] = useState<AppointmentItem | null>(null);

  useEffect(() => {
    listAppointments(1, 100)
      .then((r) => setItems(Array.isArray(r) ? r : []))
      .catch((e) => setError(e?.message || "Error cargando agenda"));
  }, []);

  const filtered = useMemo(() => {
    if (!status) return items;
    return items.filter((a) => a.Status === status);
  }, [items, status]);

  const confirmAndRun = async (message: string, fn: () => Promise<void>) => {
    // segunda confirmación
    if (!window.confirm(message)) return;
    if (!window.confirm("¿Seguro? Esta acción no se puede deshacer.")) return;
    await fn();
  };

  return (
    <div className="container mx-auto p-6">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} className="mb-3">
        <Typography variant="h5">Mi Agenda</Typography>
      </Stack>
      {error && <Typography color="error" className="mb-2">{error}</Typography>}
      <Stack spacing={2}>
        {filtered.map((a) => (
          <Paper key={a.AppointmentID} className="p-3">
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
              <Typography sx={{ minWidth: 140 }}>{new Date(a.AppointmentDate).toLocaleDateString()} {a.hour}</Typography>
              <Chip label={a.Status} />
              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 220 }}>
                <Avatar sx={{ width: 32, height: 32 }}>{a.UserClient?.name?.[0] || 'C'}</Avatar>
                <Typography>Cliente: {a.UserClient?.name || ''}</Typography>
              </Stack>
              <Typography color="text.secondary">Tel: {(a as any)?.UserClient?.phone || '—'}</Typography>
              <Typography color="text.secondary">Email: {(a as any)?.UserClient?.email || '—'}</Typography>
              <Typography color="text.secondary">{a.Category?.name || a.Category?.Name || ""}</Typography>
              <Typography color="text.secondary">Notas: {a.Notes}</Typography>
              <Stack direction="row" spacing={1} sx={{ marginLeft: 'auto' }}>
                <Button size="small" onClick={() => setDetails(a)}>Ver detalles</Button>
                {a.Status === 'PENDING' && (
                  <Button size="small" variant="contained" color="success" disabled={savingId===a.AppointmentID}
                    onClick={() => confirmAndRun('¿Confirmar este turno?', async () => { setSavingId(a.AppointmentID); try { await updateAppointmentStatus(a.AppointmentID, 'CONFIRMED'); setItems((prev)=>prev.map(x=>x.AppointmentID===a.AppointmentID?{...x, Status:'CONFIRMED'}:x)); } catch(e:any){ setError(e?.message||'No se pudo confirmar'); } finally { setSavingId(""); } })}>Aceptar</Button>
                )}
                {a.Status === 'PENDING' && (
                  <></>
                )}
                {a.Status !== 'CANCEL' && a.Status !== 'COMPLETED' && (
                  <Button size="small" variant="outlined" color="error" disabled={savingId===a.AppointmentID}
                    onClick={() => confirmAndRun('¿Cancelar este turno?', async () => { setSavingId(a.AppointmentID); try { await updateAppointmentStatus(a.AppointmentID, 'CANCEL'); setItems((prev)=>prev.map(x=>x.AppointmentID===a.AppointmentID?{...x, Status:'CANCEL'}:x)); } catch(e:any){ setError(e?.message||'No se pudo cancelar'); } finally { setSavingId(""); } })}>Cancelar</Button>
                )}
                {a.Status === 'CONFIRMED' && (
                  <Button size="small" variant="outlined" color="warning" disabled={savingId===a.AppointmentID}
                    onClick={() => confirmAndRun('¿Marcar como completado parcial?', async () => { setSavingId(a.AppointmentID); try { await updateAppointmentStatus(a.AppointmentID, 'COMPLETED_PARTIAL'); setItems((prev)=>prev.map(x=>x.AppointmentID===a.AppointmentID?{...x, Status:'COMPLETED_PARTIAL'}:x)); } catch(e:any){ setError(e?.message||'No se pudo actualizar'); } finally { setSavingId(""); } })}>Parcial</Button>
                )}
                {a.Status === 'COMPLETED_PARTIAL' && (
                  <Button size="small" variant="contained" color="primary" disabled>{'Esperando al cliente'}</Button>
                )}
              </Stack>
            </Stack>
          </Paper>
        ))}
        <Dialog open={!!details} onClose={() => setDetails(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Detalles del turno</DialogTitle>
          <DialogContent dividers>
            {details && (
              <Stack spacing={1}>
                <Typography><strong>Fecha:</strong> {new Date(details.AppointmentDate).toLocaleString()}</Typography>
                <Typography><strong>Estado:</strong> {details.Status}</Typography>
                <Typography><strong>Categoría:</strong> {details.Category?.name || details.Category?.Name || ''}</Typography>
                <Divider />
                <Typography variant="subtitle1">Cliente</Typography>
                <Typography>Nombre: {details.UserClient?.name || ''}</Typography>
                <Typography>Teléfono: {(details as any)?.UserClient?.phone || '—'}</Typography>
                <Typography>Email: {(details as any)?.UserClient?.email || '—'}</Typography>
                <Typography>Dirección: {(details as any)?.UserClient?.address || '—'}</Typography>
                <Divider />
                <Typography variant="subtitle1">Notas</Typography>
                <Typography color="text.secondary">{details.Notes || '—'}</Typography>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1}>
              {details?.UserClient && (details as any)?.UserClient?.phone && (
                <Button component="a" href={`tel:${(details as any).UserClient.phone}`} target="_blank" rel="noopener">Llamar</Button>
              )}
              {details?.UserClient && (details as any)?.UserClient?.email && (
                <Button component="a" href={`mailto:${(details as any).UserClient.email}`}>Email</Button>
              )}
            </Stack>
            <Stack direction="row" spacing={1}>
              {details && details.Status === 'PENDING' && (
                <Button size="small" variant="contained" color="success" disabled={savingId===details.AppointmentID}
                  onClick={() => confirmAndRun('¿Confirmar este turno?', async () => { setSavingId(details.AppointmentID); try { await updateAppointmentStatus(details.AppointmentID, 'CONFIRMED'); setItems((prev)=>prev.map(x=>x.AppointmentID===details.AppointmentID?{...x, Status:'CONFIRMED'}:x)); setDetails({ ...details, Status: 'CONFIRMED' }); } catch(e:any){ setError(e?.message||'No se pudo confirmar'); } finally { setSavingId(""); } })}>Aceptar</Button>
              )}
              {details && (details.Status === 'CONFIRMED' || details.Status === 'COMPLETED_PARTIAL') && (
                <Button size="small" variant="contained" color="primary" disabled={savingId===details.AppointmentID}
                  onClick={() => confirmAndRun('¿Marcar como COMPLETADO?', async () => { setSavingId(details.AppointmentID); try { await updateAppointmentStatus(details.AppointmentID, 'COMPLETED'); setItems((prev)=>prev.map(x=>x.AppointmentID===details.AppointmentID?{...x, Status:'COMPLETED'}:x)); setDetails({ ...details, Status: 'COMPLETED' }); } catch(e:any){ setError(e?.message||'No se pudo completar'); } finally { setSavingId(""); } })}>Completar</Button>
              )}
              <Button onClick={() => setDetails(null)}>Cerrar</Button>
            </Stack>
          </DialogActions>
        </Dialog>
        {!filtered.length && (
          <Typography color="text.secondary">No hay turnos para el filtro seleccionado.</Typography>
        )}
      </Stack>
    </div>
  );
}


