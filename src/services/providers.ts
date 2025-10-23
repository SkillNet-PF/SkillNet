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
  bio: string;
  /** retro-compat: otros módulos aún leen 'about' */
  about?: string;
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
  /** nuevo campo “bueno” */
  bio?: string;
  /** compat con código viejo */
  about?: string;
  dias?: string[];
  horarios?: string[];
  imgProfile?: string;
  /** si decides actualizar por id desde otros flows */
  categoryId?: string;
}

export interface ProviderSearchFilters {
  name?: string;
  category?: string;
  serviceType?: string;
  dias?: string;
  horarios?: string;
}

/* ======================================================
   Adaptador: /serviceprovider/dashboard
   Estructura del back:
   { provider, confirmedAppointments, pendingAppointments }
   con provider.category { CategoryID, Name }
====================================================== */
export function mapProviderDashboardResponse(data: any): ServiceProvider {
  const p = data.provider ?? data;

  const bioVal = p?.bio ?? p?.about ?? "";

  return {
    userId: p.userId,
    imgProfile: p.imgProfile ?? null,
    name: p.name,
    birthDate: p.birthDate,
    email: p.email,
    address: p.address,
    phone: p.phone,
    rol: p.rol,
    isActive: !!p.isActive,
    serviceType: p.category?.Name || p.category?.name || "",
    bio: bioVal,
    about: bioVal, // 👈 mantiene vivo el resto del front
    dias: Array.isArray(p.dias) ? p.dias : [],
    horarios: Array.isArray(p.horarios) ? p.horarios : [],
    category: p.category
      ? {
          categoryId:
            p.category.CategoryID ??
            p.category.categoryId ??
            p.category.id ??
            "",
          name: p.category.Name ?? p.category.name ?? "",
          description: p.category.Description ?? p.category.description ?? "",
        }
      : undefined,
    schedule: p.schedule || [],
    confirmedAppointments:
      data.confirmedAppointments ?? p.confirmedAppointments,
    pendingAppointments: data.pendingAppointments ?? p.pendingAppointments,
  };
}

/* ======================================================
   Endpoints
====================================================== */

// Registro de proveedor
export async function registerProvider(
  payload: ProviderRegisterRequest
): Promise<AuthResponse> {
  // Sanitizar: enviar solo propiedades permitidas por el backend
  const {
    name,
    email,
    password,
    confirmPassword,
    birthDate,
    address,
    phone,
    rol,
    serviceType,
    about,
    days,
    horarios,
    category,
  } = payload as any;

  const cleanPayload = {
    name,
    email,
    password,
    confirmPassword,
    birthDate,
    address,
    phone,
    rol,
    serviceType,
    about,
    days,
    horarios,
    category,
  };

  return await http<AuthResponse>("/auth/registerProvider", {
    method: "POST",
    body: JSON.stringify(cleanPayload),
  });
}

// (Opcional) crear provider
export async function createProvider(
  data: UpdateProviderData
): Promise<ServiceProvider> {
  return await http<ServiceProvider>("/serviceprovider", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Lista de proveedores
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

    const bioVal = p?.bio ?? p?.about ?? "";

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
      bio: bioVal,
      about: bioVal, // 👈 compat
      dias: Array.isArray(p.dias) ? p.dias : [],
      horarios: Array.isArray(p.horarios) ? p.horarios : [],
      category,
    } as ServiceProvider;
  };

  if (Array.isArray(res)) return { providers: res.map(normalize) };

  if (Array.isArray(res?.providers)) {
    return { ...res, providers: res.providers.map(normalize) };
  }

  return { providers: [] };
}

// Proveedor por id
export async function getProviderById(
  providerId: string
): Promise<ServiceProvider> {
  return await http<ServiceProvider>(`/serviceprovider/${providerId}`, {
    method: "GET",
  });
}

// ✅ Dashboard provider (ya mapeado)
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

// Eliminar (admin)
export async function deleteProvider(
  providerId: string
): Promise<{ message: string }> {
  return await http<{ message: string }>(`/serviceprovider/${providerId}`, {
    method: "DELETE",
  });
}

// Buscar con filtros
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
    { method: "GET" }
  );
}
