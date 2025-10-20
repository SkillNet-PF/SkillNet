import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import UserProfile from "./DashboardUser";
import ProviderProfile from "./DashboardProvider";
import DashboardAdmin from "./admin/DashboardAdmin";

export default function ProfileRouter() {
  const { user, loading } = useAuthContext();

  // Mientras AuthContext está pidiendo /auth/me
  if (loading) {
    return (
      <div className="container mx-auto p-6 min-h-screen">
        <p>Cargando perfil…</p>
      </div>
    );
  }

  // Si ya no estamos cargando y no hay user => ir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Decidir dashboard por rol
  const role = user.rol; // "client" | "provider" | "admin"
  if (role === "provider") return <ProviderProfile />;
  if (role === "client") return <UserProfile />;
  if (role === "admin") return <DashboardAdmin />;

  // Fallback
  return <Navigate to="/" replace />;
}
