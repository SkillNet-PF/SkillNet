// src/components/NavbarUser.tsx
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Container,
} from "@mui/material";
import { FaUserCircle, FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";
import { useAuthContext } from "../contexts/AuthContext";
import { useThemeMode } from "../ui";

function NavbarUser() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();

  const handleLogout = () => {
    // ✅ marca logout intencional y limpia sesión
    logout();
    // ✅ navega directo a /login (sin Link) y reemplaza el historial
    navigate("/login", { replace: true });
  };

  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: 64, gap: 2 }}>
          <Typography
            component={Link}
            to="/"
            variant="h6"
            color="inherit"
            sx={{ textDecoration: "none", fontWeight: 700 }}
          >
            SkillNet
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            sx={{ marginLeft: "auto" }}
            alignItems="center"
          >
            <Button component={Link} to="/mis-turnos" color="inherit">
              Mis Turnos
            </Button>
            <Button component={Link} to="/solicitar" color="inherit">
              Solicitar Turno
            </Button>

            <Tooltip
              title={
                mode === "light"
                  ? "Cambiar a modo oscuro"
                  : "Cambiar a modo claro"
              }
            >
              <IconButton
                color="inherit"
                onClick={toggleMode}
                aria-label="toggle theme"
              >
                {mode === "light" ? <FaMoon /> : <FaSun />}
              </IconButton>
            </Tooltip>

            <IconButton
              color="inherit"
              component={Link}
              to="/perfil"
              aria-label="profile"
            >
              <FaUserCircle />
            </IconButton>

            <Button
              onClick={handleLogout}
              variant="contained"
              color="secondary"
              startIcon={<FaSignOutAlt />}
              sx={{ borderRadius: 9999 }}
            >
              Salir
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavbarUser;
