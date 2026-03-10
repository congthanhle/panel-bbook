import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types/auth.types';
import { Result, Button, Spin } from 'antd';

interface ProtectedRouteProps {
  roles?: Role[];
}

export const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  const { isAuthenticated, token, hasRole } = useAuth();
  const location = useLocation();

  // If we are definitely not authenticated and have no token persisted, bounce immediately
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we have a token but aren't authenticated yet (e.g. restoreSession is running) -> wait
  if (!isAuthenticated && token) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Spin size="large" />
      </div>
    );
  }

  // If specific roles are required and user doesn't have them
  if (roles && !hasRole(roles)) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <Result
          status="403"
          title="403 Forbidden"
          subTitle="Sorry, you don't have authorization to access this sector."
          extra={<Button type="primary" onClick={() => (window.location.href = '/')}>Return to Dashboard</Button>}
        />
      </div>
    );
  }

  // If authenticated and no role mismatch, render children
  return <Outlet />;
};
