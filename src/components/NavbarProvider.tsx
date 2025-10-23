import { Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, IconButton, Stack, Tooltip, Container, Box } from "@mui/material";
import { FaUserCircle, FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";
import { useAuthContext } from "../contexts/AuthContext";
import { useThemeMode } from "../ui";
import SearchBar from "./SearchBar";

function NavbarProvider() {

  const { logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const { mode, toggleMode } = useThemeMode();

  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: 64, gap: 2 }}>
          <Typography component={Link} to="/" variant="h6" color="inherit" sx={{ textDecoration: 'none', fontWeight: 700 }}>
            SkillNet
          </Typography>

          {/* Barra de búsqueda */}
          <Box sx={{ flex: 1, maxWidth: 400, mx: 2 }}>
            <SearchBar placeholder="Buscar clientes, categorías..." />
          </Box>

          <Stack direction="row" spacing={2} sx={{ marginLeft: 'auto' }} alignItems="center">
            <Button component={Link} to="/agenda" color="inherit">Mi Agenda</Button>

            <Tooltip title={mode === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}>
              <IconButton color="inherit" onClick={toggleMode} aria-label="toggle theme">
                {mode === 'light' ? <FaMoon /> : <FaSun />}
              </IconButton>
            </Tooltip>

            <IconButton color="inherit" component={Link} to="/perfil" aria-label="profile">
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

export default NavbarProvider;