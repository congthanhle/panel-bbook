import { Permission, Role } from '@/types/auth.types';

// Enums / Maps
export const APP_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
} as const;

export const COURT_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  LOCKED: 'locked',
  MAINTENANCE: 'maintenance',
} as const;

export const COURT_TYPES = ['standard', 'premium'] as const;

export const DEFAULT_PRICE = {
  STANDARD: 50,
  PREMIUM: 80,
};

// Generate Time Slots (06:00 - 22:00 in 30-min intervals)
export const TIME_SLOTS: string[] = [];
for (let h = 6; h <= 22; h++) {
  TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:00`);
  if (h !== 22) {
    TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:30`);
  }
}

// Permissions per role
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    Permission.VIEW_STAFF_ALL, 
    Permission.MANAGE_COURTS, 
    Permission.MANAGE_SHIFTS, 
    Permission.MANAGE_USERS
  ],
  staff: [
    Permission.VIEW_OWN_PROFILE, 
    Permission.MANAGE_COURTS
  ],
};
