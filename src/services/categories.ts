import { http } from "./http";

export interface CategoryDto {
  categoryId: string;
  name: string;
  description?: string;
}

export async function getCategories(): Promise<CategoryDto[]> {
  return await http<CategoryDto[]>("/categories", { method: "GET" });
}


