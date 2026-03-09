import { apiClient } from "@/lib/api-client";
import {
  SlotCell,
  TimeSlot,
  Booking,
  OverviewData,
} from "@/types/overview.types";
import { Product } from "@/types/product.types";

// ---------------------------------------------------------------------------
// DTOs & response types used only by this API layer
// ---------------------------------------------------------------------------

/** Full grid payload returned by GET /overview */
export type OverviewResponse = OverviewData;

/** PATCH /overview/slot */
export interface SlotStatusUpdateDto {
  courtId: string;
  date: string;
  timeSlotId: string;
  action: "lock" | "unlock";
  reason?: string;
}

/** PATCH /overview/slots/bulk */
export interface BulkSlotUpdateDto {
  slots: string[];
  action: "lock" | "unlock";
  reason?: string;
}

export interface BulkUpdateResult {
  updated: number;
  failed: string[];
}

/** GET /overview/month-status */
export interface MonthLockStatus {
  yearMonth: string;
  isLocked: boolean;
  lockedAt?: string;
  lockedBy?: string;
}

/** POST /bookings */
export interface CreateBookingDto {
  courtId: string;
  date: string;
  selectedCells: string[];
  customerName: string;
  phone: string;
  paymentMode: "cash" | "transfer" | "card";
  downPayment?: number;
  totalAmount: number;
}

/** Service add DTO */
export interface AddServiceDto {
  productId: string;
  quantity: number;
}

/** Payment update DTO */
export interface UpdatePaymentDto {
  paymentMode: "cash" | "transfer" | "card";
  amount: number;
  note?: string;
}

/** Customer lookup response */
export interface CustomerLookupDto {
  id: string;
  name: string;
  phone: string;
  email?: string;
  membershipTier?: string;
  totalVisits?: number;
}

/** GET /courts/:courtId/calculate-price */
export interface PriceBreakdown {
  courtFee: number;
  totalAmount: number;
  currency: string;
  details?: {
    label: string;
    amount: number;
  }[];
}

/** Service line item on a booking */
export interface BookingService {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/** Full booking detail returned by GET /bookings/:id */
export interface BookingDetail {
  id: string;
  bookingCode: string;
  courtId: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  phone: string;
  status: 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
  services: BookingService[];
  courtFee: number;
  serviceFee: number;
  totalAmount: number;
  paidAmount: number;
  paymentMode: 'cash' | 'transfer' | 'card';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  cancelReason?: string;
  createdAt: string;
  checkedInAt?: string;
  completedAt?: string;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const overviewApi = {
  // Grid data
  getOverview: (date: string, courtIds?: string[]) =>
    apiClient.get<OverviewResponse>("/overview", { date, courtIds }),

  getTimeSlots: () =>
    apiClient.get<TimeSlot[]>("/overview/time-slots"),
  // Cache this: time slots never change

  // Slot lock management
  updateSlot: (dto: SlotStatusUpdateDto) =>
    apiClient.patch<SlotCell>("/overview/slot", dto),

  bulkUpdateSlots: (dto: BulkSlotUpdateDto) =>
    apiClient.patch<BulkUpdateResult>("/overview/slots/bulk", dto),

  // Month lock management
  getMonthStatus: (yearMonth: string) =>
    apiClient.get<MonthLockStatus>("/overview/month-status", { yearMonth }),

  lockMonth: (yearMonth: string) =>
    apiClient.post("/overview/month/lock", { yearMonth }),

  unlockMonth: (yearMonth: string) =>
    apiClient.post("/overview/month/unlock", { yearMonth }),

  // Booking CRUD (called from drawers within overview)
  createBooking: (dto: CreateBookingDto) =>
    apiClient.post<Booking>("/bookings", dto),

  getBooking: (id: string) =>
    apiClient.get<BookingDetail>(`/bookings/${id}`),

  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/bookings/${id}/status`, { status }),

  cancelBooking: (id: string, reason: string) =>
    apiClient.post(`/bookings/${id}/cancel`, { reason }),

  checkIn: (id: string) =>
    apiClient.post(`/bookings/${id}/check-in`),

  complete: (id: string) =>
    apiClient.post(`/bookings/${id}/complete`),

  addService: (id: string, dto: AddServiceDto) =>
    apiClient.post(`/bookings/${id}/services`, dto),

  removeService: (id: string, serviceId: string) =>
    apiClient.del(`/bookings/${id}/services/${serviceId}`),

  updatePayment: (id: string, dto: UpdatePaymentDto) =>
    apiClient.patch(`/bookings/${id}/payment`, dto),

  // Customer lookup (used in CreateBookingDrawer)
  lookupByPhone: (phone: string) =>
    apiClient.get<CustomerLookupDto>(`/customers/by-phone/${phone}`),

  // Product list (for adding services to bookings)
  getActiveProducts: () =>
    apiClient.get<Product[]>("/products", { isActive: true }),

  // Price calculation (used in CreateBookingDrawer)
  calculatePrice: (courtId: string, date: string, startTime: string, endTime: string) =>
    apiClient.get<PriceBreakdown>(`/courts/${courtId}/calculate-price`, {
      date,
      startTime,
      endTime,
    }),
};
