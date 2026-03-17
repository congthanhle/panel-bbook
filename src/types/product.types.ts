export type ProductCategory = 
  | 'equipment' 
  | 'refreshment' 
  | 'merchandise' 
  | 'rental' 
  | 'other';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  costPrice?: number;
  sku?: string;
  stock?: number;
  isService: boolean;
  imageUrl?: string;
  isActive: boolean;
  description?: string;
}

export interface ProductQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  category?: ProductCategory;
  isActive?: boolean;
  isService?: boolean;
}

export interface CreateProductDto {
  name: string;
  category: ProductCategory;
  price: number;
  costPrice?: number;
  sku?: string;
  stockQty?: number;
  imageUrl?: string;
  description?: string;
}

export type UpdateProductDto = Partial<CreateProductDto>;
