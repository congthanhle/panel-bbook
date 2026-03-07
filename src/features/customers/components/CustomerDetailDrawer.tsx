import { Drawer, Avatar, Tabs, Table, Descriptions, Button, message } from 'antd';
import { UserOutlined, EditOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Customer } from '@/types/customer.types';
import { MembershipTierBadge } from './MembershipTierBadge';

interface Props {
  open: boolean;
  onClose: () => void;
  customer?: Customer;
  onEdit: (customer: Customer) => void;
}

export const CustomerDetailDrawer = ({ open, onClose, customer, onEdit }: Props) => {
  if (!customer) return null;

  // Mock booking history
  const mockBookings = [
    { id: 'b_1', date: '2026-03-05', court: 'Court 1', duration: '2h', amount: 300, status: 'completed' },
    { id: 'b_2', date: '2026-03-01', court: 'Court 3', duration: '1h', amount: 150, status: 'completed' },
    { id: 'b_3', date: '2026-02-25', court: 'Court 2', duration: '2h', amount: 300, status: 'completed' },
  ];

  const bookingColumns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Court', dataIndex: 'court', key: 'court' },
    { title: 'Duration', dataIndex: 'duration', key: 'duration' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (val: number) => `$${val}` },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (val: string) => <span className="capitalize text-green-600">{val}</span>
    },
  ];

  return (
    <Drawer
      title={
        <div className="flex justify-between items-center w-full">
          <span>Customer Profile</span>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => onEdit(customer)}
          >
            Edit
          </Button>
        </div>
      }
      placement="right"
      width={600}
      onClose={onClose}
      open={open}
    >
      <div className="flex flex-col gap-6">
        {/* Header Profile Section */}
        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <Avatar size={80} icon={<UserOutlined />} className="bg-indigo-100 text-indigo-600" />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">{customer.name}</h2>
                <div className="text-slate-500 mt-1">{customer.phone}</div>
                <div className="text-slate-500">{customer.email}</div>
              </div>
              <MembershipTierBadge tier={customer.membershipTier} className="scale-110 origin-top-right" />
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Member since {dayjs(customer.createdAt).format('MMM D, YYYY')}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center">
            <span className="text-indigo-400 mb-1"><CalendarOutlined className="text-xl" /></span>
            <span className="text-2xl font-bold text-indigo-700">{customer.totalVisits}</span>
            <span className="text-xs text-indigo-600 font-medium">Total Visits</span>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center">
            <span className="text-emerald-400 mb-1"><DollarOutlined className="text-xl" /></span>
            <span className="text-2xl font-bold text-emerald-700">${customer.totalSpend}</span>
            <span className="text-xs text-emerald-600 font-medium">Total Spend</span>
          </div>
          <div className="p-4 rounded-lg bg-orange-50 border border-orange-100 flex flex-col items-center justify-center">
            <span className="text-orange-400 mb-1"><DollarOutlined className="text-xl" /></span>
            <span className="text-2xl font-bold text-orange-700">
              ${customer.totalVisits > 0 ? Math.round(customer.totalSpend / customer.totalVisits) : 0}
            </span>
            <span className="text-xs text-orange-600 font-medium">Avg / Visit</span>
          </div>
        </div>

        <Tabs defaultActiveKey="details">
          <Tabs.TabPane tab="Details & Notes" key="details">
            <Descriptions column={2} bordered size="small" className="mb-6">
              <Descriptions.Item label="Date of Birth">
                {customer.dob ? dayjs(customer.dob).format('MMM D, YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Gender" className="capitalize">
                {customer.gender || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Last Visit">
                {customer.lastVisit ? dayjs(customer.lastVisit).format('MMM D, YYYY') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Internal Notes</h3>
              <div className="p-3 bg-yellow-50 text-yellow-800 rounded border border-yellow-200 min-h-[80px]">
                {customer.notes || <span className="text-yellow-600/50 italic">No notes provided.</span>}
              </div>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Booking History" key="history">
            <Table
              dataSource={mockBookings}
              columns={bookingColumns}
              pagination={false}
              rowKey="id"
              size="small"
            />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </Drawer>
  );
};
