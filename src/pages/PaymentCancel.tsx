// src/pages/PaymentCancel.tsx
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function PaymentCancel() {
  return (
    <Box className="container mx-auto p-6">
      <Typography variant="h4" gutterBottom>
        Pago cancelado
      </Typography>
      <Typography>Puedes intentar nuevamente cuando lo desees.</Typography>
      <Button
        component={Link}
        to="/suscripciones"
        variant="contained"
        sx={{ mt: 2 }}
      >
        Volver a planes
      </Button>
    </Box>
  );
}
