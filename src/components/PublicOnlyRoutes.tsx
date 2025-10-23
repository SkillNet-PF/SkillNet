"use cleint";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";


interface PublicOnlyRoutesProps {
    children: ReactNode;
}

export default function PublicOnlyRoute({ children }: PublicOnlyRoutesProps) {
    const { role, user, loading } = useAuthContext();

    if (loading) return <div>Cargando...</div>;

    if (user && role !== "visitor") {

        if (role === "provider") return <Navigate to="/serviceprovider/dashboard" replace />;
        if (role === "user") return <Navigate to="/perfil" replace />;
        if (role === "admin") return <Navigate to="/admin/dashboard" replace />;

    }

    return <>{children}</>;
}