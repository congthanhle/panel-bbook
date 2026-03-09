import { apiClient } from "@/lib/api-client";
import {
  OverviewResponse,
  TimeSlot,
  SlotStatusUpdateDto,
  SlotCell,
  BulkSlotUpdateDto,
  BulkUpdateResult,
  MonthLockStatus,
} from "./types";
import { Booking, CreateBookingDto } from "../bookings/types";
import { CustomerLookupDto } from "../customers/types";
import { Product } from "../products/types";

export const overviewApi = {
  // Grid data
  getOverview: (date: string, courtIds?: string[]) =>
    apiClient.get<OverviewResponse>("/overview", {
      params: { date, courtIds },
    }),

  getTimeSlots: () => apiClient.get<TimeSlot[]>("/overview/time-slots"),
  // Cache this: time slots never change

  // Slot lock management
  updateSlot: (dto: SlotStatusUpdateDto) =>
    apiClient.patch<SlotCell>("/overview/slot", dto),

  bulkUpdateSlots: (dto: BulkSlotUpdateDto) =>
    apiClient.patch<BulkUpdateResult>("/overview/slots/bulk", dto),

  // Month lock management
  getMonthStatus: (yearMonth: string) =>
    apiClient.get<MonthLockStatus>("/overview/month-status", {
      params: { yearMonth },
    }),

  lockMonth: (yearMonth: string) =>
    apiClient.post("/overview/month/lock", { yearMonth }),

  unlockMonth: (yearMonth: string) =>
    apiClient.post("/overview/month/unlock", { yearMonth }),

  // Booking CRUD (called from drawers within overview)
  createBooking: (dto: CreateBookingDto) =>
    apiClient.post<Booking>("/bookings", dto),

  getBooking: (id: string) => apiClient.get<Booking>(`/bookings/${id}`),

  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/bookings/${id}/status`, { status }),

  cancelBooking: (id: string, reason: string) =>
    apiClient.post(`/bookings/${id}/cancel`, { reason }),

  checkIn: (id: string) => apiClient.post(`/bookings/${id}/check-in`),

  complete: (id: string) => apiClient.post(`/bookings/${id}/complete`),

  addService: (id: string, dto: any) =>
    apiClient.post(`/bookings/${id}/services`, dto),

  removeService: (id: string, serviceId: string) =>
    apiClient.delete(`/bookings/${id}/services/${serviceId}`),

  updatePayment: (id: string, dto: any) =>
    apiClient.patch(`/bookings/${id}/payment`, dto),

  // Customer lookup (used in CreateBookingDrawer)
  lookupByPhone: (phone: string) =>
    apiClient.get<CustomerLookupDto>(`/customers/by-phone/${phone}`),

  // Product list (for adding services to bookings)
  getActiveProducts: () =>
    apiClient.get<Product[]>("/products", { params: { isActive: true } }),
};
