import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import { Product } from '@/types/product.types';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  
  fetchProducts: () => Promise<void>;
  createProduct: (productData: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.get<Product[]>('/products');
      set({ products: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch products', isLoading: false });
    }
  },

  createProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.post<Product>('/products', productData);
      set((state) => ({
        products: [...state.products, data],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to create product', isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.patch<Product>(`/products/${id}`, productData);
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? data : p
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update product', isLoading: false });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.del(`/products/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete product', isLoading: false });
      throw error;
    }
  },
}));
