"use client";

import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Box, Stack, TextField, Button, IconButton, InputAdornment, MenuItem, Alert, Typography, Paper } from "@mui/material";
import { registerUser } from "../services/clients";
import { auth0RegisterUrl } from "../services/auth";

function RegisterformUser() {
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
    subscription: "",
    paymentMethod: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    setFormData({ ...formData, [name]: value });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas

    if (Object.values(passwordChecks).includes(false)) {
      setError("La contraseña no cumple todos los requisitos.");
      return;
    }

    
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }


    if (!formData.subscription) {
      setError("Debes seleccionar una membresía.");
      return;
    }

    if (!formData.paymentMethod) {
      setError("Debes seleccionar un método de pago.");
      return;
    }


    if (!formData.phone.match(/^\+?\d{7,15}$/)) {
      setError("Por favor ingresa un número de teléfono válido.");
      return;
    }


    try {
      const res = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        birthDate: formData.birthDate,
        address: formData.address,
        phone: formData.phone,
        rol: "client",
        paymentMethod: formData.paymentMethod,
        subscription: formData.subscription,
      });



      localStorage.setItem("accessToken", res.accessToken);
      alert("Registro de usuario completado ✅");
    } catch (err: any) {
      setError(err?.message || "Error registrando usuario");
    }
  };



  return (
    <Paper elevation={8} className="p-8 rounded-2xl shadow-lg max-w-md mx-auto">
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" color="primary" align="center" className="mb-2">
          Registro de Usuario
        </Typography>

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

          {/* ✅ Validaciones en tiempo real */}
          <Box className="mt-1 text-sm">
            <Typography color={passwordChecks.minLength ? "green" : "error"}>• Al menos 6 caracteres</Typography>
            <Typography color={passwordChecks.uppercase ? "green" : "error"}>• Una letra mayúscula</Typography>
            <Typography color={passwordChecks.lowercase ? "green" : "error"}>• Una letra minúscula</Typography>
            <Typography color={passwordChecks.number ? "green" : "error"}>• Un número</Typography>
            <Typography color={passwordChecks.specialChar ? "green" : "error"}>• Un carácter especial (!@#$%^&*...)</Typography>
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
            name="subscription"
            label="Plan"
            value={formData.subscription}
            onChange={handleChange}
            fullWidth
            required
          >
            <MenuItem value="">Selecciona un plan</MenuItem>
            <MenuItem value="basic">Básico</MenuItem>
            <MenuItem value="standard">Estándar</MenuItem>
            <MenuItem value="premium">Premium</MenuItem>
          </TextField>

          <TextField
            select
            name="paymentMethod"
            label="Método de pago"
            value={formData.paymentMethod}
            onChange={handleChange}
            fullWidth
            required
          >
            <MenuItem value="">Selecciona método de pago</MenuItem>
            <MenuItem value="tarjeta_credito">Tarjeta de Crédito</MenuItem>
            <MenuItem value="paypal">PayPal</MenuItem>
            <MenuItem value="transferencia">Transferencia Bancaria</MenuItem>
          </TextField>

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Registrarse
          </Button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button component="a" href={auth0RegisterUrl("client", "google-oauth2")} variant="outlined" color="inherit">
              <span className="flex items-center gap-2">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Continuar con Google
              </span>
            </Button>
            <Button component="a" href={auth0RegisterUrl("client", "github")} variant="outlined" color="inherit">
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

export default RegisterformUser;

