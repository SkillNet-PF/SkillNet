import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Paper, Stack, TextField, MenuItem, Button, Alert, Typography, Chip, Card, CardContent, CardActionArea, Divider, FormGroup, FormControlLabel, Checkbox, Collapse, Avatar } from "@mui/material";
import { getAllProviders, ServiceProvider } from "../services/providers";
import { getCategories, CategoryDto } from "../services/categories";
import { createAppointment, getBookedHours } from "../services/appointments";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";

export default function RequestAppointment() {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [filters, setFilters] = useState({
    q: "",
    category: "",
    days: [] as string[],
    timeStart: "",
    timeEnd: "",
  });

  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  // const [selectedDay, setSelectedDay] = useState<string>(""); // Temporalmente no usado
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [bookedHours, setBookedHours] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [expandedProviderId, setExpandedProviderId] = useState<string | null>(null);

  // Obtener parámetros de URL
  const providerParam = searchParams.get('provider');
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  useEffect(() => {
    async function load() {
      try {
        // 1) Traer proveedores primero
        const provs = (await getAllProviders().then((r) =>
          (Array.isArray(r as any) ? (r as any) : (r as any).providers || [])
        )) as ServiceProvider[];
        setProviders(provs);

        // 2) Intentar categorías. Si falla o no es JSON, derivar desde proveedores
        try {
          const cats = await getCategories();
          setCategories(cats);
        } catch (err) {
          const unique = Array.from(
            new Set(
              provs
                .map((p: ServiceProvider) => p.category?.name || p.serviceType)
                .filter(Boolean) as string[]
            )
          );
          setCategories(
            unique.map((name, i) => ({ categoryId: String(i + 1), name }))
          );
          // No mostrar error al usuario; solo log para depurar
          console.warn("/categories fallback: derivado desde providers", err);
        }

        // 3) Preseleccionar proveedor si viene en la URL
        if (providerParam) {
          const provider = provs.find(p => p.userId === providerParam);
          if (provider) {
            setSelectedProvider(provider);
            setExpandedProviderId(provider.userId);
          }
        }

        // 4) Preseleccionar categoría si viene en la URL
        if (categoryParam) {
          setFilters(prev => ({ ...prev, category: categoryParam }));
        }

        // 5) Preseleccionar búsqueda si viene en la URL
        if (searchParam) {
          setFilters(prev => ({ ...prev, q: searchParam }));
        }

      } catch (e: any) {
        setError(e?.message || "Error cargando datos");
      } finally {
        // no-op
      }
    }
    load();
  }, [providerParam, categoryParam, searchParam]);

  // Load booked hours when provider or date changes
  useEffect(() => {
    async function loadBooked() {
      try {
        if (!selectedProvider || !selectedDate) {
          setBookedHours([]);
          return;
        }
        const yyyyMMdd = selectedDate.format("YYYY-MM-DD");
        const list = await getBookedHours(selectedProvider.userId, yyyyMMdd);
        setBookedHours(list || []);
      } catch (e) {
        setBookedHours([]);
      }
    }
    loadBooked();
  }, [selectedProvider, selectedDate]);

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
    if (filters.days && filters.days.length) {
      arr = arr.filter((p) => {
        const dias = p.dias || [];
        return filters.days.every((d) => dias.includes(d));
      });
    }
    if (filters.timeStart || filters.timeEnd) {
      const toMin = (hhmm: string) => {
        const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
        return h * 60 + m;
      };
      const startMin = filters.timeStart ? toMin(filters.timeStart) : undefined;
      const endMin = filters.timeEnd ? toMin(filters.timeEnd) : undefined;
      arr = arr.filter((p) => {
        const horas = (p.horarios || []);
        return horas.some((h) => {
          const v = toMin(h);
          if (startMin !== undefined && v < startMin) return false;
          if (endMin !== undefined && v > endMin) return false;
          return true;
        });
      });
    }
    return arr;
  }, [providers, filters]);

  // Temporalmente no usado
  // const getSpanishWeekday = (date: Dayjs | string) => {
  //   if (!date) return "";
  //   const d = typeof date === "string" ? new Date(date) : date.toDate();
  //   const idx = d.getDay(); // 0=Dom
  //   const names = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  //   return names[idx];
  // };

  // Temporalmente no usado
  // const isFutureDate = (date: Dayjs | string) => {
  //   if (!date) return false;
  //   const d = typeof date === "string" ? new Date(date) : date.toDate();
  //   const today = new Date();
  //   // Comparar solo por fecha (ignorar hora)
  //   d.setHours(0,0,0,0);
  //   today.setHours(0,0,0,0);
  //   return d.getTime() > today.getTime();
  // };

  const validateSelection = (): string | null => {
    if (!selectedProvider) return "Selecciona un proveedor";
    if (!selectedDate) return "Selecciona una fecha";
    if (!selectedHour) return "Selecciona un horario";
    if (!notes.trim()) return "Debes completar las notas";
    // Temporalmente deshabilitadas todas las validaciones de fecha/horario para permitir creación
    // if (!isFutureDate(selectedDate)) return "La fecha del turno debe ser posterior a la fecha actual";
    // if (!selectedProvider.category?.name && !filters.category) return "El proveedor no tiene categoría. Selecciona uno con categoría";
    // const wd = getSpanishWeekday(selectedDate);
    // if (selectedDay && selectedDay !== wd) return `El día seleccionado (${selectedDay}) no coincide con la fecha (${wd})`;
    // if (selectedProvider.dias && selectedProvider.dias.length && !selectedProvider.dias.includes(wd)) {
    //   return `El proveedor atiende en: ${selectedProvider.dias.join(", ")}. La fecha elegida es ${wd}.`;
    // }
    // if (selectedProvider.horarios && selectedProvider.horarios.length && !selectedProvider.horarios.includes(selectedHour)) {
    //   return `El horario debe ser uno de: ${selectedProvider.horarios.join(", ")}`;
    // }
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
        category: filters.category || selectedProvider?.category?.name || "",
        provider: selectedProvider!.name,
        appointmentDate: selectedDate!.startOf("day").toDate().toISOString(),
        hour: selectedHour,
        notes: notes.trim(),
      });
      setSuccess("Turno solicitado. Quedó en estado pendiente.");
      setExpandedProviderId(null);
      setSelectedProvider(null);
      // setSelectedDay(""); // Temporalmente no usado
      setSelectedDate(null);
      setSelectedHour("");
      setNotes("");
    } catch (e: any) {
      setError(e?.message || "Error creando turno");
    }
  };

  return (
    <Box className="max-w-6xl mx-auto p-4">
      <Paper elevation={8} className="p-3 rounded-2xl mb-2">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <TextField
            name="q"
            label="Buscar"
            placeholder="Nombre, servicio, categoría"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            fullWidth
          />
          <Button
            variant="outlined"
            onClick={() => setFiltersOpen(!filtersOpen)}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            {filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        </Stack>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(260px, 320px) 1fr' }, gap: 2, alignItems: 'start' }}>
      {/* Filtros */}
      <Box sx={{ display: { xs: filtersOpen ? 'block' : 'none', md: 'block' } }}>
        <Paper variant="outlined" className="p-3 rounded-xl" sx={{ position: { md: 'sticky' as const }, top: { md: 16 } }}>
          <Typography variant="subtitle1" className="mb-2">Filtros</Typography>
          <Stack spacing={2}>
            <TextField
              select
              name="category"
              label="Categoría"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              fullWidth
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.categoryId} value={c.name}>{c.name}</MenuItem>
              ))}
            </TextField>
            <Box>
              <Typography variant="subtitle2" className="mb-1">Días disponibles</Typography>
              <FormGroup>
                { ["lunes","martes","miércoles","jueves","viernes","sábado","domingo"].map((d) => (
                  <FormControlLabel key={d}
                    control={<Checkbox checked={filters.days.includes(d)} onChange={(e) => {
                      const checked = e.target.checked;
                      setFilters((f) => ({
                        ...f,
                        days: checked ? [...f.days, d] : f.days.filter((x) => x !== d),
                      }));
                    }} />}
                    label={d}
                  />
                ))}
              </FormGroup>
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-1">Rango horario</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField type="time" label="Desde" value={filters.timeStart}
                  onChange={(e) => setFilters({ ...filters, timeStart: e.target.value })}
                  InputLabelProps={{ shrink: true }} fullWidth />
                <TextField type="time" label="Hasta" value={filters.timeEnd}
                  onChange={(e) => setFilters({ ...filters, timeEnd: e.target.value })}
                  InputLabelProps={{ shrink: true }} fullWidth />
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" fullWidth onClick={() => setFilters({ q: filters.q, category: "", days: [], timeStart: "", timeEnd: "" })}>Limpiar</Button>
              <Button
                variant="text"
                onClick={() => setFiltersOpen(false)}
                sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              >Cerrar</Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* Columna principal: listado 1 por fila */}
      <Box>
        <Stack spacing={2}>
          {filteredProviders.map((p) => (
            <Card key={p.userId} variant="outlined">
              <CardActionArea onClick={() => {
                const isSame = expandedProviderId === p.userId;
                setExpandedProviderId(isSame ? null : p.userId);
                setSelectedProvider(isSame ? null : p);
                // setSelectedDay(""); // Temporalmente no usado
                setSelectedHour("");
                setSelectedDate(null);
                setError("");
                setSuccess("");
              }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={p.imgProfile || undefined} sx={{ width: 48, height: 48 }}>
                      {p.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{p.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {p.category?.name || "Sin categoría"}
                      </Typography>
                    </Box>
                  </Stack>
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
              <Collapse in={expandedProviderId === p.userId} timeout="auto" unmountOnExit>
                <Divider />
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                  <CardContent>
                    {error && <Alert severity="error" className="mb-2">{error}</Alert>}
                    {success && <Alert severity="success" className="mb-2">{success}</Alert>}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} className="mb-2">
                      
                      {
                        <DatePicker
                          label="Fecha"
                          value={selectedDate}
                          onChange={(newValue) => {
                            console.log("🧭 Valor emitido por DatePicker:", newValue);
                            setSelectedDate(newValue);
                          }}
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      /* <DatePicker
                        label="Fecha"
                        value={selectedDate}
                        onChange={(newValue) => {            
                          setSelectedDate(newValue);
                          // if (newValue) {
                          //   const names = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
                          //   setSelectedDay(names[newValue.day()]);                        
                          // } else {
                          //   setSelectedDay("");
                          // }
                        }}
                        onError={() => null}
                        slotProps={{ textField: { fullWidth: true } }}
                      /> */}
                      <TextField
                        select
                        label="Horario"
                        value={selectedHour}
                        onChange={(e) => setSelectedHour(e.target.value)}
                        sx={{ minWidth: 160 }}
                        disabled={!selectedDate}
                      >
                        {(p.horarios || []).map((h) => (
                          <MenuItem key={h} value={h} disabled={bookedHours.includes(h)}>
                            {h}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Stack>
                    <TextField
                      label="Descripción"
                      placeholder="Detalle del servicio"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      fullWidth
                      multiline
                      minRows={2}
                      className="mb-2"
                    />
                    <Stack direction="row" spacing={2}>
                      <Button variant="outlined" onClick={() => setExpandedProviderId(null)}>Cancelar</Button>
                      <Button variant="contained" color="success" onClick={handleCreate} disabled={!selectedDate || !selectedHour || !notes.trim()}>
                        Crear turno
                      </Button>
                    </Stack>
                  </CardContent>
                </LocalizationProvider>
              </Collapse>
            </Card>
          ))}
          {!filteredProviders.length && (
            <Typography align="center" color="text.secondary">No hay proveedores para los filtros seleccionados.</Typography>
          )}
        </Stack>
      </Box>
      </Box>
    </Box>
  );
}


