export type SlotStatus = 'available' | 'booked' | 'locked' | 'maintenance';

export interface TimeSlot {
  id: string; // e.g., '0600', '0630', '0700'
  startTime: string; // '06:00'
  endTime: string; // '06:30'
  label?: string; // e.g. '6:00 AM'
}

export interface Booking {
  id: string;
  bookingCode?: string;
  customerName: string;
  customerInitial?: string;
  phone?: string;
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  status: 'confirmed' | 'cancelled' | 'completed';
}

export interface SlotCell {
  courtId: string;
  timeSlotId: string;
  status: SlotStatus;
  booking?: Booking;
  lockedReason?: string;
  price?: number;
}

export interface OperatingHours {
  openTime: string; // '06:00'
  closeTime: string; // '22:00'
  intervalMinutes: number; // 30, 60, etc.
}

export interface OverviewData {
  date: string;
  slots: Record<string, SlotCell>; // Key: `${courtId}_${timeSlotId}`
  courts: Court[];
  operatingHours: OperatingHours;
}

export interface Court {
  id: string;
  name: string;
  type: 'badminton' | 'tennis' | 'pickleball';
  isActive: boolean;
}

export interface BulkActionPayload {
  slots: string[]; // Array of `${courtId}_${timeSlotId}`
  action: 'lock' | 'unlock';
  reason?: string;
}

export interface SingleActionPayload {
  courtId: string;
  timeSlotId: string;
  action: 'lock' | 'unlock';
  reason?: string;
}

export interface CreateBookingPayload {
  selectedCells: string[]; // e.g. ["court1_0600", "court1_0630"]
  customerName: string;
  phone: string;
  paymentMode: 'cash' | 'transfer' | 'card';
  downPayment?: number;
  totalAmount: number;
}
