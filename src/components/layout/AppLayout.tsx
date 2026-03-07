import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';
import { useUiStore } from '@/store/uiStore';

const { Content } = Layout;

export const AppLayout = () => {
  const { sidebarCollapsed } = useUiStore();

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
