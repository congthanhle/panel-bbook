import { create } from 'zustand';
import { settingsApi } from '@/features/settings/api';
import { 
  AllSettings, 
  VenueSettingsDto, 
  OperatingHoursDto, 
  BookingRulesDto, 
  Holiday, 
  HolidayDto, 
  NotificationSettingsDto 
} from '@/types/settings.types';
import { message } from 'antd';
import { useAuthStore } from './authStore';

export type SettingsSection = 'venue' | 'operatingHours' | 'bookingRules' | 'holidays' | 'notifications';

interface SettingsState {
  fetchedSettings: AllSettings | null;
  currentSettings: AllSettings | null;
  
  isLoading: boolean; // For initial load
  isSubmitting: {
    venue: boolean;
    operatingHours: boolean;
    bookingRules: boolean;
    holidays: boolean;
    notifications: boolean;
    password: boolean;
  };
  
  error: string | null;

  fetchAll: () => Promise<void>;
  
  // Section-specific updates (API)
  updateVenue: (data: VenueSettingsDto) => Promise<void>;
  updateOperatingHours: (data: OperatingHoursDto) => Promise<void>;
  updateBookingRules: (data: BookingRulesDto) => Promise<void>;
  updateNotifications: (data: NotificationSettingsDto) => Promise<void>;
  
  // Holidays
  addHoliday: (data: HolidayDto) => Promise<void>;
  removeHoliday: (date: string) => Promise<void>;

  // Form drafting (Local)
  setDraft: <K extends SettingsSection>(section: K, data: Partial<AllSettings[K]>) => void;
  resetDraft: (section: SettingsSection) => void;
  isDirty: (section: SettingsSection) => boolean;

  // Password
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const areObjectsEqual = (a: any, b: any) => {
  if (a === b) return true;
  if (!a || !b) return false;
  return JSON.stringify(a) === JSON.stringify(b);
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  fetchedSettings: null,
  currentSettings: null,
  isLoading: false,
  isSubmitting: {
    venue: false,
    operatingHours: false,
    bookingRules: false,
    holidays: false,
    notifications: false,
    password: false,
  },
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await settingsApi.getAll();
      set({ 
        fetchedSettings: JSON.parse(JSON.stringify(data)), 
        currentSettings: JSON.parse(JSON.stringify(data)),
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch settings', isLoading: false });
    }
  },

  setDraft: (section, data) => {
    set((state) => {
      if (!state.currentSettings) return state;
      return {
        currentSettings: {
          ...state.currentSettings,
          [section]: {
            ...state.currentSettings[section],
            ...data
          }
        }
      };
    });
  },

  resetDraft: (section) => {
    set((state) => {
      if (!state.fetchedSettings || !state.currentSettings) return state;
      return {
        currentSettings: {
          ...state.currentSettings,
          [section]: JSON.parse(JSON.stringify(state.fetchedSettings[section]))
        }
      };
    });
  },

  isDirty: (section) => {
    const state = get();
    if (!state.fetchedSettings || !state.currentSettings) return false;
    return !areObjectsEqual(state.fetchedSettings[section], state.currentSettings[section]);
  },

  updateVenue: async (data: VenueSettingsDto) => {
    set((state) => ({ isSubmitting: { ...state.isSubmitting, venue: true }, error: null }));
    try {
      await settingsApi.updateVenue(data);
      set((state) => {
        if (!state.fetchedSettings || !state.currentSettings) return state;
        const updated = { ...state.fetchedSettings.venue, ...data };
        return {
          fetchedSettings: { ...state.fetchedSettings, venue: updated },
          currentSettings: { ...state.currentSettings, venue: updated },
          isSubmitting: { ...state.isSubmitting, venue: false }
        };
      });
      message.success('Venue settings updated successfully');
    } catch (error: any) {
      set((state) => ({ isSubmitting: { ...state.isSubmitting, venue: false }, error: error.message }));
      throw error;
    }
  },

  updateOperatingHours: async (data: OperatingHoursDto) => {
    set((state) => ({ isSubmitting: { ...state.isSubmitting, operatingHours: true }, error: null }));
    try {
      await settingsApi.updateOperatingHours(data);
      set((state) => {
        if (!state.fetchedSettings || !state.currentSettings) return state;
        const updated = { ...state.fetchedSettings.operatingHours, ...data };
        return {
          fetchedSettings: { ...state.fetchedSettings, operatingHours: updated },
          currentSettings: { ...state.currentSettings, operatingHours: updated },
          isSubmitting: { ...state.isSubmitting, operatingHours: false }
        };
      });
      message.success('Operating hours updated successfully');
    } catch (error: any) {
      set((state) => ({ isSubmitting: { ...state.isSubmitting, operatingHours: false }, error: error.message }));
      throw error;
    }
  },

  updateBookingRules: async (data: BookingRulesDto) => {
    set((state) => ({ isSubmitting: { ...state.isSubmitting, bookingRules: true }, error: null }));
    try {
      await settingsApi.updateBookingRules(data);
      set((state) => {
        if (!state.fetchedSettings || !state.currentSettings) return state;
        const updated = { ...state.fetchedSettings.bookingRules, ...data };
        return {
          fetchedSettings: { ...state.fetchedSettings, bookingRules: updated },
          currentSettings: { ...state.currentSettings, bookingRules: updated },
          isSubmitting: { ...state.isSubmitting, bookingRules: false }
        };
      });
      message.success('Booking rules updated successfully');
    } catch (error: any) {
      set((state) => ({ isSubmitting: { ...state.isSubmitting, bookingRules: false }, error: error.message }));
      throw error;
    }
  },

  updateNotifications: async (data: NotificationSettingsDto) => {
    set((state) => ({ isSubmitting: { ...state.isSubmitting, notifications: true }, error: null }));
    try {
      await settingsApi.updateNotifications(data);
      set((state) => {
        if (!state.fetchedSettings || !state.currentSettings) return state;
        const updated = { ...state.fetchedSettings.notifications, ...data };
        return {
          fetchedSettings: { ...state.fetchedSettings, notifications: updated },
          currentSettings: { ...state.currentSettings, notifications: updated },
          isSubmitting: { ...state.isSubmitting, notifications: false }
        };
      });
      message.success('Notification preferences updated successfully');
    } catch (error: any) {
      set((state) => ({ isSubmitting: { ...state.isSubmitting, notifications: false }, error: error.message }));
      throw error;
    }
  },

  addHoliday: async (data: HolidayDto) => {
    set((state) => ({ isSubmitting: { ...state.isSubmitting, holidays: true }, error: null }));
    try {
      await settingsApi.addHoliday(data);
      const newHolidays = await settingsApi.getHolidays();
      set((state) => {
        if (!state.fetchedSettings || !state.currentSettings) return state;
        return {
          fetchedSettings: { ...state.fetchedSettings, holidays: newHolidays },
          currentSettings: { ...state.currentSettings, holidays: newHolidays },
          isSubmitting: { ...state.isSubmitting, holidays: false }
        };
      });
      message.success('Holiday added successfully');
    } catch (error: any) {
      set((state) => ({ isSubmitting: { ...state.isSubmitting, holidays: false }, error: error.message }));
      throw error;
    }
  },

  removeHoliday: async (date: string) => {
    set((state) => ({ isSubmitting: { ...state.isSubmitting, holidays: true }, error: null }));
    try {
      await settingsApi.removeHoliday(date);
      const newHolidays = await settingsApi.getHolidays();
      set((state) => {
        if (!state.fetchedSettings || !state.currentSettings) return state;
        return {
          fetchedSettings: { ...state.fetchedSettings, holidays: newHolidays },
          currentSettings: { ...state.currentSettings, holidays: newHolidays },
          isSubmitting: { ...state.isSubmitting, holidays: false }
        };
      });
      message.success('Holiday removed successfully');
    } catch (error: any) {
      set((state) => ({ isSubmitting: { ...state.isSubmitting, holidays: false }, error: error.message }));
      throw error;
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    set((state) => ({ isSubmitting: { ...state.isSubmitting, password: true }, error: null }));
    try {
      await settingsApi.changePassword(oldPassword, newPassword);
      set((state) => ({ isSubmitting: { ...state.isSubmitting, password: false } }));
      message.success('Password changed successfully. You will be logged out shortly.');
      
      // Auto-logout after 3 seconds
      setTimeout(() => {
        useAuthStore.getState().logout();
      }, 3000);
    } catch (error: any) {
      set((state) => ({ isSubmitting: { ...state.isSubmitting, password: false }, error: error.message }));
      // Let the caller handle UI rendering (e.g. inline error message)
      throw error;
    }
  }
}));
