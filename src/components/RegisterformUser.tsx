"use client";

import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  Box,
  Stack,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Typography,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../services/clients";
import { auth0RegisterUrl } from "../services/auth";

// SweetAlert2 helpers (tuyos)
import {
  showLoading,
  closeLoading,
  alertSuccess,
  alertError,
} from "../ui/alerts";

function RegisterformUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validaciones dinámicas de contraseña
  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const msg = "Por favor completa todos los campos obligatorios.";
      setError(msg);
      alertError("Validación", msg);
      return false;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRe.test(formData.email)) {
      const msg = "Por favor ingresa un correo electrónico válido.";
      setError(msg);
      alertError("Correo inválido", msg);
      return false;
    }

    if (formData.password.length < 6) {
      const msg = "La contraseña debe tener al menos 6 caracteres.";
      setError(msg);
      alertError("Contraseña débil", msg);
      return false;
    }

    if (Object.values(passwordChecks).includes(false)) {
      const msg = "La contraseña no cumple todos los requisitos.";
      setError(msg);
      alertError("Contraseña inválida", msg);
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      const msg = "Las contraseñas no coinciden.";
      setError(msg);
      alertError("Validación", msg);
      return false;
    }

    if (!/^\+?\d{7,15}$/.test(formData.phone)) {
      const msg = "Por favor ingresa un número de teléfono válido.";
      setError(msg);
      alertError("Teléfono inválido", msg);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      showLoading("Creando tu cuenta...");

      const res = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        birthDate: formData.birthDate,
        address: formData.address,
        phone: formData.phone,
        rol: "client",
      });

      // Guarda token si viene
      const token =
        (res as any)?.accessToken || (res as any)?.data?.accessToken;
      if (token) localStorage.setItem("accessToken", token);

      await alertSuccess(
        "¡Registro completado!",
        "Tu cuenta de usuario fue creada correctamente."
      );
      navigate("/DashboardUser"); // respeta tu flujo
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
          color="primary"
          align="center"
          className="mb-2"
        >
          Registro de Usuario
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

          {/* Indicadores de contraseña */}
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
                    aria-label="toggle password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Registrarse
          </Button>

          {/* Auth por terceros (tuyo) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              component="a"
              href={auth0RegisterUrl("client", "google-oauth2")}
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
              href={auth0RegisterUrl("client", "github")}
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

export default RegisterformUser;
