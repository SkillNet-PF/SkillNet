"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { http } from "../services/http";
import type { ReactNode } from "react";

type Role = "visitor" | "user" | "provider";

interface AuthUser {
    userId: string;
    email: string;
    name: string;
    rol: "client" | "provider" | "admin";
    imgProfile?: string | null;
}

interface AuthContextType {
    role: Role;
    setRole: (role: Role) => void;
    logout: () => void;
    user: AuthUser | null;
    setUser: (u: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType |undefined>(undefined);

export function AuthProvider ({ children }: {children: ReactNode}) {

    const [role, setRole] = useState<Role>("visitor");
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        http<{ user: AuthUser }>("/auth/me").then((res) => {
            setUser(res.user);
            setRole(res.user?.rol === "provider" ? "provider" : "user");
        }).catch((err: any) => {
            // Do not logout on 404/500; only on explicit 401 (handled in http)
        });
    }, []);

    const logout = () => {
        setRole("visitor");
        setUser(null);
        localStorage.removeItem("accessToken");
    }

    return (
            <AuthContext.Provider value={{ role, setRole, logout, user, setUser }}>
      {children}
    </AuthContext.Provider>
    );
}

export function useAuthContext () {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext debe usarse dentro de AuthProvider");
    }
    return context;
}



