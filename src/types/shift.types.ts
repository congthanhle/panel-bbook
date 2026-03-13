import { Staff } from "./staff.types";

export type ShiftStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Shift {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  assignedStaff: Staff[];
  notes?: string;
  status: ShiftStatus;
}

export interface ShiftAssignment {
  shiftId: string;
  staffId: string;
  checkedIn?: string; // ISO String
  checkedOut?: string; // ISO String
}

export interface ShiftQueryDto {
  date?: string;
  month?: string;
  staffId?: string;
  status?: ShiftStatus;
  page?: number;
  limit?: number;
}

export type ShiftCalendarData = Record<string, Shift[]>;

export interface CreateShiftDto {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  staffIds?: string[];
}

export interface UpdateShiftDto extends Partial<CreateShiftDto> {}

export interface BulkCreateShiftDto {
  name: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  staffIds?: string[];
}
