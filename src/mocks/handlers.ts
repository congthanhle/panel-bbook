import { http, HttpResponse, delay } from 'msw';
import { customerHandlers } from './customerHandlers';
import { productHandlers } from './productHandlers';
import { User } from '@/types/auth.types';
import { Staff } from '@/types/staff.types';
import { DashboardStats } from '@/types/dashboard.types';
import { Shift } from '@/types/shift.types';

const mockUser: User = {
  id: 'usr_1',
  email: 'admin@courtos.com',
  name: 'Admin User',
  role: 'admin',
};

const mockStaff: Staff[] = [
  {
    id: 'stf_1',
    userId: 'usr_2',
    name: 'John Doe',
    email: 'staff@courtos.vn',
    phone: '+1234567890',
    role: 'staff',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    salary: 1500,
    salaryType: 'monthly',
    hireDate: '2025-01-15',
    address: '123 Main St, Ho Chi Minh City',
    idCardNumber: '012345678912',
    bankName: 'Vietcombank',
    bankAccountNumber: '1012345678',
    bankAccountName: 'JOHN DOE',
    isActive: true,
    notes: 'Excellent staff member',
  },
  {
    id: 'stf_2',
    userId: 'usr_3',
    name: 'Jane Smith',
    email: 'jane@courtos.vn',
    phone: '+1234567891',
    role: 'staff',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    salary: 1200,
    salaryType: 'monthly',
    hireDate: '2025-02-01',
    address: '456 Side St',
    idCardNumber: '9876543210',
    bankName: 'TCB',
    bankAccountNumber: '0',
    bankAccountName: 'JANE',
    isActive: true,
  }
];

const mockShifts: Shift[] = [
  {
    id: 'shf_1',
    name: 'Morning Shift',
    date: '2026-03-07',
    startTime: '08:00',
    endTime: '12:00',
    assignedStaff: [mockStaff[0]],
    notes: 'Opening duties',
    status: 'completed',
  },
  {
    id: 'shf_2',
    name: 'Afternoon Shift',
    date: '2026-03-07',
    startTime: '12:00',
    endTime: '18:00',
    assignedStaff: [mockStaff[1]],
    status: 'ongoing',
  },
  {
    id: 'shf_3',
    name: 'Evening Shift',
    date: '2026-03-08',
    startTime: '18:00',
    endTime: '23:00',
    assignedStaff: [mockStaff[0], mockStaff[1]],
    notes: 'Closing duties and cleaning',
    status: 'upcoming',
  }
];

const mockStaffUser: User = {
  id: 'usr_2',
  email: 'staff@courtos.vn',
  name: 'John Doe',
  role: 'staff',
};

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

export const handlers = [
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    await delay(800);
    const body = await request.json() as any;
    
    // Dynamic mock response based on email
    if (body.email === 'staff@courtos.vn') {
      return HttpResponse.json({
        user: mockStaffUser,
        access_token: 'mock-jwt-token-staff-456',
        expires_in: 3600,
      });
    }

    // Default to admin
    return HttpResponse.json({
      user: mockUser,
      access_token: 'mock-jwt-token-admin-123',
      expires_in: 3600,
    });
  }),
  
  http.get(`${API_URL}/auth/me`, async () => {
    await delay(400);
    return HttpResponse.json(mockUser);
  }),


  http.get(`${API_URL}/staff`, () => {
    return HttpResponse.json(mockStaff);
  }),

  http.get(`${API_URL}/staff/me`, async () => {
    await delay(400);
    return HttpResponse.json(mockStaff[0]);
  }),

  http.post(`${API_URL}/staff`, async ({ request }) => {
    await delay(600);
    const body = await request.json() as Omit<Staff, 'id'>;
    const newStaff: Staff = {
      ...body,
      id: `stf_${Math.random().toString(36).substring(7)}`,
      userId: `usr_${Math.random().toString(36).substring(7)}`,
    };
    mockStaff.push(newStaff);
    return HttpResponse.json(newStaff);
  }),

  http.patch(`${API_URL}/staff/:id`, async ({ params, request }) => {
    await delay(600);
    const { id } = params;
    const body = await request.json() as Partial<Staff>;
    
    const staffIndex = mockStaff.findIndex(s => s.id === id);
    if (staffIndex > -1) {
      mockStaff[staffIndex] = { ...mockStaff[staffIndex], ...body };
      return HttpResponse.json(mockStaff[staffIndex]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete(`${API_URL}/staff/:id`, async ({ params }) => {
    await delay(600);
    const { id } = params;
    const staffIndex = mockStaff.findIndex(s => s.id === id);
    if (staffIndex > -1) {
      mockStaff.splice(staffIndex, 1);
      return HttpResponse.json({ success: true });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // -- Shifts Handlers --
  http.get(`${API_URL}/shifts`, async ({ request }) => {
    await delay(500);
    const url = new URL(request.url);
    const month = url.searchParams.get('month'); // YYYY-MM
    
    if (month) {
      const filtered = mockShifts.filter(s => s.date.startsWith(month));
      return HttpResponse.json(filtered);
    }
    return HttpResponse.json(mockShifts);
  }),

  http.get(`${API_URL}/shifts/my`, async () => {
    await delay(500);
    const myShifts = mockShifts.filter(s => s.assignedStaff.some(staff => staff.userId === mockStaffUser.id));
    return HttpResponse.json(myShifts);
  }),

  http.post(`${API_URL}/shifts`, async ({ request }) => {
    await delay(600);
    const body = await request.json() as Omit<Shift, 'id' | 'status' | 'assignedStaff'> & { staffIds: string[] };
    const { staffIds, ...shiftData } = body;
    
    const assignedStaff = mockStaff.filter(s => staffIds.includes(s.id));
    
    const newShift: Shift = {
      ...shiftData,
      id: `shf_${Math.random().toString(36).substring(7)}`,
      status: 'upcoming',
      assignedStaff,
    };
    mockShifts.push(newShift);
    return HttpResponse.json(newShift);
  }),

  http.patch(`${API_URL}/shifts/:id`, async ({ params, request }) => {
    await delay(600);
    const { id } = params;
    const body = await request.json() as Partial<Shift> & { staffIds?: string[] };
    const { staffIds, ...updateData } = body;
    
    const shiftIndex = mockShifts.findIndex(s => s.id === id);
    if (shiftIndex > -1) {
      if (staffIds !== undefined) {
         mockShifts[shiftIndex].assignedStaff = mockStaff.filter(s => staffIds.includes(s.id));
      }
      mockShifts[shiftIndex] = { ...mockShifts[shiftIndex], ...updateData };
      return HttpResponse.json(mockShifts[shiftIndex]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete(`${API_URL}/shifts/:id`, async ({ params }) => {
     await delay(600);
    const { id } = params;
    const shiftIndex = mockShifts.findIndex(s => s.id === id);
    if (shiftIndex > -1) {
      mockShifts.splice(shiftIndex, 1);
      return HttpResponse.json({ success: true });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.post(`${API_URL}/shifts/:id/assign`, async ({ params, request }) => {
    await delay(400);
    const { id } = params;
    const { staffId } = await request.json() as { staffId: string };
    
    const shiftIndex = mockShifts.findIndex(s => s.id === id);
    if (shiftIndex > -1) {
      const staffMember = mockStaff.find(s => s.id === staffId);
      if (staffMember && !mockShifts[shiftIndex].assignedStaff.find(s => s.id === staffId)) {
        mockShifts[shiftIndex].assignedStaff.push(staffMember);
      }
      return HttpResponse.json(mockShifts[shiftIndex]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.post(`${API_URL}/shifts/:id/remove`, async ({ params, request }) => {
    await delay(400);
    const { id } = params;
    const { staffId } = await request.json() as { staffId: string };
    
    const shiftIndex = mockShifts.findIndex(s => s.id === id);
    if (shiftIndex > -1) {
      mockShifts[shiftIndex].assignedStaff = mockShifts[shiftIndex].assignedStaff.filter(s => s.id !== staffId);
      return HttpResponse.json(mockShifts[shiftIndex]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.patch(`${API_URL}/shifts/:id/status`, async ({ params, request }) => {
    await delay(400);
    const { id } = params;
    const { status } = await request.json() as { status: Shift['status'] };
    
    const shiftIndex = mockShifts.findIndex(s => s.id === id);
    if (shiftIndex > -1) {
      mockShifts[shiftIndex].status = status;
      return HttpResponse.json(mockShifts[shiftIndex]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.get(`${API_URL}/dashboard/stats`, async () => {
    await delay(600);
    // You can parse url search params for date ranges if needed:
    // const url = new URL(request.url);
    // const range = url.searchParams.get('range') || 'today';

    const mockDashboardStats: DashboardStats = {
      todayBookings: 24,
      todayBookingsTrend: 12.5,
      todayRevenue: 1250,
      todayRevenueTrend: 8.2,
      monthlyRevenue: 34500,
      monthlyRevenueTrend: -2.4,
      activeCustomers: 142,
      activeCustomersTrend: 5.1,
      courtUtilizationRate: 78.5,
      courtUtilizationTrend: 4.3,
      revenueByDay: [
        { date: '2026-02-22', revenue: 900 },
        { date: '2026-02-23', revenue: 1100 },
        { date: '2026-02-24', revenue: 1050 },
        { date: '2026-02-25', revenue: 1300 },
        { date: '2026-02-26', revenue: 1250 },
        { date: '2026-02-27', revenue: 1400 },
        { date: '2026-02-28', revenue: 1600 },
        { date: '2026-03-01', revenue: 1550 },
        { date: '2026-03-02', revenue: 1100 },
        { date: '2026-03-03', revenue: 1200 },
        { date: '2026-03-04', revenue: 1450 },
        { date: '2026-03-05', revenue: 1350 },
        { date: '2026-03-06', revenue: 1200 },
        { date: '2026-03-07', revenue: 1250 },
      ],
      bookingsByCourtType: [
        { type: 'Standard', count: 145 },
        { type: 'Premium', count: 86 },
        { type: 'VIP', count: 32 },
      ],
      peakHours: [
        { hour: '06:00', bookings: 12 },
        { hour: '08:00', bookings: 18 },
        { hour: '10:00', bookings: 10 },
        { hour: '12:00', bookings: 8 },
        { hour: '14:00', bookings: 14 },
        { hour: '16:00', bookings: 22 },
        { hour: '18:00', bookings: 35 }, // top
        { hour: '20:00', bookings: 28 }, // top
        { hour: '22:00', bookings: 15 },
      ],
      utilizationByCourt: [
        { courtName: 'Court 1', utilization: 85 },
        { courtName: 'Court 2', utilization: 72 },
        { courtName: 'Court 3', utilization: 90 },
        { courtName: 'Court 4', utilization: 65 },
        { courtName: 'Court 5', utilization: 88 },
      ],
      recentBookings: [
        { id: 'b_1', customerName: 'Alex Johnson', courtName: 'Court 1', date: '2026-03-07', time: '18:00 - 20:00', status: 'confirmed', amount: 100 },
        { id: 'b_2', customerName: 'Sarah Smith', courtName: 'Court 3', date: '2026-03-07', time: '18:00 - 19:00', status: 'completed', amount: 50 },
        { id: 'b_3', customerName: 'Mike Brown', courtName: 'Court 2', date: '2026-03-07', time: '19:00 - 21:00', status: 'pending', amount: 160 },
        { id: 'b_4', customerName: 'Emma Wilson', courtName: 'Court 1', date: '2026-03-07', time: '20:00 - 22:00', status: 'confirmed', amount: 100 },
        { id: 'b_5', customerName: 'David Lee', courtName: 'Court 5', date: '2026-03-07', time: '20:00 - 21:00', status: 'cancelled', amount: 80 },
      ],
      topCustomers: [
        { id: 'c_1', name: 'James Wilson', visits: 45, totalSpend: 3450 },
        { id: 'c_2', name: 'Maria Garcia', visits: 38, totalSpend: 2800 },
        { id: 'c_3', name: 'Robert Chen', visits: 32, totalSpend: 2560 },
        { id: 'c_4', name: 'Linda Taylor', visits: 28, totalSpend: 1950 },
        { id: 'c_5', name: 'William Davis', visits: 24, totalSpend: 1680 },
      ],
    };

    return HttpResponse.json(mockDashboardStats);
  }),
  ...customerHandlers,
  ...productHandlers,
];
