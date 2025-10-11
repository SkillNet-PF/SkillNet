import { http } from "./http";
import { AuthResponse } from "./types";

export async function registerProvider(payload: {
  name: string;
  email: string;
  password: string;
  birthDate?: string;
  serviceType?: string;
  about?: string;
}): Promise<AuthResponse> {
  return await http<AuthResponse>("/serviceprovider/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


