import { http } from "./http";
import { AuthResponse } from "./types";

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  address:string;
  phone: string;
  rol?: "client" | "provider";
  birthDate: string;
  //subscription: "basic" | "standard" | "premium";
  imgProfile?: string; 
}): Promise<AuthResponse> {
  return await http<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      rol: payload.rol || "client",
      isActive: true,
    }),
  });
}


