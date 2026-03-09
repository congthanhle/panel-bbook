import { create } from 'zustand';
import dayjs, { Dayjs } from 'dayjs';
import { SlotCell, SingleActionPayload, BulkActionPayload, Court, OperatingHours, CreateBookingPayload } from '@/types/overview.types';
import axios from 'axios';
import { message } from 'antd';
import { overviewApi } from '@/features/court-overview/api';

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
    const { courtId, timeSlotId, action, reason } = payload;
    const date = get().selectedDate.format('YYYY-MM-DD');
    const key = `${courtId}_${timeSlotId}`;
    const prev = get().slots[key];
    
    // 1. Optimistic update
    if (prev) {
      set((state) => ({
        slots: {
          ...state.slots,
          [key]: {
            ...prev,
            status: action === 'lock' ? 'locked' : 'available',
            lockedReason: reason || prev.lockedReason
          }
        }
      }));
    }

    try {
      // 2. Real API call
      await overviewApi.updateSlot({ courtId, date, timeSlotId, action, reason });
      // 3. Success
      message.success(action === 'lock' ? 'Slot locked' : 'Slot unlocked');
    } catch (error) {
      // 4. Rollback on failure
      if (prev) {
        set((state) => ({
          slots: {
            ...state.slots,
            [key]: prev
          }
        }));
      }
      message.error("Failed to update slot");
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
    const coveredKeys = payload.selectedCells;
    const prevSlots = { ...get().slots };

    // 1. Optimistically mark all covered slots as booked
    set((state) => {
      const newSlots = { ...state.slots };
      coveredKeys.forEach(key => {
        if (newSlots[key]) {
          newSlots[key] = {
            ...newSlots[key],
            status: 'booked'
          };
        }
      });
      return { slots: newSlots };
    });

    try {
      const booking = await overviewApi.createBooking(payload as any);
      
      // 2. Update cells with real booking data
      set((state) => {
        const newSlots = { ...state.slots };
        coveredKeys.forEach(key => {
          if (newSlots[key]) {
            newSlots[key] = {
              ...newSlots[key],
              booking: {
                id: booking.id || 'optimistic-booking',
                customerName: booking.customerName || payload.customerName,
                customerInitial: ((booking.customerName || payload.customerName) || 'C').charAt(0).toUpperCase(),
                phone: booking.phone || payload.phone,
                amount: payload.totalAmount / coveredKeys.length,
                paymentStatus: payload.paymentMode === 'cash' && payload.downPayment === 0 ? 'pending' : 'paid',
                status: 'confirmed'
              }
            };
          }
        });
        return { slots: newSlots, selectedCells: [], isSelecting: false };
      });
      message.success(`Booking ${booking.bookingCode || 'created'} successfully`);
    } catch (err: any) {
      // 3. Rollback all slots
      set({ slots: prevSlots });
      // 4. Show conflict details
      const errorData = err.response?.data || err;
      if (errorData.code === "SLOT_NOT_AVAILABLE") {
        message.error(`Conflicts: ${JSON.stringify(errorData.details?.conflicts || [])}`);
      } else {
        message.error(errorData.message || "Failed to create booking");
      }
      throw err;
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
