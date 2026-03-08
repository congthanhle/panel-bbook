import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role, Permission } from '@/types/auth.types';
import { authApi } from '@/features/auth/api';
import { NavigateFunction } from 'react-router-dom';

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
  login: (email: string, password: string, navigate: NavigateFunction, redirectUrl?: string) => Promise<void>;
  logout: (navigate?: NavigateFunction) => Promise<void>;
  restoreSession: (navigate: NavigateFunction) => Promise<void>;
  
  hasRole: (roles: Role[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password, navigate, redirectUrl = '/dashboard') => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          set({
            token: response.access_token,
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
          navigate(redirectUrl, { replace: true });
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
          });
        }
      },

      restoreSession: async (navigate) => {
        const { token } = get();
        if (!token) {
          navigate('/login', { replace: true });
          return;
        }

        try {
          const user = await authApi.getMe();
          set({ user, isAuthenticated: true });
        } catch (error) {
          // Interceptor handles 401 redirects, but clear unpersisted state just in case
          set({ token: null, user: null, isAuthenticated: false });
        }
      },

      logout: async (navigate) => {
        try {
          await authApi.logout();
        } catch (e) {
          // Fire and forget, ignore errors
        }
        set({ token: null, user: null, isAuthenticated: false });
        if (navigate) {
          navigate('/login', { replace: true });
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
    }),
    {
      name: 'courtos-auth',
      partialize: (state) => ({ token: state.token }), // Only persist token
    }
  )
);
