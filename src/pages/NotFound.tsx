import { Link } from "react-router-dom";
import { Paper, Button, Typography } from "@mui/material";

function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center">
            <Paper elevation={6} className="p-10 rounded-2xl">
                <Typography variant="h2" color="primary" className="mb-3">404</Typography>
                <Typography variant="body1" color="text.secondary" className="mb-6">La página que buscas no existe o fue movida.</Typography>
                <Button component={Link} to="/" variant="contained" color="primary">Volver al inicio</Button>
            </Paper>
        </div>
    )
}

export default NotFound;