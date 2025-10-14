import { http } from "./http";
import { AuthResponse } from "./types";

export async function registerProvider(payload: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  serviceType: string;
  about: string;
  days?: string; // CSV: "lunes,martes"
  horarios?: string; // CSV: "09:00,14:00"

}): Promise<AuthResponse> {
  return await http<AuthResponse>("/auth/register/provider", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


