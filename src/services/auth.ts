import { http } from "./http";
import { AuthResponse, toFrontendRole } from "./types";

const API_BASE =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:3002";

/** ---------- Login / Token ---------- */
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; role: "client" | "provider"; token?: string }> {
  try {
    const data = await http<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const role = toFrontendRole(data.user.rol);
    localStorage.setItem("accessToken", data.accessToken);
    return { success: true, role, token: data.accessToken };
  } catch {
    return { success: false, role: "client" };
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function clearAuthToken() {
  localStorage.removeItem("accessToken");
}

export function logout() {
  clearAuthToken();
}

/** ---------- Auth0 helpers ---------- */
export function auth0RegisterUrl(
  role: "client" | "provider",
  connection?: "google-oauth2" | "github"
): string {
  const startPath =
    role === "provider"
      ? `/auth/auth0/start/provider`
      : `/auth/auth0/start/client`;
  const qs = connection ? `?connection=${connection}` : "";
  return `${API_BASE}${startPath}${qs}`;
}

/** ---------- Usuario actual ---------- */
export async function me(): Promise<any> {
  // Si tu http() no agrega Authorization automáticamente, añade el header ahí.
  return http<any>("/auth/me", { method: "GET" });
}

/** ---------- Avatar ---------- */
export async function uploadAvatar(
  file: File
): Promise<{ user: any; imgProfile: string }> {
  const formData = new FormData();
  formData.append("avatar", file);

  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}/auth/upload-avatar`, {
    method: "POST",
    headers, // no setear Content-Type con FormData
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `HTTP ${response.status}`);
  }

  return await response.json();
}

/** ---------- Update perfiles ---------- */
export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string;
    email?: string;
    birthDate?: string;
    address?: string;
    phone?: string;
  }
): Promise<any> {
  return http<any>(`/clients/profile/${userId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function updateProviderProfile(
  providerId: string,
  updates: {
    name?: string;
    email?: string;
    birthDate?: string;
    address?: string;
    phone?: string;
    serviceType?: string;
    about?: string;
    days?: string;
    horarios?: string;
  }
): Promise<any> {
  return http<any>(`/serviceprovider/${providerId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}
