import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import { Customer } from '@/types/customer.types';

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  
  fetchCustomers: () => Promise<void>;
  createCustomer: (customerData: Partial<Customer>) => Promise<void>;
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  isLoading: false,
  error: null,

  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.get<Customer[]>('/customers');
      set({ customers: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch customers', isLoading: false });
    }
  },

  createCustomer: async (customerData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.post<Customer>('/customers', customerData);
      set((state) => ({
        customers: [...state.customers, data],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to create customer', isLoading: false });
      throw error;
    }
  },

  updateCustomer: async (id, customerData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.patch<Customer>(`/customers/${id}`, customerData);
      set((state) => ({
        customers: state.customers.map((c) =>
          c.id === id ? data : c
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update customer', isLoading: false });
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.del(`/customers/${id}`);
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete customer', isLoading: false });
      throw error;
    }
  },
}));
