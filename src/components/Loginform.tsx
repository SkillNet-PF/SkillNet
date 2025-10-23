import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  Button,
  TextField,
  IconButton,
  InputAdornment,
  Alert,
  Typography,
  Box,
  Stack,
  Paper,
} from "@mui/material";
import { login, auth0RegisterUrl } from "../services/auth";
import { useAuthContext } from "../contexts/AuthContext";

// SweetAlert2 helpers (merge de ambas ramas)
import { showLoading, closeLoading, alertError, toast } from "../ui/alerts";

function LoginForm() {
  const { refreshMe } = useAuthContext(); // usar /auth/me tras login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Indicadores (solo UI, no bloquean el submit)
  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const validatePassword = (pwd: string) => {
    setPasswordChecks({
      minLength: pwd.length >= 6,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validaciones básicas
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRe.test(email)) {
      const msg = "Por favor ingresa un correo electrónico válido.";
      setError(msg);
      await alertError("Correo inválido", msg);
      return;
    }
    if (!password) {
      const msg = "Ingresa tu contraseña.";
      setError(msg);
      await alertError("Campo requerido", msg);
      return;
    }

    try {
      showLoading("Iniciando sesión...");
      const res = await login(email, password);

      // Intentos de encontrar el token en diferentes formas de respuesta
      const token =
        (res as any)?.accessToken ||
        (res as any)?.data?.accessToken ||
        (res as any)?.token ||
        "";

      if (!token) {
        closeLoading();
        await alertError("Login", "No se recibió token de autenticación.");
        return;
      }

      // Guarda token y refresca el contexto con /auth/me
      localStorage.setItem("accessToken", token);
      await refreshMe();

      closeLoading();
      toast("Sesión iniciada", "success");

      // Enruta al router centralizado por rol
      navigate("/perfil", { replace: true });
    } catch (err: any) {
      closeLoading();
      const msg =
        err?.userMessage || "No pudimos iniciar sesión. Inténtalo nuevamente.";
      setError(msg);
      await alertError("Error de inicio de sesión", msg);
    }
  };

  return (
    <Paper elevation={8} className="shadow-xl rounded-2xl p-8 w-full max-w-md">
      <Typography variant="h4" color="primary" align="center" className="mb-6">
        Iniciar Sesión
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            id="email"
            type="email"
            label="Correo electrónico"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />

          <TextField
            id="password"
            type={showPassword ? "text" : "password"}
            label="Contraseña"
            placeholder="********"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value); // solo UI
            }}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    title={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
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

          {/* Indicadores visuales (no bloquean login) */}
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

          {error && (
            <Alert severity="error" variant="filled">
              {error}
            </Alert>
          )}

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Entrar
          </Button>

          {/* OAuth CLIENTE (solo Google) */}
          <div className="grid grid-cols-1 gap-2">
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
                Google
              </span>
            </Button>
          </div>

          <Typography
            align="center"
            variant="body2"
            color="text.secondary"
            className="mt-2"
          >
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Crea una nueva
            </Link>
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
}

export default LoginForm;
