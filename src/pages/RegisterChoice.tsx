import { Link } from "react-router-dom";
import { Paper, Button, Typography, Stack } from "@mui/material";

function RegisterChoice() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Paper elevation={8} className="p-10 rounded-2xl text-center w-full max-w-md">
                <Typography variant="h5" color="primary" className="mb-6">Elige tu tipo de cuenta</Typography>
                <Stack spacing={2}>
                    <Button component={Link} to="/register/user" variant="contained" color="primary" fullWidth>Soy Usuario</Button>
                    <Button component={Link} to="/register/provider" variant="contained" color="success" fullWidth>Soy Proveedor</Button>
                </Stack>
                <Typography variant="body2" color="text.secondary" className="mt-6">
                    ¿Ya tienes una cuenta? <Link to="/login" className="text-blue-600 hover:underline">Inicia sesión</Link>
                </Typography>
            </Paper>
        </div>
    );
}

export default RegisterChoice;