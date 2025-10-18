import { useEffect, useMemo, useState } from "react";
import { Box, Paper, Stack, TextField, MenuItem, Button, Alert, Typography, Chip, Grid, Card, CardContent, CardActionArea, Divider } from "@mui/material";
import { getAllProviders, ServiceProvider } from "../services/providers";
import { getCategories, CategoryDto } from "../services/categories";
import { createAppointment } from "../services/appointments";

export default function RequestAppointment() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [filters, setFilters] = useState({
    q: "",
    category: "",
  });

  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        // 1) Traer proveedores primero
        const provs = await getAllProviders().then((r) =>
          (Array.isArray(r as any) ? (r as any) : (r as any).providers || [])
        );
        setProviders(provs);

        // 2) Intentar categorías. Si falla o no es JSON, derivar desde proveedores
        try {
          const cats = await getCategories();
          setCategories(cats);
        } catch (err) {
          const unique = Array.from(
            new Set(
              provs
                .map((p) => p.category?.name || p.serviceType)
                .filter(Boolean) as string[]
            )
          );
          setCategories(
            unique.map((name, i) => ({ categoryId: String(i + 1), name }))
          );
          // No mostrar error al usuario; solo log para depurar
          console.warn("/categories fallback: derivado desde providers", err);
        }
      } catch (e: any) {
        setError(e?.message || "Error cargando datos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filtros simplificados: solo texto y categoría

  const filteredProviders = useMemo(() => {
    let arr = providers;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      arr = arr.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.serviceType?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q)
      );
    }
    if (filters.category) {
      arr = arr.filter((p) => p.category?.name === filters.category);
    }
    return arr;
  }, [providers, filters]);

  const getSpanishWeekday = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const idx = d.getDay(); // 0=Dom
    const names = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
    return names[idx];
  };

  const validateSelection = (): string | null => {
    if (!selectedProvider) return "Selecciona un proveedor";
    if (!selectedDate) return "Selecciona una fecha";
    if (!selectedHour) return "Selecciona un horario";
    const wd = getSpanishWeekday(selectedDate);
    if (selectedProvider.dias && selectedProvider.dias.length && !selectedProvider.dias.includes(wd)) {
      return `El proveedor atiende en: ${selectedProvider.dias.join(", ")}. La fecha elegida es ${wd}.`;
    }
    if (selectedProvider.horarios && selectedProvider.horarios.length && !selectedProvider.horarios.includes(selectedHour)) {
      return `El horario debe ser uno de: ${selectedProvider.horarios.join(", ")}`;
    }
    return null;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const err = validateSelection();
    if (err) {
      setError(err);
      return;
    }
    try {
      await createAppointment({
        category: filters.category || selectedProvider?.category?.name || selectedProvider?.serviceType || "",
        provider: selectedProvider!.name,
        appointmentDate: new Date(selectedDate).toISOString(),
        hour: selectedHour,
        notes: notes || "",
      });
      setSuccess("Turno solicitado. Quedó en estado pendiente.");
      setSelectedProvider(null);
      setSelectedDay("");
      setSelectedDate("");
      setSelectedHour("");
      setNotes("");
    } catch (e: any) {
      setError(e?.message || "Error creando turno");
    }
  };

  return (
    <Stack spacing={3} className="max-w-6xl mx-auto p-4">
      <Paper elevation={8} className="p-4 rounded-2xl">
        <Typography variant="h5" className="mb-2" color="primary">Solicitar Turno</Typography>
        {error && <Alert severity="error" className="mb-3">{error}</Alert>}
        {success && <Alert severity="success" className="mb-3">{success}</Alert>}
        {/* Filtros */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} className="mb-3">
          <TextField
            name="q"
            label="Buscar"
            placeholder="Nombre, servicio, categoría"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            fullWidth
          />
          <TextField
            select
            name="category"
            label="Categoría"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.categoryId} value={c.name}>{c.name}</MenuItem>
            ))}
          </TextField>
          <Button variant="text" onClick={() => setFilters({ q: "", category: "" })}>Limpiar</Button>
        </Stack>
        <Divider className="mb-3" />

        {/* Grid de proveedores */}
        <Grid container spacing={2}>
          {filteredProviders.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p.userId}>
              <Card variant="outlined">
                <CardActionArea onClick={() => { setSelectedProvider(p); setSelectedDay(""); setSelectedHour(""); setSelectedDate(""); }}>
                  <CardContent>
                    <Typography variant="h6">{p.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{p.serviceType}{p.category?.name ? ` • ${p.category.name}` : ""}</Typography>
                    <Stack direction="row" spacing={1} className="mt-2 flex-wrap">
                      {(p.dias || []).slice(0, 4).map((d) => (
                        <Chip key={d} label={d} size="small" />
                      ))}
                    </Stack>
                    <Stack direction="row" spacing={1} className="mt-2 flex-wrap">
                      {(p.horarios || []).slice(0, 4).map((h) => (
                        <Chip key={h} label={h} size="small" color="primary" variant="outlined" />
                      ))}
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
          {!filteredProviders.length && (
            <Grid item xs={12}><Typography align="center" color="text.secondary">No hay proveedores para los filtros seleccionados.</Typography></Grid>
          )}
        </Grid>
      </Paper>

      {/* Panel de selección de fecha/horario */}
      {selectedProvider && (
        <Paper elevation={8} className="p-4 rounded-2xl">
          <Typography variant="h6" className="mb-2">Proveedor seleccionado: {selectedProvider.name}</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} className="mb-2">
            <TextField
              select
              label="Día"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              {(selectedProvider.dias || []).map((d) => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Fecha"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Horario"
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              {(selectedProvider.horarios || []).map((h) => (
                <MenuItem key={h} value={h}>{h}</MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField
            label="Notas"
            placeholder="Detalles adicionales"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            className="mb-2"
          />
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => setSelectedProvider(null)}>Cancelar</Button>
            <Button variant="contained" color="success" onClick={handleCreate}>Crear turno</Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}


