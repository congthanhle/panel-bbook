import { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Space, Tooltip, Avatar, Tabs } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { Users } from 'lucide-react';

import { PageWrapper } from '@/components/layout';
import { EmptyState } from '@/components/common/EmptyState';

import { useCustomerStore } from '@/store/customerStore';
import { Customer, MembershipTier } from '@/types/customer.types';
import { MembershipTierBadge } from './components/MembershipTierBadge';
import { CustomerFormModal } from './components/CustomerFormModal';
import { CustomerDetailDrawer } from './components/CustomerDetailDrawer';

const CustomersPage = () => {
  const { customers, isLoading, fetchCustomers, deleteCustomer } = useCustomerStore();
  
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<MembershipTier | 'all'>('all');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [viewingCustomer, setViewingCustomer] = useState<Customer | undefined>();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(id);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchText.toLowerCase()) || 
      c.phone.includes(searchText) ||
      (c.email && c.email.toLowerCase().includes(searchText.toLowerCase()));
    
    const matchesTier = activeTab === 'all' || c.membershipTier === activeTab;
    
    return matchesSearch && matchesTier;
  });

  const columns: ColumnsType<Customer> = [
    {
      title: 'Customer',
      key: 'name',
      render: (_, record) => (
        <Space className="cursor-pointer" onClick={() => handleView(record)}>
          <Avatar icon={<UserOutlined />} className="bg-indigo-100 text-indigo-600" />
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 hover:text-indigo-600 transition-colors">
              {record.name}
            </span>
            <span className="text-xs text-slate-400">{record.phone}</span>
          </div>
        </Space>
      ),
    },
    {
      title: 'Tier',
      dataIndex: 'membershipTier',
      key: 'tier',
      render: (tier: MembershipTier) => <MembershipTierBadge tier={tier} />,
    },
    {
      title: 'Visits',
      dataIndex: 'totalVisits',
      key: 'visits',
      sorter: (a, b) => a.totalVisits - b.totalVisits,
    },
    {
      title: 'Total Spend',
      dataIndex: 'totalSpend',
      key: 'spend',
      render: (val: number) => `$${val}`,
      sorter: (a, b) => a.totalSpend - b.totalSpend,
    },
    {
      title: 'Last Visit',
      dataIndex: 'lastVisit',
      key: 'lastVisit',
      render: (date) => date ? dayjs(date).format('MMM D, YYYY') : '-',
      sorter: (a, b) => new Date(a.lastVisit || 0).getTime() - new Date(b.lastVisit || 0).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Profile">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleView(record)}
              className="text-slate-400 hover:text-indigo-600"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Customers"
      subtitle="Manage your customer relationships and memberships"
      action={
        <Space>
          <Button icon={<DownloadOutlined />}>Export CSV</Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingCustomer(undefined);
              setIsFormOpen(true);
            }}
          >
            Add Customer
          </Button>
        </Space>
      }
    >
      <div className="space-y-6">
        <Card className="shadow-sm border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <Input
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search by name, phone, or email..."
              className="sm:w-80"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as MembershipTier | 'all')}
              items={[
                { key: 'all', label: 'All Customers' },
                { key: 'vip', label: 'VIP' },
                { key: 'gold', label: 'Gold' },
                { key: 'silver', label: 'Silver' },
                { key: 'regular', label: 'Regular' },
              ]}
              className="mb-0"
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredCustomers}
            rowKey="id"
            loading={isLoading}
            locale={{
              emptyText: (
                <EmptyState 
                  icon={<Users size={32} />}
                  title="No Customers Found"
                  description={searchText ? "No customers match your search criteria." : "You don't have any customers registered yet."}
                  actionText={!searchText ? "Add First Customer" : undefined}
                  onAction={() => {
                    setEditingCustomer(undefined);
                    setIsFormOpen(true);
                  }}
                />
              )
            }}
            pagination={{
              total: filteredCustomers.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} customers`
            }}
            scroll={{ x: 900 }}
          />
        </Card>

        <CustomerFormModal 
          open={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          customer={editingCustomer}
        />
        
        <CustomerDetailDrawer 
          open={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
          customer={viewingCustomer}
          onEdit={(c) => {
            setIsDrawerOpen(false);
            handleEdit(c);
          }}
        />
      </div>
    </PageWrapper>
  );
};

export default CustomersPage;
