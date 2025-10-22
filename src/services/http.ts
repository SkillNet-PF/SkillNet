const API_URL = (import.meta.env.VITE_API_URL as string) || "/api";

export async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const base = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const fullPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${base}${fullPath}`;

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

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  const text = await res.text().catch(() => "");
  const err: any = new Error(
    `Unexpected non-JSON response from ${fullUrl}: ${text?.slice(0, 120)}`
  );
  err.status = res.status;
  throw err;
}
