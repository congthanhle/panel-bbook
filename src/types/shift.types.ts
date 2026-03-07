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
