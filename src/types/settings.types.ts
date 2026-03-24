// src/types/settings.types.ts

export interface VenueSettingsDto {
  venueName: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
}

export interface OperatingHoursDto {
  weekdayOpen: string;
  weekdayClose: string;
  weekendOpen: string;
  weekendClose: string;
}

export interface BookingRulesDto {
  minAdvanceHours: number;
  maxAdvanceDays: number;
  cancellationHours: number;
  autoLockFutureMonths: boolean;
  defaultSlotDuration: number;
}

export interface HolidayDto {
  date: string;
  name?: string;
}

export interface NotificationTriggersDto {
  booking_created: boolean;
  booking_cancelled: boolean;
  shift_assigned: boolean;
}

export interface NotificationSettingsDto {
  emailEnabled: boolean;
  smsEnabled: boolean;
  triggers: NotificationTriggersDto;
  tplNewBooking?: string;
  tplCancellation?: string;
  tplPayment?: string;
}

export interface AllSettings {
  venue: VenueSettingsDto;
  operatingHours: OperatingHoursDto;
  bookingRules: BookingRulesDto;
  holidays: HolidayDto[];
  notifications: NotificationSettingsDto;
}

