"use client";

import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Box, Stack, TextField, Button, IconButton, InputAdornment, MenuItem, Alert, Typography, Paper } from "@mui/material";
import { registerProvider } from "../services/providers";
import { auth0RegisterUrl } from "../services/auth";
<<<<<<< HEAD
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
=======
>>>>>>> 122112d (front config)

function RegisterformProvider() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
    serviceType: "",
    about: "",
    days: "",
    horarios: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!formData.serviceType) {
      setError("Debes seleccionar un tipo de servicio.");
      return;
    }

    if (!formData.phone.match(/^\+?\d{7,15}$/)) {
      setError("Por favor ingresa un número de teléfono válido.");
      return;
    }

    if (!formData.days || !formData.horarios) {
      setError("Debes completar los días y horarios de disponibilidad.");
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
        isActive: true, // Los nuevos proveedores están activos por defecto
        serviceType: formData.serviceType,
        about: formData.about,
        days: formData.days,
        horarios: formData.horarios,
      });
      localStorage.setItem("accessToken", res.accessToken);
      alert("Registro de proveedor completado ✅");
<<<<<<< HEAD

      navigate("DashboardProvider");
=======
      // Redirigir al dashboard o página de éxito
>>>>>>> 122112d (front config)
    } catch (err: any) {
      setError(err?.message || "Error registrando proveedor");
    }
  };

  return (
    <Paper elevation={8} className="p-8 rounded-2xl shadow-lg max-w-md mx-auto">
      <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" color="success.main" align="center" className="mb-2">Registro de Proveedor</Typography>

      {error && (
        <Alert severity="error" className="mb-3">{error}</Alert>
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
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

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
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
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

        <TextField
          select
          name="serviceType"
          label="Tipo de servicio"
          value={formData.serviceType}
          onChange={handleChange}
          fullWidth
          required
        >
          <MenuItem value="">Selecciona tu servicio</MenuItem>
          <MenuItem value="plomeria">Plomería</MenuItem>
          <MenuItem value="electricidad">Electricidad</MenuItem>
          <MenuItem value="carpinteria">Carpintería</MenuItem>
          <MenuItem value="otros">Otros</MenuItem>
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

        <TextField
          name="days"
          label="Días disponibles"
          placeholder="ej: lunes,martes,miercoles"
          value={formData.days}
          onChange={handleChange}
          fullWidth
          required
        />

        <TextField
          name="horarios"
          label="Horarios disponibles"
          placeholder="ej: 09:00,18:00"
          value={formData.horarios}
          onChange={handleChange}
          fullWidth
          required
        />

        <Button type="submit" variant="contained" color="success" fullWidth>
          Registrarse como Proveedor
        </Button>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button component="a" href={auth0RegisterUrl("provider", "google-oauth2")} variant="outlined" color="inherit">
            <span className="flex items-center gap-2">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Continuar con Google
            </span>
          </Button>
          <Button component="a" href={auth0RegisterUrl("provider", "github")} variant="outlined" color="inherit">
            <span className="flex items-center gap-2">
              <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="w-5 h-5" />
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
