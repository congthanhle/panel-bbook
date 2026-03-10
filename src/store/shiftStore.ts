import { create } from 'zustand';
import { Shift } from '@/types/shift.types';
import axios from '@/lib/axios';

interface ShiftState {
  shifts: Shift[];
  myShifts: Shift[];
  isLoading: boolean;
  error: string | null;
  fetchShifts: (month?: string) => Promise<void>;
  fetchMyShifts: () => Promise<void>;
  createShift: (shiftData: Omit<Shift, 'id' | 'status' | 'assignedStaff'> & { staffIds: string[] }) => Promise<void>;
  updateShift: (id: string, shiftData: Partial<Shift> & { staffIds?: string[] }) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  assignStaffToShift: (shiftId: string, staffId: string) => Promise<void>;
  removeStaffFromShift: (shiftId: string, staffId: string) => Promise<void>;
  updateShiftStatus: (id: string, status: Shift['status']) => Promise<void>;
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  shifts: [],
  myShifts: [],
  isLoading: false,
  error: null,
  
  fetchShifts: async (month) => {
    set({ isLoading: true, error: null });
    try {
      const query = month ? `?month=${month}` : '';
      const response = await axios.get(`/shifts${query}`);
      set({ shifts: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchMyShifts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/shifts/my');
      set({ myShifts: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createShift: async (shiftData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/shifts', shiftData);
      set({ shifts: [...get().shifts, response.data], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateShift: async (id, shiftData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.patch(`/shifts/${id}`, shiftData);
      set({ 
        shifts: get().shifts.map(s => s.id === id ? { ...s, ...response.data } : s),
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteShift: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`/shifts/${id}`);
      set({ shifts: get().shifts.filter(s => s.id !== id), isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  assignStaffToShift: async (shiftId, staffId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/shifts/${shiftId}/assign`, { staffId });
      set({
        shifts: get().shifts.map(s => s.id === shiftId ? response.data : s),
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  removeStaffFromShift: async (shiftId, staffId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/shifts/${shiftId}/remove`, { staffId });
      set({
        shifts: get().shifts.map(s => s.id === shiftId ? response.data : s),
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateShiftStatus: async (id, status) => {
     set({ isLoading: true, error: null });
    try {
      const response = await axios.patch(`/shifts/${id}/status`, { status });
      set({ 
        shifts: get().shifts.map(s => s.id === id ? { ...s, status: response.data.status } : s),
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));
