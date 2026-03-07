import { Role } from '@/types/auth.types';

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface Staff {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar?: string;
  salary: number;
  salaryType: 'monthly' | 'hourly';
  hireDate: string;
  address: string;
  idCardNumber: string;
  bankAccount: BankInfo;
  status: 'active' | 'inactive';
  notes?: string;
}

export interface Shift {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
}
