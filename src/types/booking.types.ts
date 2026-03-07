export interface TimeSlot {
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  isAvailable: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  courtId: string;
  customerId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: BookingStatus;
  totalPrice: number;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  createdAt: string;
}
