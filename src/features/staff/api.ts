import { apiClient } from "@/lib/api-client";
import { PaginatedResponse } from "@/types/api.types";
import { Staff, Shift, StaffQueryDto, CreateStaffDto, UpdateStaffDto } from "@/types/staff.types";

export const staffApi = {
  // Admin: fetch all staff
  getAll: (params: StaffQueryDto) =>
    apiClient.get<PaginatedResponse<Staff>>("/staff", { params }),

  // Staff: fetch own profile only
  getMe: () =>
    apiClient.get<Staff>("/staff/me"),

  getOne: (id: string) =>
    apiClient.get<Staff>(`/staff/${id}`),

  create: (dto: CreateStaffDto) =>
    apiClient.post<Staff>("/staff", dto),

  update: (id: string, dto: UpdateStaffDto) =>
    apiClient.patch<Staff>(`/staff/${id}`, dto),

  deactivate: (id: string) =>
    apiClient.patch(`/staff/${id}/deactivate`),

  activate: (id: string) =>
    apiClient.patch(`/staff/${id}/activate`),

  getShifts: (id: string, month: string) =>
    apiClient.get<Shift[]>(`/staff/${id}/shifts`, { params: { month } }),
};
