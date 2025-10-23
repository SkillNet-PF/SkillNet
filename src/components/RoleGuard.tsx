"use client";
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

/**
 * Componente de protección por roles
 * @param allowedRoles: array de roles permitidos (por ejemplo ["provider"])
 */
interface RoleGuardProps {
  allowedRoles: ("visitor" | "client" | "provider" | "admin")[];
  children: ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role, user, loading } = useAuthContext();
  const location = useLocation();

  // Mientras se valida la sesión, no renderiza nada
  if (loading) return <div>Cargando...</div>;

  // Si no hay usuario y no es visitante permitido
  if (!user && !allowedRoles.includes("visitor")) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si el rol actual no está permitido
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si todo bien → renderiza el contenido
  return <>{children}</>;
}
