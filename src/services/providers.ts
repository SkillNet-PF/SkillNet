import { http } from "./http";
import { AuthResponse, ProviderRegisterRequest } from "./types";


export interface ServiceProvider {
  userId: string;
  imgProfile?: string | null;
  name: string;
  birthDate: string;
  email: string;
  address: string;
  phone: string;
  rol: "provider";
  isActive: boolean;
  serviceType?: string;
  about: string;
  dias: string[];
  horarios: string[];
  category?: {
    categoryId: string;
    name: string;
    description?: string;
  };
  schedule?: any[];
  confirmedAppointments?: number;
  pendingAppointments?: number;
}

export interface ProvidersListResponse {
  providers: ServiceProvider[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface UpdateProviderData {
  name?: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  serviceType?: string;
  bio?: string;
  dias?: string[];
  horarios?: string[];
  imgProfile?: string;
  categoryId?: string;
}

export interface ProviderSearchFilters {
  name?: string;
  category?: string;
  serviceType?: string;
  dias?: string;
  horarios?: string;
}

// ======================================================
// 🧠 Adaptador de datos desde el backend
// ======================================================
export function mapProviderDashboardResponse(data: any): ServiceProvider {
  const p = data.provider;

  const mappedProvider: ServiceProvider = {
    userId: p.userId,
    imgProfile: p.imgProfile,
    name: p.name,
    birthDate: p.birthDate,
    email: p.email,
    address: p.address,
    phone: p.phone,
    rol: p.rol,
    isActive: p.isActive,
    serviceType: p.category?.Name || "",
    about: p.bio || "",
    dias: p.dias || [],
    horarios: p.horarios || [],
    category: p.category
      ? {
          categoryId: p.category.CategoryID,
          name: p.category.Name,
          description: "",
        }
      : undefined,
    schedule: p.schedule || [],
    confirmedAppointments: data.confirmedAppointments,
    pendingAppointments: data.pendingAppointments,
  };

  return mappedProvider;
}

// ======================================================
// 🧾 Endpoints
// ======================================================

// Registro de proveedor
export async function registerProvider(
  payload: ProviderRegisterRequest
): Promise<AuthResponse> {
  return await http<AuthResponse>("/auth/registerProvider", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Crear perfil de proveedor (POST /serviceprovider)
export async function createProvider(
  data: UpdateProviderData
): Promise<ServiceProvider> {
  return await http<ServiceProvider>("/serviceprovider", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Obtener todos los proveedores
export async function getAllProviders(): Promise<ProvidersListResponse> {
  return await http<ProvidersListResponse>("/serviceprovider", {
    method: "GET",
  });
}

// Obtener proveedor específico por ID
export async function getProviderById(
  providerId: string
): Promise<ServiceProvider> {
  return await http<ServiceProvider>(`/serviceprovider/${providerId}`, {
    method: "GET",
  });
}

// ✅ Nuevo: Obtener dashboard del proveedor (ya mapeado)
export async function getDashboardProvider(): Promise<ServiceProvider> {
  const data = await http(`/serviceprovider/dashboard`, { method: "GET" });
  return mapProviderDashboardResponse(data);
}

// Actualizar proveedor
export async function updateProvider(
  providerId: string,
  data: UpdateProviderData
): Promise<ServiceProvider> {
  return await http<ServiceProvider>(`/serviceprovider/${providerId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Eliminar proveedor (solo admin)
export async function deleteProvider(
  providerId: string
): Promise<{ message: string }> {
  return await http<{ message: string }>(`/serviceprovider/${providerId}`, {
    method: "DELETE",
  });
}

// Buscar proveedores con filtros
export async function searchProviders(
  filters: ProviderSearchFilters
): Promise<ServiceProvider[]> {
  const params = new URLSearchParams();

  if (filters.name) params.append("name", filters.name);
  if (filters.category) params.append("category", filters.category);
  if (filters.serviceType) params.append("serviceType", filters.serviceType);
  if (filters.dias) params.append("dias", filters.dias);
  if (filters.horarios) params.append("horarios", filters.horarios);

  return await http<ServiceProvider[]>(
    `/serviceprovider/search?${params.toString()}`,
    {
      method: "GET",
    }
  );
}
