import { http } from "./http";
import { AuthResponse } from "./types";

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  phone: string;
  rol?: "client" | "provider";
  birthDate: string;
  subscription: "basic" | "standard" | "premium";
  paymentMethod: string;
  imgProfile?: string;
}): Promise<AuthResponse> {
  const role = payload.rol || "client";
  const endpoint =
    role === "provider" ? "/auth/registerProvider" : "/auth/registerClient";

  return await http<AuthResponse>(endpoint, {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      rol: role,
      // Removemos isActive ya que no debe enviarse
    }),
  });
}
