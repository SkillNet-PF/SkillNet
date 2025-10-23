// src/services/http.ts
import { alertError } from "../ui/alerts";

// Solo Vite: lee VITE_API_URL si existe; si no, usa el proxy /api
const RAW_API_URL: string = (import.meta as any).env?.VITE_API_URL ?? "/api";
// Normaliza base para evitar dobles barras
const API_BASE = RAW_API_URL.endsWith("/")
  ? RAW_API_URL.slice(0, -1)
  : RAW_API_URL;

function mapStatusToMessage(status: number, apiMessage?: string) {
  if (status >= 400 && status < 500) {
    if (apiMessage) return apiMessage;
    if (status === 401) return "Necesitas iniciar sesión para continuar.";
    if (status === 403) return "No tienes permisos para realizar esta acción.";
    if (status === 404) return "No pudimos encontrar lo que buscabas.";
    return "Hay un problema con los datos enviados. Revisa e inténtalo de nuevo.";
  }
  if (status >= 500)
    return "Tuvimos un problema en el servidor. Inténtalo más tarde.";
  return "Ocurrió un error. Inténtalo nuevamente.";
}

export async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("accessToken");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const fullPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${API_BASE}${fullPath}`;

  try {
    const res = await fetch(fullUrl, { ...options, headers });

    if (!res.ok) {
      let apiMessage = "";
      try {
        const data = await res.json();
        apiMessage = (data as any)?.message || (data as any)?.error || "";
      } catch {
        try {
          apiMessage = await res.text();
        } catch {
          apiMessage = "";
        }
      }

      const userMessage = mapStatusToMessage(res.status, apiMessage);

      // ⛔️ SUPRIMIR la alerta si venimos de un logout intencional (flag puesto por logout())
      const suppressByLogout =
        res.status === 401 && sessionStorage.getItem("justLoggedOut") === "1";

      // ⛔️ (opcional) permitir suprimir manualmente con header
      const suppressHeader =
        (headers as any)["X-Suppress-Error-Alert"] === "1" ||
        (options as any)?.["X-Suppress-Error-Alert"] === "1";

      if (!suppressByLogout && !suppressHeader) {
        alertError("No se pudo completar la acción", userMessage);
      }
      // **NO** limpiamos justLoggedOut aquí; lo limpia Login.tsx al montar.

      const error: any = new Error(userMessage);
      error.status = res.status;
      error.userMessage = userMessage;
      error.apiMessage = apiMessage;
      throw error;
    }

    // Éxito
    if (res.status === 204) return undefined as unknown as T;

    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      return (await res.json()) as T;
    }

    const text = await res.text().catch(() => "");
    const nonJsonErr: any = new Error(
      `Respuesta inesperada (no JSON) desde ${fullUrl}: ${text?.slice(0, 120)}`
    );
    nonJsonErr.status = res.status;
    throw nonJsonErr;
  } catch (err: any) {
    // Errores de red / offline
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const userMessage = "Sin conexión a internet. Revisa tu conexión.";
      alertError("Conexión", userMessage);
      const offlineErr: any = err || new Error(userMessage);
      offlineErr.userMessage = userMessage;
      throw offlineErr;
    }
    if (!err?.status) {
      const userMessage =
        "No pudimos conectarnos con el servidor. Inténtalo nuevamente.";
      alertError("Conexión", userMessage);
      const netErr: any = err || new Error(userMessage);
      netErr.userMessage = userMessage;
      throw netErr;
    }
    throw err;
  }
}
