import { create } from 'zustand';
import dayjs, { Dayjs } from 'dayjs';
import { SlotCell, BulkActionPayload, Court, OperatingHours, Booking } from '@/types/overview.types';
import { message } from 'antd';
import { overviewApi, CreateBookingDto } from '@/features/overview/api';
import { settingsApi } from '@/features/settings/api';

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

  setDate: (date) => set({ selectedDate: date, slots: {}, courts: [], selectedCells: [] }),
  
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
    set({ isLoading: true, error: null, slots: {} });
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
          // The DB returns slot_id as a UUID, but the grid uses HHmm format
          // from generateTimeAxis (e.g., '0600'). Derive the key from startTime.
          const timeSlotId = s.timeSlotId;
          let gridTimeId = timeSlotId;
          
          // If startTime is available (e.g., '06:00'), convert to HHmm format
          if (s.startTime) {
            gridTimeId = s.startTime.replace(':', '').substring(0, 4);
          } else if (s.label) {
            // label is like '06:00', also usable
            gridTimeId = s.label.replace(':', '').substring(0, 4);
          }

          const key = `${c.courtId}_${gridTimeId}`;
          flattenedSlots[key] = {
             courtId: c.courtId,
             timeSlotId: gridTimeId,
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
                amount: 0
             } : undefined
          };
        });
      });

      const settings = await settingsApi.getAll();
      const isWeekend = date.day() === 0 || date.day() === 6;
      const realHours = settings.operatingHours;
      const defaultDuration = settings.bookingRules?.defaultSlotDuration || 30;

      const operatingHours: OperatingHours = {
        openTime: (isWeekend ? realHours?.weekendOpen : realHours?.weekdayOpen) || '06:00',
        closeTime: (isWeekend ? realHours?.weekendClose : realHours?.weekdayClose) || '22:00',
        intervalMinutes: defaultDuration
      };

      const holiday = (settings.holidays || []).find((h: any) => h.date === formattedDate);
      if (holiday) {
        Object.keys(flattenedSlots).forEach(key => {
          if (flattenedSlots[key].status === 'available') {
            flattenedSlots[key].status = 'locked';
            flattenedSlots[key].lockedReason = holiday.name || 'Holiday Closure';
          }
        });
      }

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
      // 2. Real API call — send 'status' not 'action' to match backend
      const status = action === 'lock' ? 'locked' : 'available';
      await overviewApi.updateSlot({ courtId, date, timeSlotId, status, reason });
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
        if (newSlots[key] && newSlots[key].status !== 'booked') {
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
      const formattedDate = get().selectedDate.format('YYYY-MM-DD');
      
      // Filter out any accidentally passed booked slots
      const validSlots = payload.slots.filter(key => get().slots[key]?.status !== 'booked');
      
      const apiPayload = validSlots.map(key => {
        const [courtId, timeSlotId] = key.split('_');
        return {
          courtId,
          timeSlotId,
          status: (payload.action === 'lock' ? 'locked' : 'available') as 'available' | 'locked' | 'maintenance',
          reason: payload.action === 'lock' ? payload.reason : undefined
        };
      });

      await overviewApi.bulkUpdateSlots({
        date: formattedDate,
        slots: apiPayload
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
    const coveredKeys = dto._selectedCells || [];
    const prevSlots = { ...get().slots };

    // Strip frontend-only field before sending to API
    const { _selectedCells, ...apiDto } = dto;

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
      const booking = await overviewApi.createBooking(apiDto);

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
                customerName: booking.customerName || dto.customerName || 'Customer',
                customerInitial: (booking.customerName || dto.customerName || 'C').charAt(0).toUpperCase(),
                phone: booking.phone || dto.customerPhone,
                amount: 0,
                paymentStatus: (dto.paidAmount || 0) > 0 ? 'paid' : 'pending',
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
