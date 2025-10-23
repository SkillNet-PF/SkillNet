import { http } from './http';

export interface SearchResult {
  id: string;
  type: 'provider' | 'category' | 'appointment' | 'profile' | 'dashboard';
  title: string;
  subtitle?: string;
  description?: string;
}

export interface ProviderSearchResult {
  userId: string;
  Name: string;
  Description?: string;
  Category?: {
    CategoryID: string;
    Name: string;
  };
}

export interface CategorySearchResult {
  CategoryID: string;
  Name: string;
}

export interface AppointmentSearchResult {
  AppointmentID: string;
  AppointmentDate: string;
  Status: string;
  UserProvider?: {
    Name: string;
  };
  UserClient?: {
    Name: string;
  };
  Category?: {
    Name: string;
  };
}

export async function searchGlobal(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  try {
    // Buscar proveedores (disponible para todos)
    const providers = await searchProviders(query);
    results.push(...providers.map(provider => ({
      id: provider.userId,
      type: 'provider' as const,
      title: provider.Name,
      subtitle: provider.Category?.Name,
      description: provider.Description
    })));

    // Buscar categorías (disponible para todos)
    const categories = await searchCategories(query);
    results.push(...categories.map(category => ({
      id: category.CategoryID,
      type: 'category' as const,
      title: category.Name,
      subtitle: 'Categoría de servicios'
    })));

    // Buscar turnos (solo si el usuario está autenticado)
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const appointments = await searchAppointments(query);
        results.push(...appointments.map(appointment => ({
          id: appointment.AppointmentID,
          type: 'appointment' as const,
          title: `Turno - ${appointment.Category?.Name || 'Servicio'}`,
          subtitle: appointment.UserProvider?.Name || appointment.UserClient?.Name,
          description: new Date(appointment.AppointmentDate).toLocaleDateString()
        })));
      } catch (error) {
        // Si falla la búsqueda de turnos, continuamos sin ellos
        console.warn('Error searching appointments:', error);
      }

      // Buscar perfil del usuario actual
      if (query.toLowerCase().includes('perfil') || query.toLowerCase().includes('mi perfil') || query.toLowerCase().includes('profile')) {
        results.push({
          id: 'profile',
          type: 'profile' as const,
          title: 'Mi Perfil',
          subtitle: 'Editar información personal',
          description: 'Acceder a configuración de perfil'
        });
      }

      // Buscar dashboard según el rol del usuario
      const dashboardKeywords = ['dashboard', 'panel', 'administrar', 'gestionar', 'admin', 'administrador'];
      const providerKeywords = ['proveedor', 'provider', 'servicios', 'agenda', 'mi agenda'];
      const clientKeywords = ['cliente', 'client', 'turnos', 'mis turnos', 'citas'];
      
      const queryLower = query.toLowerCase();
      
      // Detectar si busca dashboard
      const isDashboardSearch = dashboardKeywords.some(keyword => queryLower.includes(keyword));
      const isProviderSearch = providerKeywords.some(keyword => queryLower.includes(keyword));
      const isClientSearch = clientKeywords.some(keyword => queryLower.includes(keyword));
      
      if (isDashboardSearch || isProviderSearch || isClientSearch) {
        results.push({
          id: 'dashboard',
          type: 'dashboard' as const,
          title: 'Mi Dashboard',
          subtitle: 'Panel de control personal',
          description: 'Acceder a tu área de trabajo'
        });
      }
    }

    // Limitar resultados y ordenar por relevancia
    return results
      .slice(0, 10)
      .sort((a, b) => {
        // Priorizar coincidencias exactas en el título
        const aExact = a.title.toLowerCase().includes(query.toLowerCase());
        const bExact = b.title.toLowerCase().includes(query.toLowerCase());
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Luego por tipo (proveedores primero)
        const typeOrder = { provider: 0, category: 1, profile: 2, dashboard: 3, appointment: 4 };
        return typeOrder[a.type] - typeOrder[b.type];
      });

  } catch (error) {
    console.error('Error in global search:', error);
    return [];
  }
}

export async function searchProviders(query: string): Promise<ProviderSearchResult[]> {
  try {
    const response = await http<ProviderSearchResult[]>(`/serviceprovider/search?name=${encodeURIComponent(query)}`);
    return response || [];
  } catch (error) {
    console.error('Error searching providers:', error);
    return [];
  }
}

export async function searchCategories(query: string): Promise<CategorySearchResult[]> {
  try {
    const response = await http<CategorySearchResult[]>('/categories');
    const allCategories = response || [];
    
    // Filtrar categorías que coincidan con la búsqueda
    return allCategories.filter(category => 
      category.Name.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching categories:', error);
    return [];
  }
}

export async function searchAppointments(query: string): Promise<AppointmentSearchResult[]> {
  try {
    // Buscar turnos del usuario actual
    const response = await http<AppointmentSearchResult[]>('/appointments/my-appointments');
    const appointments = response || [];
    
    // Filtrar turnos que coincidan con la búsqueda
    return appointments.filter(appointment => {
      const searchLower = query.toLowerCase();
      return (
        appointment.UserProvider?.Name.toLowerCase().includes(searchLower) ||
        appointment.UserClient?.Name.toLowerCase().includes(searchLower) ||
        appointment.Category?.Name.toLowerCase().includes(searchLower) ||
        appointment.Status.toLowerCase().includes(searchLower)
      );
    });
  } catch (error) {
    console.error('Error searching appointments:', error);
    return [];
  }
}

export async function searchProvidersByCategory(categoryId: string): Promise<ProviderSearchResult[]> {
  try {
    const response = await http<ProviderSearchResult[]>(`/serviceprovider/search?category=${encodeURIComponent(categoryId)}`);
    return response || [];
  } catch (error) {
    console.error('Error searching providers by category:', error);
    return [];
  }
}
