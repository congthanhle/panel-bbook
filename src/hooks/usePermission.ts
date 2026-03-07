import { useAuthStore } from '@/store/authStore';
import { ROLE_PERMISSIONS } from '@/constants';
import { Permission } from '@/types/auth.types';

export const usePermission = () => {
  const { user } = useAuthStore();

  const hasPermission = (permission: Permission) => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  };

  return { hasPermission };
};
