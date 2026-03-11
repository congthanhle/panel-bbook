import { create } from 'zustand';
import dayjs, { Dayjs } from 'dayjs';
import { SlotCell, BulkActionPayload, Court, OperatingHours, Booking } from '@/types/overview.types';
import { message } from 'antd';
import { overviewApi, CreateBookingDto } from '@/features/overview/api';

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
  toggleSlotLock: (courtId: string, timeSlotId: string, date: string, action: 'lock' | 'unlock', reason?: string) => Promise<void>;
  bulkLockSlots: (payload: BulkActionPayload) => Promise<void>;
  createBooking: (dto: CreateBookingDto) => Promise<void>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<void>;

  // Slot-level booking updates (used by BookingDetailDrawer)
  updateSlotBooking: (cellKey: string, bookingUpdate: Partial<Booking>) => void;
  revertSlotToAvailable: (cellKey: string) => void;
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

  updateSlotBooking: (cellKey, bookingUpdate) => set((state) => {
    const slot = state.slots[cellKey];
    if (!slot || !slot.booking) return state;
    return {
      slots: {
        ...state.slots,
        [cellKey]: {
          ...slot,
          booking: { ...slot.booking, ...bookingUpdate },
        },
      },
    };
  }),

  revertSlotToAvailable: (cellKey) => set((state) => {
    const slot = state.slots[cellKey];
    if (!slot) return state;
    return {
      slots: {
        ...state.slots,
        [cellKey]: {
          ...slot,
          status: 'available',
          booking: undefined,
        },
      },
    };
  }),

  loadOverviewData: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const formattedDate = date.format('YYYY-MM-DD');
      const response = await overviewApi.getOverview(formattedDate);
      
      // The backend returns an array of courts, each with a nested `slots` array.
      // We must flatten this into the Record<string, SlotCell> expected by the grid.
      const rawCourts = (response as any).courts || [];
      const flattenedSlots: Record<string, SlotCell> = {};
      const mappedCourts: Court[] = [];

      rawCourts.forEach((c: any) => {
        mappedCourts.push({
          id: c.courtId,
          name: c.courtName,
          type: c.courtType as any,
          isActive: true // assuming active if returned from overview
        });

        const courtSlots = c.slots || [];
        courtSlots.forEach((s: any) => {
          const key = `${c.courtId}_${s.timeSlotId}`;
          flattenedSlots[key] = {
             courtId: c.courtId,
             timeSlotId: s.timeSlotId,
             status: s.status,
             lockedReason: s.lockedReason,
             booking: s.bookingId ? {
                id: s.bookingId,
                bookingCode: s.bookingCode,
                customerName: s.customerName || 'Unknown',
                customerInitial: s.customerName ? s.customerName.charAt(0).toUpperCase() : 'U',
                phone: s.customerPhone,
                status: s.bookingStatus,
                paymentStatus: s.paymentStatus,
                amount: 0 // Cannot easily derive from overview API alone
             } : undefined
          };
        });
      });

      // Operating hours are required for the grid axes to generate. Since backend
      // doesn't return this in getOverview, we define it based on generic business hours.
      const operatingHours: OperatingHours = (response as any).operatingHours || {
        openTime: '06:00',
        closeTime: '22:00',
        intervalMinutes: 30
      };

      set({
        slots: flattenedSlots,
        courts: mappedCourts,
        operatingHours: operatingHours,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load overview data',
        isLoading: false,
      });
    }
  },

  toggleSlotLock: async (courtId, timeSlotId, date, action, reason?) => {
    const key = `${courtId}_${timeSlotId}`;
    const prev = get().slots[key]; // save for rollback

    // 1. Optimistic update — instant UI feedback
    if (prev) {
      set((state) => ({
        slots: {
          ...state.slots,
          [key]: {
            ...prev,
            status: action === 'lock' ? 'locked' : 'available',
            lockedReason: action === 'lock' ? (reason || prev.lockedReason) : undefined,
          },
        },
      }));
    }

    try {
      // 2. Real API call
      await overviewApi.updateSlot({ courtId, date, timeSlotId, action, reason });
      // 3. Success: toast (subtle, not disruptive)
      message.success(action === 'lock' ? 'Slot locked' : 'Slot unlocked');
    } catch (err) {
      // 4. Rollback on failure
      if (prev) {
        set((state) => ({
          slots: { ...state.slots, [key]: prev },
        }));
      }
      message.error('Failed to update slot');
      throw err;
    }
  },

  bulkLockSlots: async (payload) => {
    const prevSlots = { ...get().slots };

    // 1. Optimistic update
    set((state) => {
      const newSlots = { ...state.slots };
      payload.slots.forEach((key) => {
        if (newSlots[key]) {
          newSlots[key] = {
            ...newSlots[key],
            status: payload.action === 'lock' ? 'locked' : 'available',
            lockedReason: payload.action === 'lock'
              ? (payload.reason || newSlots[key].lockedReason)
              : undefined,
          };
        }
      });
      return { slots: newSlots, selectedCells: [], isSelecting: false };
    });

    try {
      // 2. Real API call
      await overviewApi.bulkUpdateSlots({
        slots: payload.slots,
        action: payload.action,
        reason: payload.reason,
      });
      message.success(
        payload.action === 'lock'
          ? `${payload.slots.length} slots locked`
          : `${payload.slots.length} slots unlocked`,
      );
    } catch (err) {
      // 3. Rollback — full reload to ensure consistency
      set({ slots: prevSlots });
      message.error('Bulk update failed');
      get().loadOverviewData(get().selectedDate);
      throw err;
    }
  },

  createBooking: async (dto) => {
    const coveredKeys = dto.selectedCells;
    const prevSlots = { ...get().slots };

    // 1. Optimistically mark all covered slots as booked
    set((state) => {
      const newSlots = { ...state.slots };
      coveredKeys.forEach((key) => {
        if (newSlots[key]) {
          newSlots[key] = { ...newSlots[key], status: 'booked' };
        }
      });
      return { slots: newSlots };
    });

    try {
      const booking = await overviewApi.createBooking(dto);

      // 2. Update cells with real booking data (code, customerName)
      set((state) => {
        const newSlots = { ...state.slots };
        coveredKeys.forEach((key) => {
          if (newSlots[key]) {
            newSlots[key] = {
              ...newSlots[key],
              booking: {
                id: booking.id,
                bookingCode: booking.bookingCode,
                customerName: booking.customerName || dto.customerName,
                customerInitial: (booking.customerName || dto.customerName || 'C').charAt(0).toUpperCase(),
                phone: booking.phone || dto.phone,
                amount: dto.totalAmount / coveredKeys.length,
                paymentStatus: dto.paymentMode === 'cash' && !dto.downPayment ? 'pending' : 'paid',
                status: 'confirmed',
              },
            };
          }
        });
        return { slots: newSlots, selectedCells: [], isSelecting: false };
      });

      message.success(`Booking ${booking.bookingCode || 'created'} successfully`);
    } catch (err: any) {
      // 3. Rollback all slots
      set({ slots: prevSlots });

      // 4. Show conflict details if 409
      const errorData = err.response?.data || err;
      if (errorData.code === 'SLOT_NOT_AVAILABLE') {
        const conflicts = errorData.details?.conflicts || [];
        message.error(`Slot conflicts: ${conflicts.map((c: any) => c.label || c).join(', ')}`);
      } else {
        message.error(errorData.message || 'Failed to create booking');
      }
      throw err;
    }
  },

  cancelBooking: async (bookingId, reason?) => {
    try {
      await overviewApi.cancelBooking(bookingId, reason || '');
      // Reload to get fresh slot states
      await get().loadOverviewData(get().selectedDate);
      message.success('Booking cancelled');
    } catch (error) {
      message.error('Failed to cancel booking');
      throw error;
    }
  }
}));
