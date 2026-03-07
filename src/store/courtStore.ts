import { create } from 'zustand';
import { Court, PriceRule } from '@/types/court.types';
import axios from '@/lib/axios';

interface CourtState {
  courts: Court[];
  isLoading: boolean;
  error: string | null;
  selectedCourt: Court | null;
  pricingRules: Record<string, PriceRule[]>; // Keyed by courtId
  isPricingLoading: boolean;

  // Actions
  fetchCourts: () => Promise<void>;
  addCourt: (court: Omit<Court, 'id'>) => Promise<void>;
  updateCourt: (id: string, updates: Partial<Court>) => Promise<void>;
  deleteCourt: (id: string) => Promise<void>;
  setSelectedCourt: (court: Court | null) => void;

  // Pricing Actions
  fetchPricing: (courtId: string) => Promise<void>;
  addPricingRule: (courtId: string, rule: Omit<PriceRule, 'id' | 'courtId'>) => Promise<void>;
  updatePricingRule: (ruleId: string, updates: Partial<PriceRule>) => Promise<void>;
  deletePricingRule: (ruleId: string) => Promise<void>;
}

export const useCourtStore = create<CourtState>((set) => ({
  courts: [],
  isLoading: false,
  error: null,
  selectedCourt: null,
  pricingRules: {},
  isPricingLoading: false,

  fetchCourts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/courts');
      set({ courts: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch courts', isLoading: false });
    }
  },

  addCourt: async (courtData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/courts', courtData);
      set(state => ({ 
        courts: [...state.courts, response.data],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to add court', isLoading: false });
      throw error;
    }
  },

  updateCourt: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.patch(`/api/courts/${id}`, updates);
      set(state => ({
        courts: state.courts.map(c => c.id === id ? { ...c, ...response.data } : c),
        selectedCourt: state.selectedCourt?.id === id ? { ...state.selectedCourt, ...response.data } : state.selectedCourt,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update court', isLoading: false });
      throw error;
    }
  },

  deleteCourt: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`/api/courts/${id}`);
      set(state => ({
        courts: state.courts.filter(c => c.id !== id),
        selectedCourt: state.selectedCourt?.id === id ? null : state.selectedCourt,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete court', isLoading: false });
      throw error;
    }
  },

  setSelectedCourt: (court) => set({ selectedCourt: court }),

  fetchPricing: async (courtId) => {
    set({ isPricingLoading: true });
    try {
      const response = await axios.get(`/api/courts/${courtId}/pricing`);
      set(state => ({
        pricingRules: {
          ...state.pricingRules,
          [courtId]: response.data
        },
        isPricingLoading: false
      }));
    } catch (error) {
      console.error('Failed to fetch pricing', error);
      set({ isPricingLoading: false });
    }
  },

  addPricingRule: async (courtId, ruleData) => {
    set({ isPricingLoading: true });
    try {
      const response = await axios.post(`/api/courts/${courtId}/pricing`, ruleData);
      set(state => {
        const currentRules = state.pricingRules[courtId] || [];
        return {
          pricingRules: {
            ...state.pricingRules,
            [courtId]: [...currentRules, response.data]
          },
          isPricingLoading: false
        };
      });
    } catch (error) {
      console.error('Failed to add pricing rule', error);
      set({ isPricingLoading: false });
      throw error;
    }
  },

  updatePricingRule: async (ruleId, updates) => {
    try {
      const response = await axios.patch(`/api/pricing/${ruleId}`, updates);
      const updatedRule = response.data;
      
      set(state => {
        const courtId = updatedRule.courtId;
        const currentRules = state.pricingRules[courtId] || [];
        return {
          pricingRules: {
            ...state.pricingRules,
            [courtId]: currentRules.map(r => r.id === ruleId ? updatedRule : r)
          }
        };
      });
    } catch (error) {
       console.error('Failed to update pricing rule', error);
       throw error;
    }
  },
  
  deletePricingRule: async (ruleId) => {
    try {
      await axios.delete(`/api/pricing/${ruleId}`);
      set(state => {
         const newPricingRules = { ...state.pricingRules };
         let foundCourtId = null;
         
         for (const [courtId, rules] of Object.entries(newPricingRules)) {
             if (rules.some(r => r.id === ruleId)) {
                 foundCourtId = courtId;
                 break;
             }
         }
         
         if (foundCourtId) {
             newPricingRules[foundCourtId] = newPricingRules[foundCourtId].filter(r => r.id !== ruleId);
         }
         
         return { pricingRules: newPricingRules };
      });
    } catch(error) {
        console.error('Failed to delete pricing rule', error);
        throw error;
    }
  }
}));
