import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import UserProfile from "./DashboardUser";
import ProviderProfile from "./DashboardProvider";
import DashboardAdmin from "./admin/DashboardAdmin";
import { showLoading, closeLoading, alertError } from "../ui/alerts";

export default function ProfileRouter() {
  const { user, loading, isLoggingOut } = useAuthContext(); // 👈 lee el flag
  const warnedRef = useRef(false); // evita mostrar la alerta 2 veces

  // Loader visual
  useEffect(() => {
    if (loading) showLoading("Cargando perfil...");
    else closeLoading();
  }, [loading]);

  // Mientras valida sesión
  if (loading) {
    return (
      <div className="container mx-auto p-6 min-h-screen text-center">
        <p className="text-lg font-medium text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  // 👇 Si venimos de un logout intencional, NO mostrar alerta; redirige directo
  if (isLoggingOut) {
    return <Navigate to="/login" replace />;
  }

  // Si no hay usuario autenticado
  if (!user) {
    const justLoggedOut = sessionStorage.getItem("justLoggedOut") === "1";
    if (justLoggedOut) {
      sessionStorage.removeItem("justLoggedOut");
      return <Navigate to="/login" replace />;
    }

    // acceso sin sesión (no fue logout): mostrar alerta una sola vez
    if (!warnedRef.current) {
      warnedRef.current = true;
      alertError("Sesión no iniciada", "Por favor inicia sesión nuevamente.");
    }
    return <Navigate to="/login" replace />;
  }

  // Normaliza rol
  const role =
    (user as any)?.rol ||
    (user as any)?.user?.rol ||
    (user as any)?.data?.rol ||
    null;

  // Render según rol
  if (role === "provider") return <ProviderProfile />;
  if (role === "client") return <UserProfile />;
  if (role === "admin") return <DashboardAdmin />;

  // Fallback con alerta
  if (!warnedRef.current) {
    warnedRef.current = true;
    alertError(
      "Rol desconocido",
      "Tu tipo de usuario no tiene un dashboard asignado."
    );
  }
  return <Navigate to="/" replace />;
}
