import { useEffect, useState } from "react";
import { listAppointments, AppointmentItem, updateAppointmentStatus } from "../services/appointments";
import { Paper, Typography, Stack, Chip, Divider, Button } from "@mui/material";
import { getProviderById, ServiceProvider } from "../services/providers";

export default function MyAppointments() {
  const [items, setItems] = useState<AppointmentItem[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [providersById, setProvidersById] = useState<Record<string, ServiceProvider>>({});
  const [savingId, setSavingId] = useState<string>("");

  useEffect(() => {
    listAppointments(1, 50)
      .then((r) => setItems(Array.isArray(r) ? r : []))
      .catch((e) => setError(e?.message || "Error cargando turnos"))
      .finally(() => setLoading(false));
  }, []);

  // Enriquecer con datos del proveedor (teléfono/email) cuando sea necesario
  useEffect(() => {
    const missingIds = Array.from(
      new Set(
        items
          .map((a) => a.UserProvider?.userId)
          .filter((id): id is string => !!id && !providersById[id])
      )
    );
    if (!missingIds.length) return;
    (async () => {
      try {
        const results = await Promise.allSettled(missingIds.map((id) => getProviderById(id)));
        const next: Record<string, ServiceProvider> = { ...providersById };
        results.forEach((res, idx) => {
          const id = missingIds[idx];
          if (res.status === "fulfilled" && res.value?.userId) {
            next[id] = res.value;
          }
        });
        setProvidersById(next);
      } catch {
        // silencioso
      }
    })();
  }, [items, providersById]);

  return (
    <div className="container mx-auto p-6">
      <Typography variant="h5" className="mb-3">Mis Turnos</Typography>
      {error && <Typography color="error" className="mb-2">{error}</Typography>}
      {loading && <Typography color="text.secondary">Cargando…</Typography>}
      <Stack spacing={2}>
        {items.map((a) => {
          const provId = a.UserProvider?.userId;
          const prov = provId ? providersById[provId] : undefined;
          return (
          <Paper key={a.AppointmentID} className="p-3">
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
              <Typography sx={{ minWidth: 140 }}>
                {new Date(a.AppointmentDate).toLocaleDateString()} {a.hour}
              </Typography>
              <Chip label={a.Status} color={a.Status === 'CONFIRMED' ? 'success' : a.Status === 'PENDING' ? 'warning' : a.Status === 'COMPLETED_PARTIAL' ? 'info' : a.Status === 'COMPLETED' ? 'default' : 'default'} />
              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
              <Typography color="text.secondary">{a.Category?.name || (a as any)?.category?.name || a.Category?.Name || ""}</Typography>
              <Typography>Proveedor: {a.UserProvider?.name || (a as any)?.UserProvider?.name || ''}</Typography>
              {prov && (
                <>
                  <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                  <Typography color="text.secondary">Tel: {prov.phone || '—'}</Typography>
                  <Typography color="text.secondary">Email: {prov.email || '—'}</Typography>
                </>
              )}
              <Typography color="text.secondary">Notas: {a.Notes}</Typography>
              <Stack direction="row" spacing={1} sx={{ marginLeft: 'auto' }}>
                {a.Status === 'COMPLETED_PARTIAL' && (
                  <Button size="small" variant="contained" color="primary" disabled={savingId===a.AppointmentID}
                    onClick={async () => {
                      setSavingId(a.AppointmentID);
                      try {
                        await updateAppointmentStatus(a.AppointmentID, 'COMPLETED');
                        setItems((prev)=>prev.map(x=>x.AppointmentID===a.AppointmentID?{...x, Status:'COMPLETED'}:x));
                      } catch(e:any){
                        setError(e?.message || 'No se pudo completar el turno');
                      } finally {
                        setSavingId("");
                      }
                    }}>Completar</Button>
                )}
              </Stack>
            </Stack>
          </Paper>
        );})}
        {!loading && !items.length && (
          <Typography color="text.secondary">No tienes turnos.</Typography>
        )}
      </Stack>
    </div>
  );
}


