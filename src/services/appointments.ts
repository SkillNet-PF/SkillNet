import { http } from "./http";

export interface CreateAppointmentRequest {
  category: string; // nombre de la categoría
  appointmentDate: string; // ISO string (backend valida como Date)
  hour: string; // hh:mm
  notes: string;
  provider: string; // nombre del proveedor (o id si backend lo requiere)
}

export interface AppointmentResponse {
  ok?: boolean;
  message?: string;
  AppointmentID?: string;
}

export async function createAppointment(
  payload: CreateAppointmentRequest
): Promise<AppointmentResponse> {
  return await http<AppointmentResponse>("/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getBookedHours(
  providerId: string,
  dateISO: string
): Promise<string[]> {
  // date input is yyyy-mm-dd; backend accepts date param as yyyy-mm-dd
  console.log(dateISO);
  const dateParam = dateISO.includes("T") ? dateISO.split("T")[0] : dateISO;
  return await http<string[]>(`/appointments/booked-hours/${providerId}?date=${encodeURIComponent(dateParam)}`, {
    method: "GET",
  });
}

export interface AppointmentItem {
  AppointmentID: string;
  AppointmentDate: string;
  hour: string;
  Notes: string;
  Status: string;
  UserClient?: { userId: string; name: string; email?: string; phone?: string; address?: string };
  UserProvider?: { userId: string; name: string };
  Category?: { Name?: string; name?: string };
}

// Normalización de estados entre FE (EN) y BE (ES)
const statusToServer: Record<string, string> = {
  PENDING: 'pendiente',
  CONFIRMED: 'confirmado',
  CANCEL: 'cancelado',
  COMPLETED_PARTIAL: 'completadoParcial',
  COMPLETED: 'completado',
};

const statusFromServer: Record<string, AppointmentStatus> = {
  pendiente: 'PENDING',
  confirmado: 'CONFIRMED',
  cancelado: 'CANCEL',
  completadoParcial: 'COMPLETED_PARTIAL',
  completado: 'COMPLETED',
};

function normalizeFromServer(item: AppointmentItem): AppointmentItem {
  const normalized: AppointmentItem = { ...item } as AppointmentItem;
  normalized.Status = statusFromServer[String(item.Status)] || String(item.Status);
  return normalized;
}

export function statusLabel(status: AppointmentStatus | string): string {
  const key = String(status);
  // if already spanish, keep it
  const found = statusToServer[key];
  return found ? found : key;
}

export async function listAppointments(
  page = 1,
  limit = 10,
  filters?: { status?: string; category?: string; providerId?: string }
): Promise<AppointmentItem[]> {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("limit", String(limit));
  if (filters?.status) params.append("status", statusToServer[filters.status] || filters.status);
  if (filters?.category) params.append("category", filters.category);
  if (filters?.providerId) params.append("providerId", filters.providerId);
  const data = await http<AppointmentItem[]>(`/appointments?${params.toString()}`, { method: "GET" });
  return Array.isArray(data) ? data.map(normalizeFromServer) : data;
}

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCEL"
  | "COMPLETED_PARTIAL"
  | "COMPLETED";

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<AppointmentItem> {
  const serverStatus = statusToServer[status] || status;
  const updated = await http<AppointmentItem>(`/appointments/${appointmentId}`, {
    method: "PUT",
    // Enviar objeto JSON para compatibilidad con bodyParser.strict
    body: JSON.stringify({ status: serverStatus }),
  });
  return normalizeFromServer(updated);
}


