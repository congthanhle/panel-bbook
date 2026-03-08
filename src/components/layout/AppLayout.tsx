import { Layout, Spin } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';
import { useUiStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const { Content } = Layout;

export const AppLayout = () => {
  const { sidebarCollapsed } = useUiStore();
  const { restoreSession, isAuthenticated, token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    restoreSession(navigate);
  }, [restoreSession, navigate]);

  // Optionally block rendering the layout shell entirely until session is verified
  // if a token exists but user object is not yet loaded.
  if (token && !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Spin size="large" tip="Restoring session..." />
      </div>
    );
  }

  return (
    <Layout className="min-h-screen">
      <Sidebar />
      <Layout 
        className="transition-all duration-300 ease-in-out bg-slate-50"
        style={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
      >
        <Header />
        <Content className="p-0 mt-16 overflow-auto">
          {/* Main nested route injection point */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
