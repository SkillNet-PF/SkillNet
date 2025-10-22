import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import UserProfile from "./DashboardUser";
import ProviderProfile from "./DashboardProvider";
import DashboardAdmin from "./admin/DashboardAdmin";
import { showLoading, closeLoading, alertError } from "../ui/alerts";

export default function ProfileRouter() {
  const { user, loading } = useAuthContext();

  // Muestra loader visual mientras se valida sesión
  if (loading) {
    showLoading("Cargando perfil...");
    return (
      <div className="container mx-auto p-6 min-h-screen text-center">
        <p className="text-lg font-medium text-gray-600">Cargando perfil...</p>
      </div>
    );
  } else {
    closeLoading();
  }

  // Si no hay usuario autenticado
  if (!user) {
    alertError("Sesión no iniciada", "Por favor inicia sesión nuevamente.");
    return <Navigate to="/login" replace />;
  }

  // Normaliza la obtención del rol (algunos objetos vienen anidados)
  const role =
    (user as any)?.rol ||
    (user as any)?.user?.rol ||
    (user as any)?.data?.rol ||
    null;

  // Renderiza según el rol
  if (role === "provider") return <ProviderProfile />;
  if (role === "client") return <UserProfile />;
  if (role === "admin") return <DashboardAdmin />;

  // Fallback con alerta
  alertError(
    "Rol desconocido",
    "Tu tipo de usuario no tiene un dashboard asignado."
  );
  return <Navigate to="/" replace />;
}
