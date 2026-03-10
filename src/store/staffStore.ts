import { create } from 'zustand';
import { Staff } from '@/types/staff.types';
import axios from '@/lib/axios';

interface StaffState {
  staffList: Staff[];
  currentStaffProfile: Staff | null;
  isLoading: boolean;
  error: string | null;
  fetchStaff: () => Promise<void>;
  fetchCurrentProfile: () => Promise<void>;
  addStaff: (staffData: Omit<Staff, 'id'>) => Promise<void>;
  updateStaff: (id: string, staffData: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  staffList: [],
  currentStaffProfile: null,
  isLoading: false,
  error: null,
  fetchStaff: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/staff');
      set({ staffList: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  fetchCurrentProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/staff/me');
      set({ currentStaffProfile: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  addStaff: async (staffData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/staff', staffData);
      set({ staffList: [...get().staffList, response.data], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  updateStaff: async (id, staffData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.patch(`/staff/${id}`, staffData);
      set({ 
        staffList: get().staffList.map(s => s.id === id ? { ...s, ...response.data } : s),
        currentStaffProfile: get().currentStaffProfile?.id === id ? { ...get().currentStaffProfile, ...response.data } : get().currentStaffProfile,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  deleteStaff: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`/staff/${id}`);
      set({ staffList: get().staffList.filter(s => s.id !== id), isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));
