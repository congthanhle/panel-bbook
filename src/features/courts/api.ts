import { apiClient } from "@/lib/api-client";
import { PaginatedResponse } from "@/types/api.types";
import {
  Court,
  PriceRule,
  CourtQueryDto,
  CreateCourtDto,
  UpdateCourtDto,
  CreatePriceRuleDto,
  UpdatePriceRuleDto,
  BulkUpdatePricesDto,
  LockCourtDto,
} from "@/types/court.types";

export const courtsApi = {
  // ── CRUD ───────────────────────────────────────────────────────────
  getAll: (params?: CourtQueryDto) =>
    apiClient.get<PaginatedResponse<Court>>("/courts", { params }),

  getOne: (id: string) =>
    apiClient.get<Court>(`/courts/${id}`),

  create: (dto: CreateCourtDto) =>
    apiClient.post<Court>("/courts", dto),

  update: (id: string, dto: UpdateCourtDto) =>
    apiClient.patch<Court>(`/courts/${id}`, dto),

  remove: (id: string) =>
    apiClient.del(`/courts/${id}`),

  // ── Pricing ────────────────────────────────────────────────────────
  getPriceRules: (courtId: string) =>
    apiClient.get<PriceRule[]>(`/courts/${courtId}/price-rules`),

  addPriceRule: (courtId: string, dto: CreatePriceRuleDto) =>
    apiClient.post<PriceRule>(`/courts/${courtId}/price-rules`, dto),

  updatePriceRule: (ruleId: string, dto: UpdatePriceRuleDto) =>
    apiClient.patch<PriceRule>(`/courts/price-rules/${ruleId}`, dto),

  deletePriceRule: (ruleId: string) =>
    apiClient.del(`/courts/price-rules/${ruleId}`),

  bulkUpdatePrices: (courtId: string, dto: BulkUpdatePricesDto) =>
    apiClient.post(`/courts/${courtId}/price-rules/bulk`, dto),

  // ── Lock management ────────────────────────────────────────────────
  lockCourt: (courtId: string, dto: LockCourtDto) =>
    apiClient.post(`/courts/${courtId}/lock`, dto),

  unlockCourt: (courtId: string, dto: LockCourtDto) =>
    apiClient.post(`/courts/${courtId}/unlock`, dto),

  // ── Price calculation ──────────────────────────────────────────────
  calculatePrice: (courtId: string, date: string, startTime: string, endTime: string) =>
    apiClient.get<{ totalPrice: number }>(
      `/courts/${courtId}/calculate-price`,
      { params: { date, startTime, endTime } },
    ),
};
