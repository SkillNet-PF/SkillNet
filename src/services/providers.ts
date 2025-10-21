import { http } from "./http";
import { AuthResponse, ProviderRegisterRequest } from "./types";

// Interfaces para proveedores
export interface ServiceProvider {
  userId: string;
  imgProfile?: string;
  name: string;
  birthDate: string;
  email: string;
  address: string;
  phone: string;
  rol: "provider";
  isActive: boolean;
  serviceType: string;
  about: string; // Correcto: "about" no "bio"
  dias: string[];
  horarios: string[];
  category?: {
    categoryId: string;
    name: string;
    description?: string;
  };
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

// Registro de proveedor - Actualizado para coincidir con backend
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
  const res = await http<any>("/serviceprovider", { method: "GET" });

  const normalize = (p: any): ServiceProvider => {
    const cat = p?.category;
    const category = cat
      ? {
          categoryId: cat?.categoryId ?? cat?.CategoryID ?? cat?.id ?? "",
          name: cat?.name ?? cat?.Name ?? "",
          description: cat?.description ?? cat?.Description ?? undefined,
        }
      : undefined;

    return {
      userId: p.userId,
      imgProfile: p.imgProfile,
      name: p.name,
      birthDate: p.birthDate,
      email: p.email,
      address: p.address,
      phone: p.phone,
      rol: "provider",
      isActive: !!p.isActive,
      serviceType: p.serviceType,
      about: p.bio ?? p.about,
      dias: Array.isArray(p.dias) ? p.dias : [],
      horarios: Array.isArray(p.horarios) ? p.horarios : [],
      category,
    } as ServiceProvider;
  };

  if (Array.isArray(res)) {
    return { providers: res.map(normalize) } as ProvidersListResponse;
  }

  if (Array.isArray(res?.providers)) {
    return { ...res, providers: res.providers.map(normalize) } as ProvidersListResponse;
  }

  // Fallback: estructura inesperada
  return { providers: [] } as ProvidersListResponse;
}

// Obtener proveedor específico por ID
export async function getProviderById(
  providerId: string
): Promise<ServiceProvider> {
  return await http<ServiceProvider>(`/serviceprovider/${providerId}`, {
    method: "GET",
  });
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
