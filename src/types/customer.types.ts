export type MembershipTier = 'regular' | 'silver' | 'gold' | 'vip';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  totalVisits: number;
  totalSpend: number;
  lastVisit: string;
  membershipTier: MembershipTier;
  notes: string;
  createdAt: string;
}
