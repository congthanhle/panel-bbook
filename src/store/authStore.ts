import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role, Permission } from '@/types/auth.types';

// Role capability mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    Permission.VIEW_STAFF_ALL,
    Permission.VIEW_OWN_PROFILE,
    Permission.MANAGE_COURTS,
    Permission.MANAGE_SHIFTS,
    Permission.MANAGE_USERS,
  ],
  staff: [
    Permission.VIEW_OWN_PROFILE,
  ],
};

interface AuthStoreState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  restoreSession: () => void; // Optional if persist handles it, but good for manual checks
  hasRole: (roles: Role[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: !!token, error: null });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      restoreSession: () => {
        // Since we are using persist middleware, the state is hydrated automatically.
        // This function can be used to validate the token with the backend if needed in the future.
        const state = get();
        if (state.token && !state.isAuthenticated) {
           set({ isAuthenticated: true });
        }
      },

      hasRole: (roles) => {
        const user = get().user;
        if (!user) return false;
        return roles.includes(user.role);
      },

      hasPermission: (permission) => {
        const user = get().user;
        if (!user) return false;
        
        const userPermissions = ROLE_PERMISSIONS[user.role] || [];
        return userPermissions.includes(permission);
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'courtos-auth', // localStorage key
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }), // Only persist these fields
    }
  )
);
