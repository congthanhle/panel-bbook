import { apiClient } from '@/lib/api-client';
import { PaginatedResponse } from '@/types/common.types';
import { 
  Product, 
  ProductQueryDto, 
  CreateProductDto, 
  UpdateProductDto 
} from '@/types/product.types';

export const productsApi = {
  getAll: (params?: ProductQueryDto) =>
    apiClient.get<PaginatedResponse<Product>>("/products", params),

  getLowStock: () =>
    apiClient.get<Product[]>("/products/low-stock"),

  getOne: (id: string) =>
    apiClient.get<Product>(`/products/${id}`),

  create: (dto: CreateProductDto) =>
    apiClient.post<Product>("/products", dto),

  update: (id: string, dto: UpdateProductDto) =>
    apiClient.patch<Product>(`/products/${id}`, dto),

  toggleActive: (id: string) =>
    apiClient.patch(`/products/${id}/toggle`),

  adjustStock: (id: string, adjustment: number, reason?: string) =>
    apiClient.patch(`/products/${id}/stock`, { adjustment, reason }),

  delete: (id: string) =>
    apiClient.del(`/products/${id}`),
};
