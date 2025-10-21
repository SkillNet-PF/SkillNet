"use client";

import React, { useState } from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Alert,
  Typography,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { registerProvider } from "../services/providers";
import { getCategories, CategoryDto } from "../services/categories";
import { auth0RegisterUrl } from "../services/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function RegisterformProvider() {
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
    about: "",
    days: "",
    horarios: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("18:00");

  // ✅ Estado para validación dinámica de contraseña
  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const navigate = useNavigate();

  React.useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const generateTimeSlotsCSV = (from: string, to: string, stepMinutes = 60) => {
    // Convierte HH:mm a minutos
    const toMinutes = (hhmm: string) => {
      const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
      return h * 60 + m;
    };
    const pad = (n: number) => String(n).padStart(2, "0");
    const fromMin = toMinutes(from);
    const toMin = toMinutes(to);
    if (isNaN(fromMin) || isNaN(toMin) || fromMin >= toMin) return "";
    const slots: string[] = [];
    for (let t = fromMin; t <= toMin; t += stepMinutes) {
      const h = Math.floor(t / 60);
      const m = t % 60;
      slots.push(`${pad(h)}:${pad(m)}`);
    }
    return slots.join(",");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");

    // Validación dinámica del password
    if (name === "password") {
      setPasswordChecks({
        minLength: value.length >= 6,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🚫 Validación final antes del envío
    if (Object.values(passwordChecks).includes(false)) {
      setError("La contraseña no cumple todos los requisitos.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // serviceType deja de ser obligatorio: lo deriva la categoría

    if (!formData.phone.match(/^\+?\d{7,15}$/)) {
      setError("Por favor ingresa un número de teléfono válido.");
      return;
    }

    if (!selectedDays.length) {
      setError("Selecciona al menos un día disponible.");
      return;
    }

    if (!categoryId) {
      setError("Debes seleccionar una categoría.");
      return;
    }

    const horariosCSV = generateTimeSlotsCSV(startTime, endTime, 60);
    if (!horariosCSV) {
      setError("Rango horario inválido (hora de inicio debe ser menor a fin).");
      return;
    }

    try {
      const res = await registerProvider({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        birthDate: formData.birthDate,
        address: formData.address,
        phone: formData.phone,
        rol: "provider",
        isActive: true,
        // serviceType omitido: la categoría define el tipo
        about: formData.about,
        days: selectedDays.join(","),
        horarios: horariosCSV,
        categoryId,
      });
      localStorage.setItem("accessToken", res.accessToken);
      alert("Registro de proveedor completado ✅");
      navigate("/perfil");
    } catch (err: any) {
      setError(err?.message || "Error registrando proveedor");
    }
  };

  return (
    <Paper elevation={8} className="p-8 rounded-2xl shadow-lg max-w-md mx-auto">
      <Box component="form" onSubmit={handleSubmit}>
        <Typography
          variant="h5"
          color="success.main"
          align="center"
          className="mb-2"
        >
          Registro de Proveedor
        </Typography>

        {error && (
          <Alert severity="error" className="mb-3">
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            name="name"
            label="Nombre completo"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            name="birthDate"
            label="Fecha de nacimiento"
            type="date"
            value={formData.birthDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            name="email"
            type="email"
            label="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            name="password"
            type={showPassword ? "text" : "password"}
            label="Contraseña"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* ✅ Validaciones dinámicas del password */}
          <Box className="mt-1 text-sm">
            <Typography
              color={passwordChecks.minLength ? "green" : "error"}
            >
              • Al menos 6 caracteres
            </Typography>
            <Typography
              color={passwordChecks.uppercase ? "green" : "error"}
            >
              • Una letra mayúscula
            </Typography>
            <Typography
              color={passwordChecks.lowercase ? "green" : "error"}
            >
              • Una letra minúscula
            </Typography>
            <Typography
              color={passwordChecks.number ? "green" : "error"}
            >
              • Un número
            </Typography>
            <Typography
              color={passwordChecks.specialChar ? "green" : "error"}
            >
              • Un carácter especial (!@#$%^&*...)
            </Typography>
          </Box>

          <TextField
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            label="Confirmar contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    edge="end"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            name="address"
            label="Dirección"
            value={formData.address}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            name="phone"
            label="Teléfono"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            required
          />

          {/* Campo "Tipo de servicio" eliminado: la categoría del admin define el tipo */}

          <TextField
            select
            name="categoryId"
            label="Categoría"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            fullWidth
            required
          >
            <MenuItem value="">Selecciona una categoría</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.categoryId} value={c.categoryId}>{c.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            name="about"
            label="Sobre tu servicio"
            placeholder="Cuéntanos sobre tu servicio (experiencia, herramientas, etc.)"
            value={formData.about}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={3}
            required
          />

          <Box>
            <Typography variant="subtitle2" className="mb-1">Días disponibles</Typography>
            <FormGroup row>
              {[
                "lunes",
                "martes",
                "miércoles",
                "jueves",
                "viernes",
                "sábado",
                "domingo",
              ].map((d) => (
                <FormControlLabel
                  key={d}
                  control={
                    <Checkbox
                      checked={selectedDays.includes(d)}
                      onChange={() => toggleDay(d)}
                    />
                  }
                  label={d}
                />
              ))}
            </FormGroup>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              type="time"
              label="Hora inicio"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="time"
              label="Hora fin"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <Button type="submit" variant="contained" color="success" fullWidth>
            Registrarse como Proveedor
          </Button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              component="a"
              href={auth0RegisterUrl("provider", "google-oauth2")}
              variant="outlined"
              color="inherit"
            >
              <span className="flex items-center gap-2">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Continuar con Google
              </span>
            </Button>
            <Button
              component="a"
              href={auth0RegisterUrl("provider", "github")}
              variant="outlined"
              color="inherit"
            >
              <span className="flex items-center gap-2">
                <img
                  src="https://www.svgrepo.com/show/512317/github-142.svg"
                  alt="GitHub"
                  className="w-5 h-5"
                />
                Continuar con GitHub
              </span>
            </Button>
          </div>
        </Stack>
      </Box>
    </Paper>
  );
}

export default RegisterformProvider;