"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Role = "visitor" | "user" | "provider";

interface AuthContextType {
    role: Role;
    setRole: (role: Role) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType |undefined>(undefined);

export function AuthProvider ({ children }: {children: ReactNode}) {

    const [role, setRole] = useState<Role>("visitor");

    const logout = () => {
        setRole("visitor");
    }

    return (
            <AuthContext.Provider value={{ role, setRole, logout }}>
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



