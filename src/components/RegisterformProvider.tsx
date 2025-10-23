"use client";

import React, { useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { registerProvider } from "../services/providers";
import { getCategories, CategoryDto } from "../services/categories";
import { auth0RegisterUrl, login } from "../services/auth";
import { useAuthContext } from "../contexts/AuthContext";

import {
  showLoading,
  closeLoading,
  alertSuccess,
  alertError,
} from "../ui/alerts";

// --- util
const DAYS = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];
const toSlotsCSV = (start: string, end: string, step = 60) => {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const pad = (n: number) => String(n).padStart(2, "0");
  const a = toMin(start);
  const b = toMin(end);
  if (isNaN(a) || isNaN(b) || a >= b) return "";
  const out: string[] = [];
  for (let t = a; t <= b; t += step) {
    out.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  }
  return out.join(",");
};

function RegisterformProvider() {
  const { refreshMe } = useAuthContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
    about: "",
  });

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordChecks, setPasswordChecks] = useState({
    minLength: true,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const toggleDay = (d: string) =>
    setSelectedDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setError("");
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

  const validate = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("Por favor completa todos los campos obligatorios.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(formData.email)) {
      setError("Por favor ingresa un correo electrónico válido.");
      return false;
    }
    if (Object.values(passwordChecks).includes(false)) {
      setError("La contraseña no cumple todos los requisitos.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return false;
    }
    if (!/^\+?\d{7,15}$/.test(formData.phone)) {
      setError("Por favor ingresa un número de teléfono válido.");
      return false;
    }
    if (!categoryId) {
      setError("Debes seleccionar una categoría.");
      return false;
    }
    if (!selectedDays.length) {
      setError("Selecciona al menos un día disponible.");
      return false;
    }
    const csv = toSlotsCSV(startTime, endTime, 60);
    if (!csv) {
      setError("Rango horario inválido (hora de inicio debe ser menor a fin).");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const horariosCSV = toSlotsCSV(startTime, endTime, 60);
    const catName =
      categories.find((c) => c.categoryId === categoryId)?.name || "";

    try {
      showLoading("Creando tu cuenta...");

      // El back espera 'category' por NOMBRE
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        birthDate: formData.birthDate,
        address: formData.address,
        phone: formData.phone,
        rol: "provider",
        // isActive lo setea el backend
        // serviceType omitido: lo define la categoría
        about: formData.about,
        days: selectedDays.join(","), // CSV
        horarios: horariosCSV, // CSV
        category: catName, // ← requerido por el back (nombre)
      } as const satisfies import("../services/types").ProviderRegisterRequest & {
        category: string;
      };

      const res = await registerProvider(payload as any);

      // Si el register no devuelve token, hacemos login
      let token =
        (res as any)?.accessToken || (res as any)?.data?.accessToken || "";
      if (!token) {
        const loginRes = await login(formData.email, formData.password);
        token =
          (loginRes as any)?.accessToken ||
          (loginRes as any)?.data?.accessToken ||
          "";
      }

      if (token) {
        localStorage.setItem("accessToken", token);
        await refreshMe();
      }

      await alertSuccess(
        "¡Registro de proveedor completado!",
        "Tu cuenta fue creada correctamente."
      );
      navigate("/perfil", { replace: true });
    } catch (err: any) {
      const msg =
        err?.userMessage ||
        err?.response?.data?.message ||
        "No pudimos completar el registro. Inténtalo más tarde.";
      setError(String(msg));
      await alertError("Registro", String(msg));
    } finally {
      closeLoading();
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
                    onClick={() => setShowPassword((s) => !s)}
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

          {/* Reglas */}
          <Box className="mt-1 text-sm">
            <Typography color={passwordChecks.minLength ? "green" : "error"}>
              • Al menos 6 caracteres
            </Typography>
            <Typography color={passwordChecks.uppercase ? "green" : "error"}>
              • Una letra mayúscula
            </Typography>
            <Typography color={passwordChecks.lowercase ? "green" : "error"}>
              • Una letra minúscula
            </Typography>
            <Typography color={passwordChecks.number ? "green" : "error"}>
              • Un número
            </Typography>
            <Typography color={passwordChecks.specialChar ? "green" : "error"}>
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
                    onClick={() => setShowConfirmPassword((s) => !s)}
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

          {/* Categoría (de la tabla) */}
          <TextField
            select
            label="Categoría"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            fullWidth
            required
          >
            <MenuItem value="">Selecciona una categoría</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.categoryId} value={c.categoryId}>
                {c.name}
              </MenuItem>
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

          {/* Días */}
          <Box>
            <Typography variant="subtitle2" className="mb-1">
              Días disponibles
            </Typography>
            <FormGroup row>
              {DAYS.map((d) => (
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

          {/* Rango horario */}
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

          <div className="grid grid-cols-1 gap-2 pt-1">
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
          </div>
        </Stack>
      </Box>
    </Paper>
  );
}

export default RegisterformProvider;
