import { http } from "./http";
import { AuthResponse, ClientRegisterRequest } from "./types";

// Interfaces para el cliente
export interface Client {
  userId: string;
  imgProfile?: string;
  name: string;
  birthDate: string;
  email: string;
  address: string;
  phone: string;
  rol: "client";
  isActive: boolean;
  paymentMethod?: string;
  servicesLeft: number;
  startDate: string;
  endDate: string;
  paymentStatus: boolean;
}

export interface ClientsListResponse {
  clients: Client[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateClientData {
  name?: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  subscription?: "basic" | "standard" | "premium";
  paymentMethod?: string;
  imgProfile?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

// Registro de cliente: alineado con lo que envías desde el form
export async function registerUser(
  payload: ClientRegisterRequest
): Promise<AuthResponse> {
  // Ajusta la ruta si tu backend usa guiones: "/auth/register-client"
  return await http<AuthResponse>("/auth/registerClient", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Obtener todos los clientes (solo admin)
export async function getAllClients(
  page: number = 1,
  limit: number = 10,
  filters?: {
    search?: string;
    subscription?: string;
    isActive?: boolean;
    paymentStatus?: boolean;
  }
): Promise<ClientsListResponse> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  if (filters?.search) params.append("search", filters.search);
  if (filters?.subscription)
    params.append("subscription", filters.subscription);
  if (filters?.isActive !== undefined)
    params.append("isActive", String(filters.isActive));
  if (filters?.paymentStatus !== undefined)
    params.append("paymentStatus", String(filters.paymentStatus));

  return await http<ClientsListResponse>(`/clients?${params.toString()}`, {
    method: "GET",
  });
}

// Obtener perfil de cliente específico
export async function getClientProfile(clientId: string): Promise<Client> {
  return await http<Client>(`/clients/profile/${clientId}`, { method: "GET" });
}

// Actualizar perfil de cliente
export async function updateClientProfile(
  clientId: string,
  data: UpdateClientData
): Promise<{ message: string; client: Client }> {
  return await http<{ message: string; client: Client }>(
    `/clients/profile/${clientId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

// Eliminar cliente (solo admin)
export async function deleteClient(
  clientId: string
): Promise<{ message: string }> {
  return await http<{ message: string }>(`/clients/profile/${clientId}`, {
    method: "DELETE",
  });
}
