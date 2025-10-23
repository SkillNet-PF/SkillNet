"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

// SweetAlert2 helpers
import { showLoading, closeLoading, toast, alertError } from "../ui/alerts";

type Role = "visitor" | "user" | "provider"| "admin";

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
  servicesLeft?: number;
  startDate?: string;
  endDate?: string;
  paymentStatus?: boolean;
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
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("visitor");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Primer efecto: carga inicial
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    showLoading("Cargando perfil...");

    import("../services/http").then(({ http }) => {
      http<{ user: AuthUser }>("/auth/me")
        .then((res) => {
          console.log("Usuario cargado:", res.user);
          setUser(res.user);
          setRole(res.user?.rol === "provider" ? "provider" 
            : res.user?.rol === "admin"? "admin"
            : "user");
          toast("Sesión restaurada", "success");
        })
        .catch((err: any) => {
          console.error("Error obteniendo datos del usuario:", err);
          if (err.status === 401) {
            localStorage.removeItem("accessToken");
            setRole("visitor");
            setUser(null);
          } else {
            const msg =
              err?.response?.data?.message ||
              err?.message ||
              "No se pudo cargar tu perfil.";
            alertError("Error de autenticación", String(msg));
          }
        })
        .finally(() => {
          closeLoading();
          setLoading(false);
        });
    });
  }, []);

  // Segundo efecto: detecta nuevos tokens después del login
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || user) return;

    setLoading(true);
    showLoading("Actualizando sesión...");

    import("../services/http")
      .then(({ http }) => http<{ user: AuthUser }>("/auth/me"))
      .then((res) => {
        const profile = res.user;
        setUser(profile);
        setRole(res.user?.rol === "provider" ? "provider" 
            : res.user?.rol === "admin"? "admin"
            : "user");
        toast("Sesión actualizada", "success");
      })
      .catch((err: any) => {
        console.error("Error refrescando datos del usuario:", err);
        if (err.status === 401) {
          localStorage.removeItem("accessToken");
          setUser(null);
          setRole("visitor");
        } else {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "No se pudo actualizar tu sesión.";
          alertError("Error de autenticación", String(msg));
        }
      })
      .finally(() => {
        closeLoading();
        setLoading(false);
      });
  }, [localStorage.getItem("accessToken")]);

  // Logout con feedback
  const logout = () => {
    setRole("visitor");
    setUser(null);
    localStorage.removeItem("accessToken");
    toast("Sesión cerrada correctamente", "info");
  };

  // Pantalla de carga global
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Cargando perfil...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ role, setRole, logout, user, setUser, loading }}
    >
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
