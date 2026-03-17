import { apiClient } from '@/lib/api-client';
import { 
  AllSettings, 
  VenueSettingsDto, 
  OperatingHoursDto, 
  BookingRulesDto, 
  Holiday, 
  HolidayDto, 
  NotificationSettingsDto 
} from '@/types/settings.types';

export const settingsApi = {
  getAll: () =>
    apiClient.get<AllSettings>("/settings"),

  updateVenue: (dto: VenueSettingsDto) =>
    apiClient.patch("/settings/venue", dto),

  updateOperatingHours: (dto: OperatingHoursDto) =>
    apiClient.patch("/settings/operating-hours", dto),

  updateBookingRules: (dto: BookingRulesDto) =>
    apiClient.patch("/settings/booking-rules", dto),

  getHolidays: () =>
    apiClient.get<Holiday[]>("/settings/holidays"),

  addHoliday: (dto: HolidayDto) =>
    apiClient.post("/settings/holidays", dto),

  removeHoliday: (date: string) =>
    apiClient.del(`/settings/holidays/${date}`),

  updateNotifications: (dto: NotificationSettingsDto) =>
    apiClient.patch("/settings/notifications", dto),

  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient.patch("/auth/change-password", { oldPassword, newPassword }),
};
