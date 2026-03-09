import { create } from 'zustand';
import dayjs from 'dayjs';
import { dashboardApi, DashboardQueryDto } from '@/features/dashboard/api';
import { DashboardStats, RevenueData, PeakHourData, CourtUtilizationData } from '@/types/dashboard.types';

type Period = DashboardQueryDto['period'];

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface DashboardState {
  period: Period;
  
  // Data
  fullDashboard: DashboardStats | null;
  revenueByDay: RevenueData[] | null;
  peakHours: PeakHourData[] | null;
  courtUtilization: CourtUtilizationData[] | null;

  // Loading states (independent)
  isLoadingFullDashboard: boolean;
  isLoadingRevenue: boolean;
  isLoadingPeakHours: boolean;
  isLoadingUtilization: boolean;

  error: string | null;

  // Cache
  cache: {
    fullDashboard: Record<string, CacheItem<DashboardStats>>;
    revenue: Record<string, CacheItem<RevenueData[]>>;
    peakHours: Record<string, CacheItem<PeakHourData[]>>;
    utilization: Record<string, CacheItem<CourtUtilizationData[]>>;
  };

  // Actions
  fetchDashboard: (period: Period, customDates?: { dateFrom: string; dateTo: string }) => Promise<void>;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useDashboardStore = create<DashboardState>((set, get) => ({
  period: 'today',

  fullDashboard: null,
  revenueByDay: null,
  peakHours: null,
  courtUtilization: null,

  isLoadingFullDashboard: false,
  isLoadingRevenue: false,
  isLoadingPeakHours: false,
  isLoadingUtilization: false,

  error: null,

  cache: {
    fullDashboard: {},
    revenue: {},
    peakHours: {},
    utilization: {},
  },

  fetchDashboard: async (period, customDates) => {
    set({ period, error: null });

    let dateFrom = '';
    let dateTo = '';

    if (period === 'today') {
      const today = dayjs().format("YYYY-MM-DD");
      dateFrom = today;
      dateTo = today;
    } else if (period === 'week') {
      dateFrom = dayjs().startOf('week').format("YYYY-MM-DD");
      dateTo = dayjs().endOf('week').format("YYYY-MM-DD");
    } else if (period === 'month') {
      dateFrom = dayjs().startOf('month').format("YYYY-MM-DD");
      dateTo = dayjs().endOf('month').format("YYYY-MM-DD");
    } else if (period === 'custom') {
      dateFrom = customDates?.dateFrom || '';
      dateTo = customDates?.dateTo || '';
    }

    const { cache } = get();
    const now = Date.now();
    const cacheKey = `${period}_${dateFrom}_${dateTo}`;

    const isCacheValid = (timestamp: number) => (now - timestamp) < CACHE_TTL;

    const fetchPromises = [];

    // 1. Full Dashboard
    const cachedDashboard = cache.fullDashboard[cacheKey];
    if (cachedDashboard && isCacheValid(cachedDashboard.timestamp)) {
      set({ fullDashboard: cachedDashboard.data });
    } else {
      set({ isLoadingFullDashboard: true });
      fetchPromises.push(
        dashboardApi.getFullDashboard({ period, dateFrom, dateTo })
          .then(res => {
            set((state) => ({
              fullDashboard: res,
              isLoadingFullDashboard: false,
              cache: {
                ...state.cache,
                fullDashboard: {
                  ...state.cache.fullDashboard,
                  [cacheKey]: { data: res, timestamp: Date.now() }
                }
              }
            }));
          })
          .catch(err => {
            set({ error: err.message || 'Failed to fetch dashboard', isLoadingFullDashboard: false });
          })
      );
    }

    // 2. Revenue By Day
    const cachedRevenue = cache.revenue[cacheKey];
    if (cachedRevenue && isCacheValid(cachedRevenue.timestamp)) {
      set({ revenueByDay: cachedRevenue.data });
    } else {
      set({ isLoadingRevenue: true });
      fetchPromises.push(
        dashboardApi.getRevenueByDay(dateFrom, dateTo)
          .then(res => {
            set((state) => ({
              revenueByDay: res,
              isLoadingRevenue: false,
              cache: {
                ...state.cache,
                revenue: {
                  ...state.cache.revenue,
                  [cacheKey]: { data: res, timestamp: Date.now() }
                }
              }
            }));
          })
          .catch(() => set({ isLoadingRevenue: false }))
      );
    }

    // 3. Peak Hours
    const cachedPeak = cache.peakHours[cacheKey];
    if (cachedPeak && isCacheValid(cachedPeak.timestamp)) {
      set({ peakHours: cachedPeak.data });
    } else {
      set({ isLoadingPeakHours: true });
      fetchPromises.push(
        dashboardApi.getPeakHours(dateFrom, dateTo)
          .then(res => {
            set((state) => ({
              peakHours: res,
              isLoadingPeakHours: false,
              cache: {
                ...state.cache,
                peakHours: {
                  ...state.cache.peakHours,
                  [cacheKey]: { data: res, timestamp: Date.now() }
                }
              }
            }));
          })
          .catch(() => set({ isLoadingPeakHours: false }))
      );
    }

    // 4. Court Utilization
    const cachedUtil = cache.utilization[cacheKey];
    if (cachedUtil && isCacheValid(cachedUtil.timestamp)) {
      set({ courtUtilization: cachedUtil.data });
    } else {
      set({ isLoadingUtilization: true });
      fetchPromises.push(
        dashboardApi.getCourtUtilization(dateFrom, dateTo)
          .then(res => {
            set((state) => ({
              courtUtilization: res,
              isLoadingUtilization: false,
              cache: {
                ...state.cache,
                utilization: {
                  ...state.cache.utilization,
                  [cacheKey]: { data: res, timestamp: Date.now() }
                }
              }
            }));
          })
          .catch(() => set({ isLoadingUtilization: false }))
      );
    }

    await Promise.allSettled(fetchPromises);
  }
}));
