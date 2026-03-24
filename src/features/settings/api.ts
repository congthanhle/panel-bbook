import { apiClient } from '@/lib/api-client';
import { 
  AllSettings, 
  VenueSettingsDto, 
  OperatingHoursDto, 
  BookingRulesDto, 
  HolidayDto, 
  NotificationSettingsDto 
} from '@/types/settings.types';

export const settingsApi = {
  getAll: async () => {
    const raw: any = await apiClient.get("/settings");
    return {
      venue: raw.venue_info || {},
      operatingHours: raw.operating_hours || {},
      bookingRules: raw.booking_rules || {},
      holidays: raw.holidays || [],
      notifications: raw.notifications || {},
    } as AllSettings;
  },

  updateVenue: (dto: VenueSettingsDto) =>
    apiClient.patch("/settings/venue", dto),

  updateOperatingHours: (dto: OperatingHoursDto) =>
    apiClient.patch("/settings/operating-hours", dto),

  updateBookingRules: (dto: BookingRulesDto) =>
    apiClient.patch("/settings/booking-rules", dto),

  getHolidays: () =>
    apiClient.get<HolidayDto[]>("/settings/holidays"),

  addHoliday: (dto: HolidayDto) =>
    apiClient.post("/settings/holidays", dto),

  removeHoliday: (date: string) =>
    apiClient.del(`/settings/holidays/${date}`),

  updateNotifications: (dto: NotificationSettingsDto) =>
    apiClient.patch("/settings/notifications", dto),

  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient.patch("/auth/change-password", { oldPassword, newPassword }),
};
