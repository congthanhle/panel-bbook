import { create } from 'zustand';
import { customersApi } from '@/features/customers/api';
import { Customer, CustomerStats, MembershipTier, CreateCustomerDto, UpdateCustomerDto } from '@/types/customer.types';

interface CustomerState {
  customers: Customer[];
  stats: CustomerStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Pagination & Filtering state
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search?: string;
    tier?: MembershipTier;
  };

  fetchStats: () => Promise<void>;
  fetchCustomers: (page?: number) => Promise<void>;
  setFilters: (filters: { search?: string; tier?: MembershipTier }) => void;
  createCustomer: (customerData: CreateCustomerDto) => Promise<void>;
  updateCustomer: (id: string, customerData: UpdateCustomerDto) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  stats: null,
  isLoading: false,
  error: null,
  
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},

  fetchStats: async () => {
    try {
      const stats = await customersApi.getStats();
      set({ stats });
    } catch (error) {
      console.error('Failed to fetch customer stats:', error);
    }
  },

  fetchCustomers: async (page) => {
    const { pagination, filters } = get();
    const targetPage = page ?? pagination.page;
    
    set({ isLoading: true, error: null });
    try {
      const response = await customersApi.getAll({
        page: targetPage,
        limit: pagination.limit,
        ...filters,
      });
      
      set({ 
        customers: response.data, 
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        },
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch customers', isLoading: false });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({ 
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 } // Reset to first page on filter change
    }));
    get().fetchCustomers();
  },

  createCustomer: async (customerData) => {
    set({ isLoading: true, error: null });
    try {
      await customersApi.create(customerData);
      set({ isLoading: false });
      // Refetch current page after create
      await get().fetchCustomers();
      // Optionally update stats
      get().fetchStats();
    } catch (error: any) {
      set({ error: error.message || 'Failed to create customer', isLoading: false });
      throw error;
    }
  },

  updateCustomer: async (id, customerData) => {
    set({ isLoading: true, error: null });
    try {
      await customersApi.update(id, customerData);
      set({ isLoading: false });
      // Refetch current page after update to get latest server state
      await get().fetchCustomers();
    } catch (error: any) {
      set({ error: error.message || 'Failed to update customer', isLoading: false });
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    const { customers, pagination } = get();
    set({ isLoading: true, error: null });
    try {
      await customersApi.delete(id);
      
      // Handle pagination logic when deleting
      // If we deleted the last item on the current page, and we're not on page 1, go to previous page
      const isLastItemOnPage = customers.length === 1;
      const targetPage = (isLastItemOnPage && pagination.page > 1) 
        ? pagination.page - 1 
        : pagination.page;
        
      set({ isLoading: false });
      await get().fetchCustomers(targetPage);
      get().fetchStats();
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete customer', isLoading: false });
      throw error;
    }
  },
}));
