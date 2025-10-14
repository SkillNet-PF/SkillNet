"use client";

import { createContext, useContext, useEffect, useState } from "react";
// import { http } from "../services/http";
import type { ReactNode } from "react";

type Role = "visitor" | "user" | "provider";

interface AuthUser {
  userId: string;
  email: string;
  name: string;
  rol: "client" | "provider" | "admin";
  imgProfile?: string | null;
  isActive: boolean;
  birthDate?: string;
  address?: string;
  phone?: string;
  // Campos específicos de cliente
  servicesLeft?: number;
  startDate?: string;
  endDate?: string;
  paymentStatus?: boolean;
  // Campos específicos de proveedor
  serviceType?: string;
  about?: string;
  dias?: string[];
  horarios?: string[];
}

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  logout: () => void;
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("visitor");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // Llamar al endpoint /auth/me para obtener datos del usuario
    import("../services/http").then(({ http }) => {
      http<{ user: AuthUser }>("/auth/me")
        .then((res) => {
          console.log("Usuario cargado:", res.user);
          setUser(res.user);
          setRole(res.user?.rol === "provider" ? "provider" : "user");
        })
        .catch((err: any) => {
          console.error("Error obteniendo datos del usuario:", err);
          // Solo hacer logout si es error de autenticación (401)
          if (err.status === 401) {
            localStorage.removeItem("accessToken");
            setRole("visitor");
            setUser(null);
          }
        });
    });
  }, []);

  const logout = () => {
    setRole("visitor");
    setUser(null);
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ role, setRole, logout, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  }
  return context;
}
