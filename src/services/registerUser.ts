import api from "./api";

export async function registerUser(data: {
  name: string;
  birthdate: string;
  email: string;
  password: string;
  membership: string;
}) {
  try {
    const response = await api.post("/auth/register", data);
    return response.data;
  } catch (error: any) {
    console.error("Error en registro de usuario:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Error al registrar usuario");
  }
}