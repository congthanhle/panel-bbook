export interface RevenueData {
  date: string;
  revenue: number;
}

export interface BookingTypeData {
  type: string;
  count: number;
}

export interface RecentBooking {
  id: string;
  customerName: string;
  courtName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  amount: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  visits: number;
  totalSpend: number;
}

export interface PeakHourData {
  hour: string;
  bookings: number;
}

export interface CourtUtilizationData {
  courtName: string;
  utilization: number;
}

export interface DashboardStats {
  todayBookings: number;
  todayBookingsTrend: number; // percentage vs last period
  todayRevenue: number;
  todayRevenueTrend: number;
  monthlyRevenue: number;
  monthlyRevenueTrend: number;
  activeCustomers: number;
  activeCustomersTrend: number;
  courtUtilizationRate: number; // percentage
  courtUtilizationTrend: number;
  
  // Charts
  revenueByDay: RevenueData[];
  bookingsByCourtType: BookingTypeData[];
  peakHours: PeakHourData[];
  utilizationByCourt: CourtUtilizationData[];
  
  // Tables
  recentBookings: RecentBooking[];
  topCustomers: TopCustomer[];
}
