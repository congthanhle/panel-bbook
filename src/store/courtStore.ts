import { create } from 'zustand';
import { message } from 'antd';
import {
  Court,
  PriceRule,
  CourtQueryDto,
  CreateCourtDto,
  UpdateCourtDto,
  CreatePriceRuleDto,
  UpdatePriceRuleDto,
  LockCourtDto,
} from '@/types/court.types';
import { courtsApi } from '@/features/courts/api';

interface CourtState {
  courts: Court[];
  totalCourts: number;
  isLoading: boolean;
  error: string | null;
  selectedCourt: Court | null;
  pricingRules: Record<string, PriceRule[]>; // Keyed by courtId
  isPricingLoading: boolean;

  // CRUD Actions
  fetchAll: (params?: CourtQueryDto) => Promise<void>;
  fetchOne: (id: string) => Promise<void>;
  create: (dto: CreateCourtDto) => Promise<void>;
  update: (id: string, dto: UpdateCourtDto) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelectedCourt: (court: Court | null) => void;

  // Pricing Actions
  fetchPriceRules: (courtId: string) => Promise<void>;
  addRule: (courtId: string, dto: CreatePriceRuleDto) => Promise<void>;
  updateRule: (ruleId: string, dto: UpdatePriceRuleDto) => Promise<void>;
  deleteRule: (ruleId: string, courtId: string) => Promise<void>;

  // Lock Actions
  lockCourt: (courtId: string, dto: LockCourtDto) => Promise<void>;
}

export const useCourtStore = create<CourtState>((set) => ({
  courts: [],
  totalCourts: 0,
  isLoading: false,
  error: null,
  selectedCourt: null,
  pricingRules: {},
  isPricingLoading: false,

  // ── CRUD ───────────────────────────────────────────────────────────

  fetchAll: async (params) => {
    set({ isLoading: true, error: null });
    try {
      // The axios response interceptor already unwraps { success, data, meta } → data,
      // so `res` is Court[] directly (meta is in response headers but not accessible here).
      const res = await courtsApi.getAll(params);
      const courts = Array.isArray(res) ? res : (res as any).data ?? [];
      const total = Array.isArray(res) ? courts.length : ((res as any).meta?.total ?? courts.length);
      set({ courts, totalCourts: total, isLoading: false });
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch courts';
      set({ error: msg, isLoading: false });
      message.error(msg);
    }
  },

  fetchOne: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const court = await courtsApi.getOne(id);
      set({ selectedCourt: court, isLoading: false });
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch court';
      set({ error: msg, isLoading: false });
      message.error(msg);
    }
  },

  create: async (dto) => {
    set({ isLoading: true, error: null });
    try {
      const court = await courtsApi.create(dto);
      set((s) => ({
        courts: [...s.courts, court],
        totalCourts: s.totalCourts + 1,
        isLoading: false,
      }));
      message.success('Court created successfully');
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || 'Failed to create court';
      set({ error: msg, isLoading: false });
      message.error(msg);
      throw error;
    }
  },

  update: async (id, dto) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await courtsApi.update(id, dto);
      set((s) => ({
        courts: s.courts.map((c) => (c.id === id ? { ...c, ...updated } : c)),
        selectedCourt:
          s.selectedCourt?.id === id ? { ...s.selectedCourt, ...updated } : s.selectedCourt,
        isLoading: false,
      }));
      message.success('Court updated successfully');
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || 'Failed to update court';
      set({ error: msg, isLoading: false });
      message.error(msg);
      throw error;
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await courtsApi.remove(id);
      set((s) => ({
        courts: s.courts.filter((c) => c.id !== id),
        totalCourts: s.totalCourts - 1,
        selectedCourt: s.selectedCourt?.id === id ? null : s.selectedCourt,
        isLoading: false,
      }));
      message.success('Court deleted successfully');
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || 'Failed to delete court';
      set({ error: msg, isLoading: false });
      message.error(msg);
      throw error;
    }
  },

  setSelectedCourt: (court) => set({ selectedCourt: court }),

  // ── Pricing ────────────────────────────────────────────────────────

  fetchPriceRules: async (courtId) => {
    set({ isPricingLoading: true });
    try {
      const rules = await courtsApi.getPriceRules(courtId);
      set((s) => ({
        pricingRules: { ...s.pricingRules, [courtId]: rules },
        isPricingLoading: false,
      }));
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch price rules';
      set({ isPricingLoading: false });
      message.error(msg);
    }
  },

  addRule: async (courtId, dto) => {
    set({ isPricingLoading: true });
    try {
      const rule = await courtsApi.addPriceRule(courtId, dto);
      set((s) => {
        const current = s.pricingRules[courtId] || [];
        return {
          pricingRules: { ...s.pricingRules, [courtId]: [...current, rule] },
          isPricingLoading: false,
        };
      });
      message.success('Price rule added');
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || 'Failed to add price rule';
      set({ isPricingLoading: false });
      message.error(msg);
      throw error;
    }
  },

  updateRule: async (ruleId, dto) => {
    set({ isPricingLoading: true });
    try {
      const updated = await courtsApi.updatePriceRule(ruleId, dto);
      set((s) => {
        const courtId = updated.courtId;
        const current = s.pricingRules[courtId] || [];
        return {
          pricingRules: {
            ...s.pricingRules,
            [courtId]: current.map((r) => (r.id === ruleId ? updated : r)),
          },
          isPricingLoading: false,
        };
      });
      message.success('Price rule updated');
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || 'Failed to update price rule';
      set({ isPricingLoading: false });
      message.error(msg);
      throw error;
    }
  },

  deleteRule: async (ruleId, courtId) => {
    set({ isPricingLoading: true });
    try {
      await courtsApi.deletePriceRule(ruleId);
      set((s) => ({
        pricingRules: {
          ...s.pricingRules,
          [courtId]: (s.pricingRules[courtId] || []).filter((r) => r.id !== ruleId),
        },
        isPricingLoading: false,
      }));
      message.success('Price rule deleted');
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || 'Failed to delete price rule';
      set({ isPricingLoading: false });
      message.error(msg);
      throw error;
    }
  },

  // ── Lock ───────────────────────────────────────────────────────────

  lockCourt: async (courtId, dto) => {
    set({ isLoading: true, error: null });
    try {
      const action = dto.action === 'lock' ? courtsApi.lockCourt : courtsApi.unlockCourt;
      await action(courtId, dto);
      set({ isLoading: false });
      message.success(`Court ${dto.action === 'lock' ? 'locked' : 'unlocked'} successfully`);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        `Failed to ${dto.action} court`;
      set({ error: msg, isLoading: false });
      message.error(msg);
      throw error;
    }
  },
}));
