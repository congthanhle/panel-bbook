import { Layout, Menu, Typography, Dropdown, Avatar } from 'antd';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  MapPin, 
  Users, 
  Clock, 
  UserSquare2, 
  ShoppingCart, 
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';

const { Sider } = Layout;

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const { user, isAdmin, logout } = useAuth();

  // Dynamic role-based menu generation
  const getMenuItems = () => {
    const items: any[] = [
      {
        key: '/dashboard',
        icon: <LayoutDashboard size={18} />,
        label: 'Dashboard',
      },
      {
        key: '/overview',
        icon: <MapIcon size={18} />,
        label: 'Court Overview',
      },
      {
        key: '/courts',
        icon: <MapPin size={18} />,
        label: 'Courts',
      },
    ];

    // Staff Routing Matrix
    if (isAdmin) {
      items.push({
        key: '/staff',
        icon: <Users size={18} />,
        label: 'Staff',
      });
      items.push({
        key: '/shifts',
        icon: <Clock size={18} />,
        label: 'Shifts',
      });
    } else {
      // Regular staff can only see their own staff profile
      items.push({
        key: '/staff/me',
        icon: <UserSquare2 size={18} />,
        label: 'My Profile',
      });
    }

    // Shared items
    items.push({
      key: '/customers',
      icon: <Users size={18} />,
      label: 'Customers',
    });
    
    items.push({
      key: '/products',
      icon: <ShoppingCart size={18} />,
      label: 'Products & Services',
    });

    if (isAdmin) {
      items.push({
        key: '/settings',
        icon: <Settings size={18} />,
        label: 'Settings',
      });
    }

    return items;
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPath = location.pathname.startsWith('/staff') && !isAdmin ? '/staff/me' : location.pathname;

  return (
    <Sider
      collapsible
      collapsed={sidebarCollapsed}
      onCollapse={toggleSidebar}
      width={240}
      collapsedWidth={72}
      breakpoint="xl"
      trigger={null} // We rely on a custom trigger or standard collapse logic, but standard styling is fine.
      className="fixed left-0 top-0 h-screen z-50 overflow-hidden shadow-xl"
      theme="dark"
      style={{ backgroundColor: '#0f172a' }} // Slate 900
    >
      {/* Brand Header */}
      <div 
        className="h-16 flex items-center justify-center cursor-pointer transition-all duration-300 border-b border-white/5"
        onClick={() => navigate('/dashboard')}
      >
        {sidebarCollapsed ? (
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Typography.Text className="text-white font-bold text-lg leading-none">C</Typography.Text>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-6 w-full">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <Typography.Text className="text-white font-bold text-lg leading-none">C</Typography.Text>
            </div>
            <Typography.Text className="text-white font-bold text-xl tracking-tight m-0 opacity-100 truncate">
              CourtOS
            </Typography.Text>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="h-[calc(100vh-140px)] overflow-y-auto overflow-x-hidden">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPath]}
          onClick={handleMenuClick}
          items={getMenuItems()}
          style={{ backgroundColor: 'transparent', borderRight: 0, padding: '16px 8px' }}
          className="custom-sidebar-menu"
        />
      </div>

      {/* Footer / User Profile */}
      <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/5 bg-[#0f172a]">
        <Dropdown
          menu={{
            items: [
              { key: 'profile', icon: <User size={16} />, label: <Link to="/staff/me">Profile</Link> },
              { type: 'divider' },
              { key: 'logout', icon: <LogOut size={16} />, label: 'Log out', danger: true, onClick: handleLogout },
            ]
          }}
          trigger={['click']}
          placement="topRight"
        >
          <div className="flex items-center cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors">
            <Avatar 
              src={user?.avatarUrl} 
              icon={!user?.avatarUrl && <User size={18} />} 
              className="bg-indigo-600 shrink-0" 
              size={sidebarCollapsed ? 32 : 36}
            />
            {!sidebarCollapsed && (
              <div className="ml-3 truncate">
                <p className="text-sm font-medium text-white mb-0 leading-tight truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-400 capitalize mb-0 truncate">{user?.role}</p>
              </div>
            )}
          </div>
        </Dropdown>
      </div>
    </Sider>
  );
};
