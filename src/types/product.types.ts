export type ProductCategory = 
  | 'equipment_rental' 
  | 'beverage' 
  | 'snack' 
  | 'shuttle_cock' 
  | 'coaching' 
  | 'other';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  unit: string;
  stock?: number;
  isService: boolean;
  imageUrl?: string;
  isActive: boolean;
  description?: string;
}
