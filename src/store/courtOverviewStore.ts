import { create } from 'zustand';
import dayjs, { Dayjs } from 'dayjs';
import { SlotCell, SingleActionPayload, BulkActionPayload, Court, OperatingHours, CreateBookingPayload } from '@/types/overview.types';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

interface CourtOverviewState {
  selectedDate: Dayjs;
  slots: Record<string, SlotCell>;
  courts: Court[];
  operatingHours: OperatingHours | null;
  selectedCells: string[];
  isSelecting: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setDate: (date: Dayjs) => void;
  setIsSelecting: (isSelecting: boolean) => void;
  toggleCellSelection: (cellId: string) => void;
  clearSelection: () => void;
  addCellsToSelection: (cellIds: string[]) => void;
  
  // API Actions
  loadOverviewData: (date: Dayjs) => Promise<void>;
  toggleLockSlot: (payload: SingleActionPayload) => Promise<void>;
  bulkLockSlots: (payload: BulkActionPayload) => Promise<void>;
  createBooking: (payload: CreateBookingPayload) => Promise<void>;
  cancelBooking: (payload: SingleActionPayload) => Promise<void>;
}

export const useCourtOverviewStore = create<CourtOverviewState>((set, get) => ({
  selectedDate: dayjs(),
  slots: {},
  courts: [],
  operatingHours: null,
  selectedCells: [],
  isSelecting: false,
  isLoading: false,
  error: null,

  setDate: (date) => set({ selectedDate: date }),
  
  setIsSelecting: (isSelecting) => set({ isSelecting }),
  
  toggleCellSelection: (cellId) => set((state) => {
    const isSelected = state.selectedCells.includes(cellId);
    return {
      selectedCells: isSelected 
        ? state.selectedCells.filter(id => id !== cellId)
        : [...state.selectedCells, cellId]
    };
  }),
  
  clearSelection: () => set({ selectedCells: [], isSelecting: false }),
  
  addCellsToSelection: (cellIds) => set((state) => {
    // Only add unique cells that aren't already selected
    const newCells = cellIds.filter(id => !state.selectedCells.includes(id));
    return { selectedCells: [...state.selectedCells, ...newCells] };
  }),

  loadOverviewData: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const formattedDate = date.format('YYYY-MM-DD');
      const response = await axios.get(`${API_URL}/api/overview?date=${formattedDate}`);
      
      set({ 
        slots: response.data.slots,
        courts: response.data.courts,
        operatingHours: response.data.operatingHours,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load overview data', 
        isLoading: false 
      });
    }
  },

  toggleLockSlot: async (payload) => {
    try {
      const { courtId, timeSlotId, action } = payload;
      const key = `${courtId}_${timeSlotId}`;
      const currentSlot = get().slots[key];
      
      // Optimistic update
      if (currentSlot) {
        set((state) => ({
          slots: {
            ...state.slots,
            [key]: {
              ...currentSlot,
              status: action === 'lock' ? 'locked' : 'available',
              lockedReason: payload.reason || currentSlot.lockedReason
            }
          }
        }));
      }

      await axios.patch(`${API_URL}/api/slots/lock`, payload);
      
    } catch (error) {
      // Revert optimistic update (in a real app we'd need the previous state)
      get().loadOverviewData(get().selectedDate);
      throw error;
    }
  },

  bulkLockSlots: async (payload) => {
     try {
       // Optimistic update
       set((state) => {
         const newSlots = { ...state.slots };
         payload.slots.forEach(key => {
           if (newSlots[key]) {
             newSlots[key] = {
               ...newSlots[key],
               status: payload.action === 'lock' ? 'locked' : 'available',
               lockedReason: payload.reason || newSlots[key].lockedReason
             };
           }
         });
         return { slots: newSlots, selectedCells: [], isSelecting: false };
       });

       await axios.patch(`${API_URL}/api/slots/bulk`, payload);

     } catch (error) {
        get().loadOverviewData(get().selectedDate);
        throw error;
     }
  },

  createBooking: async (payload) => {
    try {
       // Optimistically block the slots pending loadOverviewData refresh
       set((state) => {
          const newSlots = { ...state.slots };
          payload.selectedCells.forEach(key => {
             if (newSlots[key]) {
                newSlots[key] = {
                   ...newSlots[key],
                   status: 'booked',
                   booking: {
                       id: 'optimistic-booking',
                       customerName: payload.customerName,
                       customerInitial: payload.customerName.charAt(0).toUpperCase(),
                       phone: payload.phone,
                       amount: payload.totalAmount / payload.selectedCells.length,
                       paymentStatus: payload.paymentMode === 'cash' && payload.downPayment === 0 ? 'pending' : 'paid',
                       status: 'confirmed'
                   }
                };
             }
          });
          return { slots: newSlots, selectedCells: [], isSelecting: false };
       });

       await axios.post(`${API_URL}/api/bookings`, payload);
       
       // Re-fetch to get real ID
       get().loadOverviewData(get().selectedDate);

    } catch (error) {
       get().loadOverviewData(get().selectedDate);
       throw error;
    }
  },

  cancelBooking: async (payload) => {
    try {
      const { courtId, timeSlotId } = payload;
      const key = `${courtId}_${timeSlotId}`;
      const currentSlot = get().slots[key];

      // Optimistic update: revert to available and clear booking details
      if (currentSlot) {
        set((state) => ({
          slots: {
            ...state.slots,
            [key]: {
              ...currentSlot,
              status: 'available',
              booking: undefined
            }
          }
        }));
      }

      await axios.patch(`${API_URL}/api/bookings/cancel`, payload);

    } catch (error) {
      get().loadOverviewData(get().selectedDate);
      throw error;
    }
  }
}));
