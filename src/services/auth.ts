import { http } from "./http";
import { AuthResponse, toFrontendRole } from "./types";

export async function login(
  email: string,
  password: string
): Promise<{
  success: boolean;
  role: "client" | "provider";
  token?: string;
}> {
  try {
    const data = await http<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const role = toFrontendRole(data.user.rol);
    localStorage.setItem("accessToken", data.accessToken);
    return { success: true, role, token: data.accessToken };
  } catch (err) {
    return { success: false, role: "client" };
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function clearAuthToken() {
  localStorage.removeItem("accessToken");
}

export function auth0RegisterUrl(
  role: "client" | "provider",
  connection?: "google-oauth2" | "github"
): string {
  const base =
    (import.meta as any).env?.VITE_API_URL || "http://localhost:3002";
  const startPath =
    role === "provider"
      ? `/auth/auth0/start/provider`
      : `/auth/auth0/start/client`;
  const qs = connection ? `?connection=${connection}` : "";
  return `${base}${startPath}${qs}`;
}

export async function uploadAvatar(
  file: File
): Promise<{ user: any; imgProfile: string }> {
  const formData = new FormData();
  formData.append("avatar", file);

  const token = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch("/api/auth/upload-avatar", {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `HTTP ${response.status}`);
  }

  return await response.json();
}
