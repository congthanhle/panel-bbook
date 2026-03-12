import { Role } from '@/types/auth.types';

export interface Staff {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  salary?: number;
  salaryType?: 'monthly' | 'hourly';
  hireDate: string;
  address?: string;
  idCardNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  isActive: boolean;
  notes?: string;
}

export interface Shift {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface StaffQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export type CreateStaffDto = Omit<Staff, 'id'>;
export type UpdateStaffDto = Partial<CreateStaffDto>;
