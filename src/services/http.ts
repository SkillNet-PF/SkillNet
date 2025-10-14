const API_URL = "http://localhost:3002";

export async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // ✅ Corrige la URL para que siempre tenga la barra
  const fullUrl = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const error: any = new Error(text || `HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }

  return (await res.json()) as T;
}
