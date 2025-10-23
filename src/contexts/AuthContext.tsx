"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { showLoading, closeLoading, toast } from "../ui/alerts";

type Role = "visitor" | "client" | "provider" | "admin";

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
  refreshMe: () => Promise<void>;
  /** Flag in-memory para saber si estamos saliendo */
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapBackendRoleToFront(backend: AuthUser["rol"] | undefined): Role {
  if (backend === "admin") return "admin";
  if (backend === "provider") return "provider";
  if (backend === "client") return "client";
  return "visitor";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("visitor");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const ranRef = useRef(false); // evita doble ejecución en StrictMode

  const refreshMe = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setRole("visitor");
      return;
    }
    const { http } = await import("../services/http");
    const res = await http<{ user: AuthUser }>("/auth/me");
    setUser(res.user);
    setRole(mapBackendRoleToFront(res.user?.rol));
  };

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const init = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }
      showLoading("Cargando perfil...");
      try {
        await refreshMe();
        toast("Sesión restaurada", "success");
      } catch (err: any) {
        console.error("Auth init error:", err);
        // Si el back responde 401, limpiamos token y estado
        if (err?.status === 401) {
          localStorage.removeItem("accessToken");
        }
        setUser(null);
        setRole("visitor");
      } finally {
        closeLoading();
        setLoading(false);
      }
    };
    init();
  }, []);

  const logout = () => {
    // Marca salida intencional (memoria + sessionStorage)
    setIsLoggingOut(true);
    sessionStorage.setItem("justLoggedOut", "1");

    setRole("visitor");
    setUser(null);
    localStorage.removeItem("accessToken");
    toast("Sesión cerrada correctamente", "info");

    // baja el flag después de un rato por seguridad
    setTimeout(() => setIsLoggingOut(false), 4000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Cargando perfil...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        logout,
        user,
        setUser,
        loading,
        refreshMe,
        isLoggingOut,
      }}
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
