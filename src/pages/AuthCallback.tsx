import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { http } from "../services/http";
import { useAuthContext } from "../contexts/AuthContext";
import { showLoading, closeLoading, toast, alertError } from "../ui/alerts";

function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, setRole } = useAuthContext();
  const ranRef = useRef(false);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Procesando autenticación...");

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const handleAuth = async () => {
      showLoading("Procesando autenticación...");

      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const role = params.get("role");

        if (!token) {
          setStatus("error");
          setMessage("No se recibió token de autenticación");
          closeLoading();
          alertError("Error", "No se recibió token de autenticación.");
          setTimeout(() => navigate("/login", { replace: true }), 1200);
          return;
        }

        // 1) Guardar token
        localStorage.setItem("accessToken", token);

        // 2) Traer perfil y ACTUALIZAR CONTEXTO antes de navegar
        const me = await http<{ user: any }>("/auth/me");
        const profile = me.user;
        setUser(profile);
        setRole(profile?.rol === "provider" ? "provider" : "user");

        // 3) Limpiar la URL para evitar reintentos al refrescar
        window.history.replaceState({}, document.title, "/perfil");

        // 4) Feedback único y navegación
        setStatus("success");
        setMessage(`¡Bienvenido! Redirigiendo como ${role || "usuario"}...`);
        closeLoading();
        toast("Autenticado correctamente", "success");
        setTimeout(() => navigate("/perfil", { replace: true }), 800);
      } catch (error) {
        console.error("Error en callback OAuth:", error);
        setStatus("error");
        setMessage("Error al procesar autenticación");
        closeLoading();
        alertError(
          "No se pudo completar la autenticación",
          "Intenta iniciar sesión nuevamente."
        );
        setTimeout(() => navigate("/login", { replace: true }), 1200);
      }
    };

    handleAuth();
  }, [location.search, navigate, setRole, setUser]);

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
          <h2 style={{ color: "#28a745", margin: 0 }}>✅ ¡Éxito!</h2>
        )}
        {status === "error" && (
          <h2 style={{ color: "#dc3545", margin: 0 }}>❌ Error</h2>
        )}
        <p style={{ color: "#6c757d", margin: 0 }}>{message}</p>
      </div>
      <style>{`@keyframes spin {0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default AuthCallback;
