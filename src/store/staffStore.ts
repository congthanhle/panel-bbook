import { create } from 'zustand';
import { Staff } from '@/types/staff.types';
import { User } from '@/types/auth.types';
import { staffApi } from '@/features/staff/api';

interface StaffState {
  staffList: Staff[];
  currentStaffProfile: Staff | null;
  isLoading: boolean;
  error: string | null;
  init: (user: User) => void;
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
  init: (user: User) => {
    if (user.role === 'admin') {
      get().fetchStaff();
    } else if (user.role === 'staff') {
      get().fetchCurrentProfile();
    }
  },
  fetchStaff: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await staffApi.getAll({});
      const staffList = Array.isArray(response) ? response : (response as any).data ?? [];
      set({ staffList, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  fetchCurrentProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const currentStaffProfile = await staffApi.getMe();
      set({ currentStaffProfile, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  addStaff: async (staffData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await staffApi.create(staffData);
      set({ staffList: [...get().staffList, response], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  updateStaff: async (id, staffData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await staffApi.update(id, staffData);
      set({ 
        staffList: get().staffList.map(s => s.id === id ? { ...s, ...response } : s),
        currentStaffProfile: get().currentStaffProfile?.id === id ? { ...get().currentStaffProfile, ...response } : get().currentStaffProfile,
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
      await staffApi.deactivate(id);
      set({ staffList: get().staffList.filter(s => s.id !== id), isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));
