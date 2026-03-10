export type CourtStatus = 'active' | 'inactive';

export type CourtType = 'badminton' | 'pickleball' | 'tennis' | 'futsal';

export type DayType = 'weekday' | 'weekend' | 'holiday' | 'specific_date';

export interface PriceRule {
  id: string;
  courtId: string;
  dayType: DayType;
  specificDate?: string; // YYYY-MM-DD
  timeStart: string; // HH:mm
  timeEnd: string; // HH:mm
  price: number;
}

export interface Court {
  id: string;
  name: string;
  type: CourtType;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  priceRulesCount: number;
  createdAt: string;
  updatedAt: string;
  /** Legacy compat — may be undefined when fetched from list endpoint */
  status?: CourtStatus;
  priceSchedule?: PriceRule[];
}

// ── Query / Command DTOs ────────────────────────────────────────────

export interface CourtQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  type?: CourtType;
  isActive?: boolean;
}

export interface CreateCourtDto {
  name: string;
  type: CourtType;
  description?: string;
  imageUrl?: string;
}

export interface UpdateCourtDto extends Partial<CreateCourtDto> {
  isActive?: boolean;
}

export interface CreatePriceRuleDto {
  dayType: DayType;
  specificDate?: string;
  timeStart: string;
  timeEnd: string;
  price: number;
}

export interface UpdatePriceRuleDto extends Partial<CreatePriceRuleDto> {}

export interface BulkUpdatePricesDto {
  rules: CreatePriceRuleDto[];
}

export interface LockCourtDto {
  startDate: string;
  endDate: string;
  timeSlotIds?: string[];
  reason?: string;
  action: 'lock' | 'unlock';
}
