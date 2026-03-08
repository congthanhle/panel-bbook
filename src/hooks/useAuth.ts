import { useAuthStore } from '@/store/authStore';
import { LoginPayload } from '@/types/auth.types';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const store = useAuthStore();
  const navigate = useNavigate();

  const login = async (payload: LoginPayload, redirectUrl?: string) => {
    await store.login(payload.email, payload.password || '', navigate, redirectUrl);
    const { error } = useAuthStore.getState();
    return { success: !error };
  };

  const logout = () => {
    store.logout(navigate);
  };

  const isAdmin = store.user?.role === 'admin';

  return {
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login,
    logout,
    hasPermission: store.hasPermission,
    hasRole: store.hasRole,
    isAdmin,
  };
};
