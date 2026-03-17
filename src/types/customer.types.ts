export type MembershipTier = 'regular' | 'silver' | 'gold' | 'vip';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  totalVisits: number;
  totalSpend: number;
  lastVisit: string;
  membershipTier: MembershipTier;
  notes: string;
  createdAt: string;
}

export interface CustomerQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  tier?: MembershipTier;
}

export interface CustomerStats {
  totalCustomers: number;
  newThisMonth: number;
  activeCustomers: number;
  totalRevenue: number;
}

export interface CustomerLookupDto {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface CreateCustomerDto {
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  notes?: string;
}

export type UpdateCustomerDto = Partial<CreateCustomerDto>;
