import { useState } from 'react';
import { Tabs } from 'antd';
import { Building2, CalendarRange, Bell, UserCog } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';

// Lazy load tabs for better performance
import VenueInfoTab from './tabs/VenueInfoTab';
import BookingRulesTab from './tabs/BookingRulesTab';
import NotificationsTab from './tabs/NotificationsTab';
import AccountTab from './tabs/AccountTab';

const Settings = () => {
  const [activeKey, setActiveKey] = useState('venue');

  const items = [
    {
      key: 'venue',
      label: (
        <span className="flex items-center gap-2 px-2">
          <Building2 size={16} />
          Venue Info
        </span>
      ),
      children: <VenueInfoTab />,
    },
    {
      key: 'booking',
      label: (
        <span className="flex items-center gap-2 px-2">
          <CalendarRange size={16} />
          Booking Rules
        </span>
      ),
      children: <BookingRulesTab />,
    },
    {
      key: 'notifications',
      label: (
        <span className="flex items-center gap-2 px-2">
          <Bell size={16} />
          Notifications
        </span>
      ),
      children: <NotificationsTab />,
    },
    {
      key: 'account',
      label: (
        <span className="flex items-center gap-2 px-2">
          <UserCog size={16} />
          Account
        </span>
      ),
      children: <AccountTab />,
    },
  ];

  return (
    <PageWrapper 
      title="Settings" 
      subtitle="Manage your venue configuration, booking rules, and account preferences."
    >
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-2">
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={items}
          className="px-6 py-4"
          size="large"
          tabBarStyle={{ marginBottom: 24 }}
        />
      </div>
    </PageWrapper>
  );
};

export default Settings;
