import { useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, Table, Tag, Button } from 'antd';
import { useStaffStore } from '@/store/staffStore';
import { Plus } from 'lucide-react';

const Staff = () => {
  const { staffList, isLoading, fetchStaff } = useStaffStore();

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_: any, record: any) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={role === 'admin' ? 'red' : 'green'}>{role.toUpperCase()}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={status === 'active' ? 'success' : 'default'}>{status.toUpperCase()}</Tag>,
    },
  ];

  return (
    <PageWrapper 
      title="Staff Management"
      action={<Button type="primary" icon={<Plus size={16} />}>Add Staff</Button>}
    >
      <Card className="shadow-sm overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={staffList} 
          rowKey="id" 
          loading={isLoading}
          pagination={false}
        />
      </Card>
    </PageWrapper>
  );
};

export default Staff;
