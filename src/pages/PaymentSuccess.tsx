// src/pages/PaymentSuccess.tsx
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function PaymentSuccess() {
  return (
    <Box className="container mx-auto p-6">
      <Typography variant="h4" gutterBottom>
        ¡Pago completado!
      </Typography>
      <Typography>
        Tu suscripción se activará al conectar la pasarela real. Por ahora es
        una demo visual.
      </Typography>
      <Button component={Link} to="/perfil" variant="contained" sx={{ mt: 2 }}>
        Ir a mi perfil
      </Button>
    </Box>
  );
}
