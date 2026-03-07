export type CourtStatus = 'active' | 'inactive';

export type CourtType = 'badminton' | 'pickleball' | 'tennis' | 'futsal';

export interface PriceRule {
  id: string;
  courtId: string;
  dayType: 'weekday' | 'weekend' | 'holiday' | 'specific_date';
  specificDate?: string; // YYYY-MM-DD
  timeStart: string; // HH:mm
  timeEnd: string; // HH:mm
  price: number;
}

export interface Court {
  id: string;
  name: string;
  type: CourtType;
  status: CourtStatus;
  description?: string;
  imageUrl?: string;
  priceSchedule?: PriceRule[];
}
