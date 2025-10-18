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


