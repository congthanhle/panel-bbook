import { create } from 'zustand';
import axios from 'axios';
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

const API_URL = import.meta.env.VITE_API_URL || '';

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  isLoading: false,
  error: null,

  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/customers`);
      set({ customers: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch customers', isLoading: false });
    }
  },

  createCustomer: async (customerData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/api/customers`, customerData);
      set((state) => ({
        customers: [...state.customers, response.data],
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
      const response = await axios.patch(`${API_URL}/api/customers/${id}`, customerData);
      set((state) => ({
        customers: state.customers.map((c) =>
          c.id === id ? response.data : c
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
      await axios.delete(`${API_URL}/api/customers/${id}`);
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
