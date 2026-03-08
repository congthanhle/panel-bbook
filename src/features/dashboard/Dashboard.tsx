import React, { useEffect, useState } from 'react';
import { Card, Select, Skeleton, Alert, Space } from 'antd';
import { Calendar, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { DashboardStats } from '@/types/dashboard.types';
import axios from 'axios';
import { PageWrapper } from '@/components/layout/PageWrapper';

// Components
import { StatsCard } from '@/components/common/StatsCard';
import { RevenueLineChart } from './components/RevenueLineChart';
import { BookingsByTypeChart } from './components/BookingsByTypeChart';
import { PeakHoursBarChart } from './components/PeakHoursBarChart';
import { CourtUtilizationChart } from './components/CourtUtilizationChart';
import { RecentBookingsTable } from './components/RecentBookingsTable';
import { TopCustomersTable } from './components/TopCustomersTable';

const API_URL = import.meta.env.VITE_API_URL || '';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('today');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${API_URL}/api/dashboard/stats`, {
          params: { range: dateRange }
        });
        setData(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, [dateRange]);

  if (loading) {
    return (
      <PageWrapper title="Dashboard">
        <Space direction="vertical" size="large" className="w-full">
          <Skeleton active paragraph={{ rows: 2 }} />
          <Skeleton active paragraph={{ rows: 5 }} />
        </Space>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="Dashboard">
        <Alert message="Error" description={error} type="error" showIcon />
      </PageWrapper>
    );
  }

  if (!data) return null;

  return (
    <PageWrapper
      title="Dashboard"
      subtitle={`Welcome back, ${user?.name}!`}
      action={
        isAdmin ? (
          <Select
            value={dateRange}
            onChange={setDateRange}
            className="w-40"
            options={[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'year', label: 'This Year' },
            ]}
          />
        ) : undefined
      }
    >
      <div className="space-y-6">

      {/* Row 1: Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          title="Today's Bookings"
          value={data.todayBookings}
          trend={data.todayBookingsTrend}
          prefix={<Calendar size={24} />}
          color="blue"
        />
        {isAdmin && (
          <>
            <StatsCard
              title="Today's Revenue"
              value={data.todayRevenue}
              trend={data.todayRevenueTrend}
              prefix={<DollarSign size={24} />}
              color="emerald"
              isCurrency
            />
            <StatsCard
              title="Monthly Revenue"
              value={data.monthlyRevenue}
              trend={data.monthlyRevenueTrend}
              prefix={<TrendingUp size={24} />}
              color="indigo"
              isCurrency
            />
            <StatsCard
              title="Court Utilization"
              value={data.courtUtilizationRate}
              trend={data.courtUtilizationTrend}
              prefix={<Activity size={24} />}
              color="amber"
              isPercentage
            />
          </>
        )}
      </div>

      {/* Admin specific content */}
      {isAdmin ? (
        <>
          {/* Row 2: Charts 60/40 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            <Card title="Revenue (Last 14 Days)" className="lg:col-span-8 shadow-sm">
              <RevenueLineChart data={data.revenueByDay} />
            </Card>
            <Card title="Bookings by Court Type" className="lg:col-span-4 shadow-sm">
              <BookingsByTypeChart data={data.bookingsByCourtType} />
            </Card>
          </div>

          {/* Row 3: Charts 50/50 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card title="Peak Booking Hours" className="shadow-sm">
              <PeakHoursBarChart data={data.peakHours} />
            </Card>
            <Card title="Court Utilization Rate" className="shadow-sm">
              <CourtUtilizationChart data={data.utilizationByCourt} />
            </Card>
          </div>

          {/* Row 4: Tables 60/40 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            <Card 
              title="Recent Bookings" 
              className="lg:col-span-8 shadow-sm"
              styles={{ body: { padding: 0 } }}
            >
              <div className="p-4 overflow-x-auto">
                <RecentBookingsTable data={data.recentBookings} />
              </div>
            </Card>
            <Card 
              title="Top Customers" 
              className="lg:col-span-4 shadow-sm"
              styles={{ body: { padding: 0 } }}
            >
              <div className="p-4 overflow-x-auto">
                 <TopCustomersTable data={data.topCustomers} />
              </div>
            </Card>
          </div>
        </>
      ) : (
        // Staff content
        <div className="mt-6">
          <Card title="Today's Schedule" className="shadow-sm">
            <Alert 
              message="Court Schedule view will be integrated here" 
              type="info" 
              showIcon 
              className="mb-4"
            />
            <RecentBookingsTable data={data.recentBookings.filter(b => b.date === new Date().toISOString().split('T')[0] || b.date.startsWith('2026') )} />
          </Card>
        </div>
      )}
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
