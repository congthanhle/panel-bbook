import { apiClient } from "@/lib/api-client";
import { PaginatedResponse } from "@/types/api.types";
import { Modal } from "antd";
import { 
  Shift, 
  ShiftQueryDto, 
  ShiftCalendarData, 
  CreateShiftDto, 
  UpdateShiftDto, 
  BulkCreateShiftDto 
} from "@/types/shift.types";

export const shiftsApi = {
  getAll: (params: ShiftQueryDto) =>
    apiClient.get<PaginatedResponse<Shift>>("/shifts", { params }),

  getCalendar: (month: string) =>
    apiClient.get<ShiftCalendarData>("/shifts/calendar", { params: { month } }),

  getOne: (id: string) =>
    apiClient.get<Shift>(`/shifts/${id}`),

  create: (dto: CreateShiftDto) =>
    apiClient.post<Shift>("/shifts", dto),

  createBulk: (dto: BulkCreateShiftDto) =>
    apiClient.post<Shift[]>("/shifts/bulk", dto),

  update: (id: string, dto: UpdateShiftDto) =>
    apiClient.patch<Shift>(`/shifts/${id}`, dto),

  remove: (id: string) =>
    apiClient.del(`/shifts/${id}`),

  assignStaff: async (id: string, staffIds: string[]) => {
    try {
      return await apiClient.post<any>(`/shifts/${id}/assign`, { staffIds });
    } catch (error: any) {
      if (
        error.response?.status === 409 &&
        error.response?.data?.code === "SHIFT_CONFLICT"
      ) {
        const { conflictingShift } = error.response.data.details;
        Modal.warning({
          title: "Schedule Conflict",
          content: `[Staff Name] already has shift "${conflictingShift.name}" on ${conflictingShift.date} from ${conflictingShift.startTime}–${conflictingShift.endTime}`,
        });
      }
      throw error;
    }
  },

  unassignStaff: (shiftId: string, staffId: string) =>
    apiClient.del(`/shifts/${shiftId}/staff/${staffId}`),

  checkIn: (id: string) =>
    apiClient.post(`/shifts/${id}/check-in`),

  checkOut: (id: string) =>
    apiClient.post(`/shifts/${id}/check-out`),
};
