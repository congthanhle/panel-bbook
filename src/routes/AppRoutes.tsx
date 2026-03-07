import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AppLayout } from '@/components/layout';
import { Spin } from 'antd';

// Lazy load features
const Login = lazy(() => import('../features/auth/Login'));
const Dashboard = lazy(() => import('../features/dashboard/Dashboard'));
const Overview = lazy(() => import('../features/overview/CourtOverviewPage'));
const Courts = lazy(() => import('../features/courts/Courts'));
const StaffListPage = lazy(() => import('../features/staff/StaffListPage'));
const ShiftsPage = lazy(() => import('../features/shifts/ShiftsPage'));
const MyProfilePage = lazy(() => import('../features/staff/MyProfilePage'));
const Customers = lazy(() => import('../features/customers/CustomersPage'));
const Products = lazy(() => import('../features/products/ProductsPage'));
const Settings = lazy(() => import('../features/settings/Settings'));
const NotFoundPage = lazy(() => import('../components/common/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <Spin size="large" />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="overview" element={<Overview />} />
            <Route path="courts" element={<Courts />} />
            <Route path="customers" element={<Customers />} />
            <Route path="products" element={<Products />} />
            
            {/* Staff-specific route logic */}
            <Route path="staff/me" element={<MyProfilePage />} />

            {/* Admin only routes */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="staff" element={<StaffListPage />} />
              <Route path="shifts" element={<ShiftsPage />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
