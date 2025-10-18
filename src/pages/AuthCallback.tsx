import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { http } from "../services/http";

function AuthCallback() {
  const { setRole } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Procesando autenticación...");

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const role = params.get("role");

        if (!token) {
          setStatus("error");
          setMessage("No se recibió token de autenticación");
          setTimeout(() => navigate("/login", { replace: true }), 2000);
          return;
        }

        // Guardar token y rol
        localStorage.setItem("accessToken", token);
        if (role === "provider" || role === "client") {
          setRole(role === "provider" ? "provider" : "user");
          localStorage.setItem("userRole", role);
        }

        setMessage("Verificando usuario...");

        // Verificar que el token funciona (backend en puerto 3002)
        await http<{ user: any }>("/auth/me");

        setStatus("success");
        setMessage(`¡Bienvenido! Redirigiendo como ${role}...`);

        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);
      } catch (error) {
        console.error("Error en callback OAuth:", error);
        setStatus("error");
        setMessage("Error al procesar autenticación");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      }
    };

    handleAuth();
  }, [location.search, navigate, setRole]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          padding: "40px",
          borderRadius: "12px",
          backgroundColor: "#f8f9fa",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        {status === "loading" && (
          <div>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #007bff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px",
              }}
            />
            <h2 style={{ color: "#007bff", margin: "0 0 10px" }}>
              🔄 Autenticando
            </h2>
          </div>
        )}

        {status === "success" && (
          <div>
            <h2 style={{ color: "#28a745", margin: "0 0 10px" }}>✅ ¡Éxito!</h2>
          </div>
        )}

        {status === "error" && (
          <div>
            <h2 style={{ color: "#dc3545", margin: "0 0 10px" }}>❌ Error</h2>
          </div>
        )}

        <p style={{ color: "#6c757d", margin: 0 }}>{message}</p>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default AuthCallback;
