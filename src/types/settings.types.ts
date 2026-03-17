// src/types/settings.types.ts

export interface VenueSettingsDto {
  name: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
  currency: string;
  taxRate: number;
}

export interface OperatingHoursDto {
  monday: { open: string; close: string; isClosed: boolean };
  tuesday: { open: string; close: string; isClosed: boolean };
  wednesday: { open: string; close: string; isClosed: boolean };
  thursday: { open: string; close: string; isClosed: boolean };
  friday: { open: string; close: string; isClosed: boolean };
  saturday: { open: string; close: string; isClosed: boolean };
  sunday: { open: string; close: string; isClosed: boolean };
}

export interface BookingRulesDto {
  minAdvanceBookingDays: number;
  maxAdvanceBookingDays: number;
  cancellationNoticeHours: number;
  allowWaitlist: boolean;
}

export interface Holiday {
  id: string; // Optional if returned from BE, might be generated
  date: string; // YYYY-MM-DD
  name: string;
  isClosed: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface HolidayDto {
  date: string;
  name: string;
  isClosed: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface NotificationSettingsDto {
  emailBookingConfirmations: boolean;
  emailBookingReminders: boolean;
  emailMarketing: boolean;
  smsBookingConfirmations: boolean;
  smsBookingReminders: boolean;
}

export interface AllSettings {
  venue: VenueSettingsDto;
  operatingHours: OperatingHoursDto;
  bookingRules: BookingRulesDto;
  holidays: Holiday[];
  notifications: NotificationSettingsDto;
}
