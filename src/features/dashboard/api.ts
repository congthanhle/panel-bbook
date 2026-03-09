import { apiClient } from "@/lib/api-client";
import {
  DashboardStats,
  RevenueData,
  BookingTypeData,
  PeakHourData,
  CourtUtilizationData,
} from "@/types/dashboard.types";

export interface DashboardQueryDto {
  period: "today" | "week" | "month" | "custom";
  dateFrom?: string;
  dateTo?: string;
}

export const dashboardApi = {
  getFullDashboard: (params: DashboardQueryDto) =>
    apiClient.get<DashboardStats>("/dashboard", { params }),

  getRevenueByDay: (dateFrom: string, dateTo: string) =>
    apiClient.get<RevenueData[]>("/dashboard/revenue", {
      params: { dateFrom, dateTo },
    }),

  getPeakHours: (dateFrom: string, dateTo: string) =>
    apiClient.get<PeakHourData[]>("/dashboard/peak-hours", {
      params: { dateFrom, dateTo },
    }),

  getCourtUtilization: (dateFrom: string, dateTo: string) =>
    apiClient.get<CourtUtilizationData[]>("/dashboard/court-utilization", {
      params: { dateFrom, dateTo },
    }),
};
