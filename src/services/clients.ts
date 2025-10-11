import { http } from "./http";
import { AuthResponse } from "./types";

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  birthDate?: string;
  membership?: string;
}): Promise<AuthResponse> {
  return await http<AuthResponse>("/clients/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


