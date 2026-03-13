import { create } from 'zustand';
import { Shift, BulkCreateShiftDto } from '@/types/shift.types';
import axios from '@/lib/axios';
import { shiftsApi } from '@/features/shifts/api';

interface ShiftState {
  shifts: Shift[];
  myShifts: Shift[];
  isLoading: boolean;
  error: string | null;
  fetchShifts: (month?: string) => Promise<void>;
  fetchMyShifts: () => Promise<void>;
  createShift: (shiftData: Omit<Shift, 'id' | 'status' | 'assignedStaff'> & { staffIds: string[] }) => Promise<void>;
  createBulkShift: (bulkData: BulkCreateShiftDto) => Promise<void>;
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
      const shifts = response.data.map((shift: any) => ({
        ...shift,
        startTime: shift.start_time,
        endTime: shift.end_time,
        assignedStaff: shift.shift_assignments?.map((a: any) => a.users) || []
      }));
      set({ shifts, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchMyShifts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/shifts/my');
      const myShifts = response.data.map((shift: any) => ({
        ...shift,
        startTime: shift.start_time,
        endTime: shift.end_time,
        assignedStaff: shift.shift_assignments?.map((a: any) => a.users) || []
      }));
      set({ myShifts, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createShift: async (shiftData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/shifts', shiftData);
      const newShift = {
        ...response.data,
        startTime: response.data.start_time,
        endTime: response.data.end_time,
        assignedStaff: response.data.shift_assignments?.map((a: any) => a.users) || []
      };
      set({ shifts: [...get().shifts, newShift], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createBulkShift: async (bulkData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await shiftsApi.createBulk(bulkData);
      const newShifts = response.map((shift: any) => ({
        ...shift,
        startTime: shift.start_time,
        endTime: shift.end_time,
        assignedStaff: shift.shift_assignments?.map((a: any) => a.users) || []
      }));
      set({ shifts: [...get().shifts, ...newShifts], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateShift: async (id, shiftData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.patch(`/shifts/${id}`, shiftData);
      const updatedShift = {
        ...response.data,
        startTime: response.data.start_time,
        endTime: response.data.end_time,
        assignedStaff: response.data.shift_assignments?.map((a: any) => a.users) || []
      };
      set({ 
        shifts: get().shifts.map(s => s.id === id ? { ...s, ...updatedShift } : s),
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
      const response = await axios.post(`/shifts/${shiftId}/assign`, { staffIds: [staffId] });
      // response.data is an array of assignments
      const assignedStaff = response.data.map((a: any) => a.users) || [];
      set({
        shifts: get().shifts.map(s => s.id === shiftId ? { ...s, assignedStaff } : s),
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
      await axios.delete(`/shifts/${shiftId}/staff/${staffId}`);
      set({
        shifts: get().shifts.map(s => s.id === shiftId 
          ? { ...s, assignedStaff: s.assignedStaff.filter((staff: any) => staff.id !== staffId) } 
          : s),
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
