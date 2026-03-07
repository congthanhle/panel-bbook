import { Layout, Menu, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useUiStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Users, 
  Settings as SettingsIcon,
  LogOut,
  Menu as MenuIcon
} from 'lucide-react';

const { Header, Sider, Content } = Layout;

export const AppShell = () => {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <LayoutDashboard size={18} />,
      label: 'Dashboard',
    },
    {
      key: '/courts',
      icon: <Dumbbell size={18} />,
      label: 'Courts',
    },
    ...(user?.role === 'admin' ? [
      {
        key: '/staff',
        icon: <Users size={18} />,
        label: 'Staff',
      },
      {
        key: '/settings',
        icon: <SettingsIcon size={18} />,
        label: 'Settings',
      }
    ] : [])
  ];

  return (
    <Layout className="min-h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={sidebarCollapsed}
        theme="light"
        className="border-r border-slate-200"
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-200">
          <h1 className="text-xl font-bold text-primary-600 truncate px-4">
            {sidebarCollapsed ? 'CO' : 'CourtOS'}
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="mt-4 border-r-0"
        />
      </Sider>
      <Layout>
        <Header className="bg-white border-b border-slate-200 px-4 flex items-center justify-between">
          <Button 
            type="text" 
            icon={<MenuIcon size={20} />} 
            onClick={toggleSidebar} 
            className="flex items-center justify-center w-10 h-10"
          />
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">
              {user?.firstName} {user?.lastName} {user?.role ? `(${user.role})` : ''}
            </span>
            <Button type="text" danger icon={<LogOut size={18} />} onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Header>
        <Content className="p-6 bg-surface-dim overflow-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
