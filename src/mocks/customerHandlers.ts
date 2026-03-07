import { http, HttpResponse, delay } from 'msw';
import { Customer } from '@/types/customer.types';

const API_URL = import.meta.env.VITE_API_URL || '';

export const mockCustomers: Customer[] = [
  {
    id: 'cust_1',
    name: 'James Wilson',
    phone: '+1234567890',
    email: 'james@example.com',
    dob: '1990-05-15',
    gender: 'male',
    totalVisits: 45,
    totalSpend: 3450,
    lastVisit: '2026-03-05',
    membershipTier: 'vip',
    notes: 'Prefers Court 1',
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'cust_2',
    name: 'Maria Garcia',
    phone: '+1234567891',
    email: 'maria@example.com',
    dob: '1988-11-20',
    gender: 'female',
    totalVisits: 38,
    totalSpend: 2800,
    lastVisit: '2026-03-01',
    membershipTier: 'gold',
    notes: '',
    createdAt: '2025-02-15T09:30:00Z',
  },
  {
    id: 'cust_3',
    name: 'Robert Chen',
    phone: '+1234567892',
    email: 'robert@example.com',
    dob: '1995-03-10',
    gender: 'male',
    totalVisits: 32,
    totalSpend: 2560,
    lastVisit: '2026-02-28',
    membershipTier: 'silver',
    notes: 'Needs new racket stringing soon',
    createdAt: '2025-03-20T14:15:00Z',
  },
  {
    id: 'cust_4',
    name: 'Linda Taylor',
    phone: '+1234567893',
    email: 'linda@example.com',
    dob: '1992-08-05',
    gender: 'female',
    totalVisits: 8,
    totalSpend: 450,
    lastVisit: '2026-03-06',
    membershipTier: 'regular',
    notes: 'Beginner player',
    createdAt: '2026-01-10T11:45:00Z',
  },
];

export const customerHandlers = [
  http.get(`${API_URL}/api/customers`, async () => {
    await delay(600);
    return HttpResponse.json(mockCustomers);
  }),

  http.post(`${API_URL}/api/customers`, async ({ request }) => {
    await delay(600);
    const body = await request.json() as Partial<Customer>;
    
    const newCustomer: Customer = {
      id: `cust_${Math.random().toString(36).substring(7)}`,
      name: body.name || '',
      phone: body.phone || '',
      email: body.email,
      dob: body.dob,
      gender: body.gender,
      totalVisits: 0,
      totalSpend: 0,
      lastVisit: '',
      membershipTier: body.membershipTier || 'regular',
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
    };
    
    mockCustomers.push(newCustomer);
    return HttpResponse.json(newCustomer, { status: 201 });
  }),

  http.patch(`${API_URL}/api/customers/:id`, async ({ params, request }) => {
    await delay(600);
    const { id } = params;
    const body = await request.json() as Partial<Customer>;
    
    const index = mockCustomers.findIndex((c) => c.id === id);
    if (index !== -1) {
      mockCustomers[index] = { ...mockCustomers[index], ...body };
      return HttpResponse.json(mockCustomers[index]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete(`${API_URL}/api/customers/:id`, async ({ params }) => {
    await delay(600);
    const { id } = params;
    const index = mockCustomers.findIndex((c) => c.id === id);
    if (index !== -1) {
      mockCustomers.splice(index, 1);
      return HttpResponse.json({ success: true });
    }
    return new HttpResponse(null, { status: 404 });
  }),
];
