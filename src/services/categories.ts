import { http } from "./http";

export interface CategoryDto {
  categoryId: string;
  name: string;
  description?: string;
}

export async function getCategories(): Promise<CategoryDto[]> {
  const raw = await http<any[]>("/categories", { method: "GET" });
  // Normaliza keys desde el backend (CategoryID/Name) a camel-case
  return (raw || []).map((c: any) => ({
    categoryId: c?.categoryId ?? c?.CategoryID ?? c?.id ?? "",
    name: c?.name ?? c?.Name ?? "",
    description: c?.description ?? c?.Description ?? undefined,
  }));
}


