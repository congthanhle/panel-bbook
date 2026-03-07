import { http, HttpResponse } from 'msw';
import { Court, PriceRule } from '@/types/court.types';


// Initial Mock Data
export let courtsList: Court[] = [
  {
    id: 'c1',
    name: 'Court 1 (Standard)',
    type: 'badminton',
    status: 'active',
    description: 'A standard wooden floor court perfect for regular play.',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: 'c2',
    name: 'Court 2 (Premium)',
    type: 'badminton',
    status: 'active',
    description: 'Premium synthetic surface with enhanced lighting.',
    imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: 'c3',
    name: 'Court 3 (VIP)',
    type: 'tennis',
    status: 'inactive',
    description: 'Exclusive tennis court, currently under maintenance.',
    imageUrl: 'https://images.unsplash.com/photo-1589883661923-6476cb0ae9f1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
];

let pricingRulesList: PriceRule[] = [
  {
    id: 'pr1',
    courtId: 'c1',
    dayType: 'weekday',
    timeStart: '06:00',
    timeEnd: '17:00',
    price: 60000,
  },
  {
    id: 'pr2',
    courtId: 'c1',
    dayType: 'weekday',
    timeStart: '17:00',
    timeEnd: '22:00',
    price: 90000,
  },
  {
    id: 'pr3',
    courtId: 'c1',
    dayType: 'weekend',
    timeStart: '06:00',
    timeEnd: '22:00',
    price: 100000,
  },
  {
    id: 'pr4',
    courtId: 'c2',
    dayType: 'weekday',
    timeStart: '06:00',
    timeEnd: '22:00',
    price: 120000,
  },
];

export const courtHandlers = [
  // Fetch all courts
  http.get('/api/courts', () => {
    return HttpResponse.json(courtsList);
  }),

  // Create court
  http.post('/api/courts', async ({ request }) => {
    const data = await request.json() as Omit<Court, 'id'>;
    const newCourt: Court = {
      ...data,
      id: `c${Date.now()}`,
    };
    courtsList.push(newCourt);
    return HttpResponse.json(newCourt, { status: 201 });
  }),

  // Update court
  http.patch('/api/courts/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json() as Partial<Court>;
    
    let updatedCourt = null;
    courtsList = courtsList.map(court => {
      if (court.id === id) {
        updatedCourt = { ...court, ...updates };
        return updatedCourt;
      }
      return court;
    });

    if (updatedCourt) {
      return HttpResponse.json(updatedCourt);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // Delete court
  http.delete('/api/courts/:id', ({ params }) => {
    const { id } = params;
    courtsList = courtsList.filter(court => court.id !== id);
    // Also cleanup pricing rules
    pricingRulesList = pricingRulesList.filter(rule => rule.courtId !== id);
    
    return HttpResponse.json({ success: true });
  }),

  // Fetch pricing rules for a court
  http.get('/api/courts/:courtId/pricing', ({ params }) => {
    const { courtId } = params;
    const rules = pricingRulesList.filter(rule => rule.courtId === courtId);
    return HttpResponse.json(rules);
  }),

  // Add pricing rule
  http.post('/api/courts/:courtId/pricing', async ({ params, request }) => {
    const { courtId } = params;
    const data = await request.json() as Omit<PriceRule, 'id' | 'courtId'>;
    
    const newRule: PriceRule = {
      ...data,
      id: `pr${Date.now()}`,
      courtId: String(courtId)
    };
    
    pricingRulesList.push(newRule);
    return HttpResponse.json(newRule, { status: 201 });
  }),

  // Update pricing rule
  http.patch('/api/pricing/:ruleId', async ({ params, request }) => {
    const { ruleId } = params;
    const updates = await request.json() as Partial<PriceRule>;
    
    let updatedRule = null;
    pricingRulesList = pricingRulesList.map(rule => {
      if (rule.id === ruleId) {
        updatedRule = { ...rule, ...updates };
        return updatedRule;
      }
      return rule;
    });

    if (updatedRule) {
      return HttpResponse.json(updatedRule);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // Delete pricing rule
  http.delete('/api/pricing/:ruleId', ({ params }) => {
    const { ruleId } = params;
    pricingRulesList = pricingRulesList.filter(rule => rule.id !== ruleId);
    return HttpResponse.json({ success: true });
  }),
];
