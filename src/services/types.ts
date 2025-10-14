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

export function toFrontendRole(backendRole: BackendRole): "client" | "provider" {
  return backendRole === "provider" ? "provider" : "client";
}


