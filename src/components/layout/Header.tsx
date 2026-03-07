import { Layout, Badge, Button, Dropdown, MenuProps, Breadcrumb } from 'antd';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import dayjs from 'dayjs';

const { Header: AntHeader } = Layout;

export const Header = () => {
  const { toggleSidebar, sidebarCollapsed } = useUiStore();
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Generate breadcrumbs from path
  const pathSnippets = location.pathname.split('/').filter(i => i);
  const breadcrumbItems = [
    {
      title: <Link to="/dashboard">Home</Link>,
    },
    ...pathSnippets.map((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const isLast = index === pathSnippets.length - 1;
      const title = snippet.charAt(0).toUpperCase() + snippet.slice(1);
      
      return {
        title: isLast ? title : <Link to={url}>{title}</Link>,
      };
    }),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: <Link to="/staff/me">My Profile</Link>,
    },
    ...(isAdmin ? [{
      key: 'settings',
      icon: <SettingsIcon size={16} />,
      label: <Link to="/settings">Settings</Link>,
    }] : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: 'Sign out',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader className="fixed top-0 right-0 z-40 flex items-center justify-between px-6 bg-white border-b border-slate-200 transition-all duration-300 ease-in-out h-16" style={{ width: `calc(100% - ${sidebarCollapsed ? 72 : 240}px)` }}>
      <div className="flex items-center gap-6">
        <Button 
          type="text" 
          icon={<Menu size={20} className="text-slate-600" />} 
          onClick={toggleSidebar} 
          className="hover:bg-slate-100 -ml-4"
        />
        <Breadcrumb items={breadcrumbItems} className="hidden sm:block text-slate-500 font-medium" />
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {dayjs().format('dddd')}
          </span>
          <span className="text-sm font-medium text-slate-700 leading-none">
            {dayjs().format('MMM D, YYYY')}
          </span>
        </div>
        
        <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

        <Badge count={3} size="small" className="cursor-pointer">
          <Button type="text" shape="circle" icon={<Bell size={20} className="text-slate-600" />} className="hover:bg-slate-100" />
        </Badge>
        
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 px-2 py-1 -mr-2 rounded-full transition-colors">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200 overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-semibold text-sm">{user?.firstName?.charAt(0) || 'U'}</span>
              )}
            </div>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
};
