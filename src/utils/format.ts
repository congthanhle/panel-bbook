import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

// Initialize plugins
dayjs.extend(relativeTime);
dayjs.locale('vi');

/**
 * Formats a number to Vietnamese Dong format.
 * Example: 150000 -> "150.000đ"
 */
export const formatVND = (amount: number): string => {
  return amount.toLocaleString('vi-VN') + 'đ';
};

/**
 * Formats an ISO string to a Vietnamese date.
 * Example: "2024-03-15T00:00:00Z" -> "15/03/2024"
 */
export const formatDate = (iso: string): string => {
  return dayjs(iso).format('DD/MM/YYYY');
};

/**
 * Formats an ISO string to a Vietnamese date and time.
 * Example: "2024-03-15T14:30:00Z" -> "15/03/2024 14:30"
 */
export const formatDateTime = (iso: string): string => {
  return dayjs(iso).format('DD/MM/YYYY HH:mm');
};

/**
 * Returns a relative time string.
 * Example: "3 days ago", "in 2 hours"
 */
export const formatRelative = (iso: string): string => {
  return dayjs(iso).fromNow();
};

/**
 * Formats a phone number into blocks of 4-3-3.
 * Example: "0912345678" -> "0912 345 678"
 */
export const formatPhone = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on standard 10-digit VN format
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone; // Fallback to original if irregular
};
