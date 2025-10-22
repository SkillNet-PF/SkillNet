// src/services/http.ts
import { alertError } from "../ui/alerts";

// Solo Vite: lee VITE_API_URL si existe; si no, usa el proxy /api
const API_URL: string = (import.meta as any).env?.VITE_API_URL ?? "/api";

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

  const fullUrl = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const res = await fetch(fullUrl, { ...options, headers });

    if (!res.ok) {
      let apiMessage = "";
      try {
        const data = await res.json();
        apiMessage = data?.message || data?.error || "";
      } catch {
        try {
          apiMessage = await res.text();
        } catch {
          apiMessage = "";
        }
      }
      const userMessage = mapStatusToMessage(res.status, apiMessage);
      alertError("No se pudo completar la acción", userMessage);

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
    const err: any = new Error(
      `Respuesta inesperada del servidor (no JSON) desde ${fullUrl}: ${text?.slice(
        0,
        120
      )}`
    );
    err.status = res.status;
    throw err;
  } catch (err: any) {
    if (!navigator.onLine) {
      const userMessage = "Sin conexión a internet. Revisa tu conexión.";
      alertError("Conexión", userMessage);
      err = err || new Error(userMessage);
      err.userMessage = userMessage;
      throw err;
    }
    if (!err?.status) {
      const userMessage =
        "No pudimos conectarnos con el servidor. Inténtalo nuevamente.";
      alertError("Conexión", userMessage);
      err = err || new Error(userMessage);
      err.userMessage = userMessage;
      throw err;
    }
    throw err;
  }
}
