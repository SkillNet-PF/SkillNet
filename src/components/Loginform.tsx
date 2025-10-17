import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Button, TextField, IconButton, InputAdornment, Alert, Typography, Box, Stack, Paper } from "@mui/material";
import { login, auth0RegisterUrl } from "../services/auth";
import { useAuthContext } from "../contexts/AuthContext";

function LoginForm() {
  const { setRole } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (Object.values(passwordChecks).includes(false)) {
      setError("La contraseña no cumple todos los requisitos.");
      return;
    }

    try {
      const res = await login(email, password);
      if (res.success) {
        setRole(res.role === "client" ? "user" : res.role);
        navigate("/");
      } else {
        setError("Credenciales inválidas. Intenta nuevamente.");
      }
    } catch {
      setError("Error al conectar con el servidor. Intenta nuevamente.");
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
              validatePassword(e.target.value);
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
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

         
          <Box className="mt-1 text-sm">
            <Typography color={passwordChecks.minLength ? "green" : "error"}>• Al menos 6 caracteres</Typography>
            <Typography color={passwordChecks.uppercase ? "green" : "error"}>• Una letra mayúscula</Typography>
            <Typography color={passwordChecks.lowercase ? "green" : "error"}>• Una letra minúscula</Typography>
            <Typography color={passwordChecks.number ? "green" : "error"}>• Un número</Typography>
            <Typography color={passwordChecks.specialChar ? "green" : "error"}>• Un carácter especial (!@#$%^&*...)</Typography>
          </Box>

          {error && (
            <Alert severity="error" variant="filled">
              {error}
            </Alert>
          )}

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Entrar
          </Button>

          <div className="grid grid-cols-2 gap-2">
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
                GitHub
              </span>
            </Button>
          </div>

          <Typography align="center" variant="body2" color="text.secondary" className="mt-2">
            ¿No tienes cuenta? <Link to="/register" className="text-blue-600 hover:underline">Crea una nueva</Link>
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
}

export default LoginForm;

