import { create } from 'zustand';
import axios from 'axios';
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

const API_URL = import.meta.env.VITE_API_URL || '';

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      set({ products: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch products', isLoading: false });
    }
  },

  createProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/api/products`, productData);
      set((state) => ({
        products: [...state.products, response.data],
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
      const response = await axios.patch(`${API_URL}/api/products/${id}`, productData);
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? response.data : p
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
      await axios.delete(`${API_URL}/api/products/${id}`);
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
