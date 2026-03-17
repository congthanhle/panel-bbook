import { create } from 'zustand';
import { productsApi } from '@/features/products/api';
import { Product, ProductQueryDto, ProductCategory } from '@/types/product.types';

interface ProductState {
  products: Product[];
  lowStockProducts: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search?: string;
    category?: ProductCategory;
    isActive?: boolean;
    isService?: boolean;
  };
  isLoading: boolean;
  error: string | null;
  
  fetchProducts: (page?: number) => Promise<void>;
  fetchLowStock: () => Promise<void>;
  setFilters: (filters: Partial<ProductState['filters']>) => void;
  createProduct: (productData: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
  adjustStock: (id: string, adjustment: number, reason?: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  lowStockProducts: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  isLoading: false,
  error: null,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 }, // Reset to page 1 on filter
    }));
    get().fetchProducts(1);
  },

  fetchProducts: async (page = get().pagination.page) => {
    set({ isLoading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params: ProductQueryDto = {
        page,
        limit: pagination.limit,
        ...filters,
      };
      
      const response = await productsApi.getAll(params);
      
      // The backend returns snake_case attributes.
      // Map them to the frontend camelCase `Product` interface.
      const mappedData: Product[] = (response.data || []).map((raw: any) => ({
        id: raw.id,
        name: raw.name,
        category: raw.category,
        price: raw.price,
        costPrice: raw.cost_price,
        sku: raw.sku,
        stock: raw.stock_qty,
        isService: raw.category === 'rental',
        imageUrl: raw.image_url,
        isActive: raw.is_active,
        description: raw.description,
      }));
      
      set({ 
        products: mappedData, 
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        },
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch products', isLoading: false });
    }
  },

  fetchLowStock: async () => {
    try {
      const data = await productsApi.getLowStock();
      set({ lowStockProducts: data });
    } catch (error: any) {
      console.error('Failed to fetch low stock products', error);
    }
  },

  createProduct: async (productData: any) => {
    set({ isLoading: true, error: null });
    try {
      const payload: any = {
        name: productData.name,
        category: productData.category,
        price: productData.price,
        description: productData.description,
        imageUrl: productData.imageUrl,
        stockQty: productData.stock,
      };
      
      if (productData.sku !== undefined) payload.sku = productData.sku;
      if (productData.costPrice !== undefined) payload.costPrice = productData.costPrice;
      if (productData.isActive !== undefined) payload.isActive = productData.isActive;

      await productsApi.create(payload);
      await get().fetchProducts();
      await get().fetchLowStock();
    } catch (error: any) {
      set({ error: error.message || 'Failed to create product', isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id: string, productData: any) => {
    set({ isLoading: true, error: null });
    try {
      const payload: any = { ...productData };
      
      if (payload.stock !== undefined) {
        payload.stockQty = payload.stock;
        delete payload.stock;
      }
      
      // The backend DTO no longer accepts these fields:
      delete payload.isService;
      delete payload.unit;

      await productsApi.update(id, payload);
      await get().fetchProducts();
      await get().fetchLowStock();
    } catch (error: any) {
      set({ error: error.message || 'Failed to update product', isLoading: false });
      throw error;
    }
  },

  toggleActive: async (id: string) => {
    try {
      await productsApi.toggleActive(id);
      await get().fetchProducts();
    } catch (error: any) {
      throw error;
    }
  },

  adjustStock: async (id: string, adjustment: number, reason?: string) => {
    const previousProducts = get().products;
    const previousLowStock = get().lowStockProducts;
    
    // Optimistic UI update
    set((state) => ({
      products: state.products.map(p => 
        p.id === id ? { ...p, stock: (p.stock || 0) + adjustment } : p
      ),
      lowStockProducts: state.lowStockProducts.map(p => 
        p.id === id ? { ...p, stock: (p.stock || 0) + adjustment } : p
      )
    }));

    try {
      await productsApi.adjustStock(id, adjustment, reason);
      // Ensure absolute consistency by refreshing low stock badges
      get().fetchLowStock();
    } catch (error: any) {
      // Revert optimistic updates on failure
      set({ 
        products: previousProducts,
        lowStockProducts: previousLowStock
      });
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await productsApi.delete(id);
      
      const { pagination, products } = get();
      if (products.length === 1 && pagination.page > 1) {
        await get().fetchProducts(pagination.page - 1);
      } else {
        await get().fetchProducts();
      }
      await get().fetchLowStock();
      
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete product', isLoading: false });
      throw error;
    }
  },
}));
