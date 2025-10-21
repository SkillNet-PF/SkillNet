// src/services/http.ts
import { alertError } from "../ui/alerts";

const API_URL = "/api";

function mapStatusToMessage(status: number, apiMessage?: string) {
  // Para 4xx preferimos el mensaje del backend si lo envió
  if (status >= 400 && status < 500) {
    if (apiMessage) return apiMessage;
    if (status === 401) return "Necesitas iniciar sesión para continuar.";
    if (status === 403) return "No tienes permisos para realizar esta acción.";
    if (status === 404) return "No pudimos encontrar lo que buscabas.";
    return "Hay un problema con los datos enviados. Revisa e inténtalo de nuevo.";
  }

  // 5xx
  if (status >= 500) {
    return "Tuvimos un problema en el servidor. Inténtalo más tarde.";
  }

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
      // intenta leer mensaje del backend
      let apiMessage = "";
      try {
        const data = await res.json();
        apiMessage = data?.message || data?.error || "";
      } catch {
        // fallback a texto plano
        apiMessage = await res.text().catch(() => "");
      }

      const userMessage = mapStatusToMessage(res.status, apiMessage);
      // mostramos alerta amigable
      alertError("No se pudo completar la acción", userMessage);

      const error: any = new Error(userMessage);
      error.status = res.status;
      error.userMessage = userMessage;
      error.apiMessage = apiMessage;
      throw error;
    }

    return (await res.json()) as T;
  } catch (err: any) {
    // Errores de red o desconexión
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
