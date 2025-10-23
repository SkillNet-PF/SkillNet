// src/services/types.ts

export type BackendRole = "client" | "provider" | "admin";

export interface BackendUser {
  userId: string;
  email: string;
  name: string;
  rol: BackendRole;
  imgProfile?: string | null;
  isActive: boolean;
}

export interface AuthResponse {
  user: BackendUser;
  accessToken: string;
}

/* ============== INTERFACES DE REGISTRO ============== */

// Registro de cliente (coincide con lo que manda el form y espera el back)
export interface ClientRegisterRequest {
  // comunes
  userId?: string;
  imgProfile?: string;
  name: string;
  birthDate: string; // "YYYY-MM-DD" (o ISO si tu back lo requiere)
  email: string;
  password: string;
  confirmPassword?: string; // opcional: el back puede ignorarlo
  address: string;
  phone: string;
  rol: "client";

  // Compatibilidad: algunos backends pueden usar estos campos; déjalos opcionales
  paymentMethod?: string; // "tarjeta_credito", "paypal", "transferencia"
  subscription?: string; // "basic", "standard", "premium"
}

// Registro de proveedor
export interface ProviderRegisterRequest {
  // comunes
  userId?: string;
  imgProfile?: string;
  name: string;
  birthDate: string;
  email: string;
  password: string;
  confirmPassword?: string; // opcional
  address: string;
  phone: string;
  rol: "provider";
  isActive?: boolean; // opcional por si el back setea default

  // específicos
  about: string; // descripción (antes “bio”)
  days: string; // CSV: "lunes,martes"
  horarios: string; // CSV: "09:00,14:00"
  categoryId?: string; // opcional por compatibilidad (algunos backs usan nombre de categoría)
  // ❌ Eliminado: serviceType (deriva de la categoría)
}

/* ============== INTERFACES DE ENTIDADES ============== */

export interface ClientProfile {
  userId: string;
  name: string;
  email: string;
  birthDate?: string;
  imgProfile?: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  subscription?: string;
  servicesLeft?: number;
}

export interface ProviderProfile {
  userId: string;
  name: string;
  email: string;
  birthDate?: string;
  imgProfile?: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  about?: string; // correcto
  days?: string[]; // normalizado desde CSV
  horarios?: string[]; // normalizado desde CSV
  rating?: number;
  category?: { categoryId: string; name: string; description?: string };
}

export function toFrontendRole(
  backendRole: BackendRole
): "client" | "provider" {
  return backendRole === "provider" ? "provider" : "client";
}
