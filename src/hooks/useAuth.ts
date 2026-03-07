import { useAuthStore } from '@/store/authStore';
import { LoginPayload } from '@/types/auth.types';
import axios from '@/lib/axios';
import { App } from 'antd';

export const useAuth = () => {
  const store = useAuthStore();
  const { message } = App.useApp();

  const login = async (payload: LoginPayload) => {
    store.setLoading(true);
    store.setError(null);
    try {
      const { data } = await axios.post('/api/auth/login', payload);
      store.setAuth(data.user, data.token);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      store.setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      store.setLoading(false);
    }
  };

  const logout = () => {
    store.logout();
    message.info('You have been logged out.');
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
