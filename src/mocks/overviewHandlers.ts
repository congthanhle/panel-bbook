import { http, HttpResponse } from 'msw';
import { SlotCell, OverviewData, OperatingHours, CreateBookingPayload } from '@/types/overview.types';
import { courtsList } from './courtHandlers';
import dayjs from 'dayjs';

const API_URL = import.meta.env.VITE_API_URL || '';

const mockOperatingHours: OperatingHours = {
  openTime: '06:00',
  closeTime: '22:00',
  intervalMinutes: 30
};

// Generate time slots dynamically based on operating hours
const generateTimeSlots = (config: OperatingHours) => {
  const slots: string[] = [];
  const [openHour, openMin] = config.openTime.split(':').map(Number);
  const [closeHour, closeMin] = config.closeTime.split(':').map(Number);
  
  let current = dayjs().hour(openHour).minute(openMin).second(0);
  const end = dayjs().hour(closeHour).minute(closeMin).second(0);
  
  while (current.isBefore(end)) {
    slots.push(current.format('HHmm'));
    current = current.add(config.intervalMinutes, 'minute');
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots(mockOperatingHours);

// Helper to generate a consistent but pseudo-random state based on date string
const generateMockSlots = (dateString: string): Record<string, SlotCell> => {
  const isFutureMonth = dayjs(dateString).isAfter(dayjs(), 'month');

  const slots: Record<string, SlotCell> = {};

  // Map to the shared global courts list instead of hardcoding
  courtsList.forEach(court => {
    TIME_SLOTS.forEach((timeSlotId, i) => {
      const key = `${court.id}_${timeSlotId}`;
      let status: SlotCell['status'] = 'available';
      let booking;

      if (isFutureMonth) {
         // Rule: Future months default to locked until admin unlocks
         status = 'locked';
      } else {
        // Deterministic pseudo-randomness for demo
        const seed = dateString.length + court.id.length + timeSlotId.length + i;
        
        if (seed % 9 === 0) {
           status = 'maintenance';
        } else if (seed % 14 === 0) {
           status = 'locked';
        } else if (seed % 3 === 0) {
           status = 'booked';
           booking = {
             id: `bkg-${dateString}-${key}`,
             customerName: `Customer ${seed % 100}`,
             customerInitial: `C${seed % 10}`,
             amount: 15.00,
             paymentStatus: seed % 2 === 0 ? 'paid' : 'pending',
             status: 'confirmed'
           } as const;
        }
      }

      slots[key] = {
        courtId: court.id,
        timeSlotId,
        status,
        booking,
        price: 15.00
      };
    });
  });

  return slots;
};

// In-memory state for mutations during the session
let currentSlotsByDate: Record<string, Record<string, SlotCell>> = {};

export const overviewHandlers = [
  http.get(`${API_URL}/api/overview`, ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || dayjs().format('YYYY-MM-DD');

    if (!currentSlotsByDate[date]) {
       currentSlotsByDate[date] = generateMockSlots(date);
    }

    const data: OverviewData = {
      date,
      courts: courtsList.filter(c => c.status === 'active').map(c => ({
        id: c.id,
        name: c.name,
        type: c.type as any, // Cast to any to bypass the loose typedef mismatch from earlier
        isActive: c.status === 'active'
      })),
      slots: currentSlotsByDate[date],
      operatingHours: mockOperatingHours
    };

    return HttpResponse.json(data);
  }),

  http.patch(`${API_URL}/api/slots/lock`, async ({ request }) => {
    const payload = await request.json() as { courtId: string, timeSlotId: string, action: 'lock'|'unlock', date?: string };
    const date = payload.date || dayjs().format('YYYY-MM-DD'); // Ideally frontend sends date
    const key = `${payload.courtId}_${payload.timeSlotId}`;

    if (currentSlotsByDate[date] && currentSlotsByDate[date][key]) {
      currentSlotsByDate[date][key].status = payload.action === 'lock' ? 'locked' : 'available';
    }

    return HttpResponse.json({ success: true });
  }),

  http.patch(`${API_URL}/api/slots/bulk`, async ({ request }) => {
    const payload = await request.json() as { slots: string[], action: 'lock'|'unlock', date?: string };
    const date = payload.date || dayjs().format('YYYY-MM-DD'); // Ideally frontend sends date
    
    if (currentSlotsByDate[date]) {
       payload.slots.forEach(key => {
         if (currentSlotsByDate[date][key]) {
             // Only allow changing available/locked statuses. Can't bulk unlock booked slots.
             const currentStatus = currentSlotsByDate[date][key].status;
             if (currentStatus !== 'booked' && currentStatus !== 'maintenance') {
                 currentSlotsByDate[date][key].status = payload.action === 'lock' ? 'locked' : 'available';
             }
         }
       })
    }
    
    return HttpResponse.json({ success: true, updatedCount: payload.slots.length });
  }),

  // Add booking mock handler
  http.post(`${API_URL}/api/bookings`, async ({ request }) => {
    const payload = await request.json() as CreateBookingPayload;
    const date = dayjs().format('YYYY-MM-DD'); 
    
    if (currentSlotsByDate[date]) {
       payload.selectedCells.forEach(key => {
         if (currentSlotsByDate[date][key]) {
             currentSlotsByDate[date][key] = {
                 ...currentSlotsByDate[date][key],
                 status: 'booked',
                 booking: {
                     id: `bkg-${Date.now().toString().slice(-6)}`,
                     customerName: payload.customerName,
                     customerInitial: payload.customerName.charAt(0).toUpperCase(),
                     phone: payload.phone,
                     amount: payload.totalAmount / payload.selectedCells.length, // Rough split for mock display
                     paymentStatus: payload.paymentMode === 'cash' && payload.downPayment === 0 ? 'pending' : 'paid',
                     status: 'confirmed'
                 }
             }
         }
       })
    }

    return HttpResponse.json({ success: true, bookingId: `bkg-${Date.now().toString().slice(-6)}` });
  }),

  // Cancel booking mock handler
  http.patch(`${API_URL}/api/bookings/cancel`, async ({ request }) => {
    const payload = await request.json() as { courtId: string, timeSlotId: string, action: 'unlock', date?: string, reason?: string };
    const date = payload.date || dayjs().format('YYYY-MM-DD'); 
    const key = `${payload.courtId}_${payload.timeSlotId}`;

    if (currentSlotsByDate[date] && currentSlotsByDate[date][key]) {
      // Return slot to available and delete the embedded booking record
      currentSlotsByDate[date][key] = {
        ...currentSlotsByDate[date][key],
        status: 'available',
        booking: undefined,
      };
    }

    return HttpResponse.json({ success: true });
  })
];
