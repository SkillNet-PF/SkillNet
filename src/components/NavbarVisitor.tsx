
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, IconButton, Stack, Tooltip, Container, Box } from "@mui/material";
import { FaMoon, FaSun } from "react-icons/fa";
import { useThemeMode } from "../ui";
import SearchBar from "./SearchBar";

function NavbarVisitor() {
   

    const { mode, toggleMode } = useThemeMode();

    return (
        <AppBar position="static" color="primary" enableColorOnDark>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ minHeight: 64, gap: 2 }}>
                    <Typography
                        component={Link}
                        to="/"
                        variant="h6"
                        color="inherit"
                        sx={{ textDecoration: 'none', fontWeight: 700 }}
                    >
                        SkillNet
                    </Typography>

                    {/* Barra de búsqueda */}
                    <Box sx={{ flex: 1, maxWidth: 400, mx: 2 }}>
                        <SearchBar placeholder="Buscar proveedores, categorías..." />
                    </Box>

                    <Stack direction="row" spacing={1.5} sx={{ marginLeft: 'auto' }} alignItems="center">
                        <Button component={Link} to="/login" color="inherit">
                            LOGIN
                        </Button>
                        <Button
                            component={Link}
                            to="/register"
                            variant="contained"
                            color="secondary"
                            sx={{ borderRadius: 9999, px: 2.5 }}
                        >
                            REGISTER
                        </Button>

                        <Tooltip title={mode === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}>
                            <IconButton color="inherit" onClick={toggleMode} aria-label="toggle theme">
                                {mode === 'light' ? <FaMoon /> : <FaSun />}
                            </IconButton>
                        </Tooltip>

                        {/* Ocultamos iconos de Perfil/Ajustes para visitantes no autenticados */}
                    </Stack>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default NavbarVisitor;