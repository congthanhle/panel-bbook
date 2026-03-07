import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types/auth.types';
import { Result, Button } from 'antd';

interface ProtectedRouteProps {
  roles?: Role[];
}

export const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required and user doesn't have them
  if (roles && !hasRole(roles)) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <Result
          status="403"
          title="403 Forbidden"
          subTitle="Sorry, you don't have authorization to access this sector."
          extra={<Button type="primary" onClick={() => window.location.href = '/'}>Return to Dashboard</Button>}
        />
      </div>
    );
  }

  return <Outlet />;
};
