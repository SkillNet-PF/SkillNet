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

// ============== INTERFACES DE REGISTRO ==============

// Interface para registro de cliente (coincide con RegisterClientDto)
export interface ClientRegisterRequest {
  // Campos heredados de RegisterDto
  userId?: string;
  imgProfile?: string;
  name: string;
  birthDate: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  phone: string;
  rol: "client";

  // Campos específicos de RegisterClientDto
  paymentMethod: string; // "tarjeta_credito", "paypal", "transferencia"
  subscription: string; // "basic", "standard", "premium"
}

// Interface para registro de proveedor (coincide con ProviderRegisterDto)
export interface ProviderRegisterRequest {
  // Campos heredados de RegisterDto
  userId?: string;
  imgProfile?: string;
  name: string;
  birthDate: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  phone: string;
  rol: "provider";
  isActive: boolean; // Campo requerido por el backend

  // Campos específicos de ProviderRegisterDto
  serviceType: string;
  about: string; // Campo correcto (no "bio")
  days: string; // CSV e.g. "lunes,martes"
  horarios: string; // CSV e.g. "09:00,14:00"
}

// ============== INTERFACES DE ENTIDADES ==============

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
  serviceType?: string;
  about?: string; // Correcto: "about" no "bio"
  days?: string[];
  horarios?: string[];
  rating?: number;
}

export function toFrontendRole(
  backendRole: BackendRole
): "client" | "provider" {
  return backendRole === "provider" ? "provider" : "client";
}
