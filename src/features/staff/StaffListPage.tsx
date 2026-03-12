import { useEffect, useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, Table, Tag, Button, Input, Select, Space, Avatar, Dropdown, MenuProps, Modal, message } from 'antd';
import { Plus, Search, MoreVertical, Edit2, Trash2, Contact } from 'lucide-react';
import { UserOutlined } from '@ant-design/icons';
import { EmptyState } from '@/components/common/EmptyState';
import { useStaffStore } from '@/store/staffStore';
import { StaffFormModal } from './components/StaffFormModal';
import { StaffDetailDrawer } from './components/StaffDetailDrawer';
import { Staff } from '@/types/staff.types';
import dayjs from 'dayjs';

const StaffListPage = () => {
  const { staffList, isLoading, fetchStaff, addStaff, updateStaff, deleteStaff } = useStaffStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  useEffect(() => {
    fetchStaff(); // Initial load
  }, [fetchStaff]);

  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => {
      const matchSearch = 
        staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.phone?.includes(searchTerm);
      const matchRole = roleFilter === 'all' || staff.role === roleFilter;
      const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? staff.isActive : !staff.isActive);
      return matchSearch && matchRole && matchStatus;
    });
  }, [staffList, searchTerm, roleFilter, statusFilter]);

  const handleAddStaff = () => {
    setSelectedStaff(null);
    setIsFormModalVisible(true);
  };

  const handleEditStaff = (staff: Staff, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedStaff(staff);
    setIsFormModalVisible(true);
  };

  const handleDeleteStaff = (staffId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    Modal.confirm({
      title: 'Are you sure you want to delete this staff member?',
      content: 'This action cannot be undone.',
      okText: 'Yes, delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteStaff(staffId);
          message.success('Staff member deleted successfully');
          setIsDetailDrawerVisible(false);
        } catch (error) {
          message.error('Failed to delete staff member');
        }
      }
    });
  };

  const handleViewProfile = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsDetailDrawerVisible(true);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (selectedStaff) {
        await updateStaff(selectedStaff.id, values);
        message.success('Staff updated successfully');
        if (isDetailDrawerVisible) {
          setSelectedStaff({ ...selectedStaff, ...values });
        }
      } else {
        await addStaff(values);
        message.success('Staff added successfully');
      }
      setIsFormModalVisible(false);
    } catch (error) {
       message.error('An error occurred while saving.');
       throw error;
    }
  };

  const getActionItems = (staff: Staff): MenuProps['items'] => [
    {
      key: 'edit',
      label: 'Edit Profile',
      icon: <Edit2 size={16} />,
      onClick: (e) => handleEditStaff(staff, e.domEvent as any),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <Trash2 size={16} className="text-red-500" />,
      danger: true,
      onClick: (e) => handleDeleteStaff(staff.id, e.domEvent as any),
    },
  ];

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_: any, record: Staff) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.avatarUrl} icon={<UserOutlined />} />
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800">{record.name}</span>
            <span className="text-xs text-slate-500">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={role === 'admin' ? 'purple' : 'blue'}>{role?.toUpperCase()}</Tag>,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: Staff) => <Tag color={record.isActive ? 'success' : 'default'}>{record.isActive ? 'ACTIVE' : 'INACTIVE'}</Tag>,
    },
    {
      title: 'Hire Date',
      dataIndex: 'hireDate',
      key: 'hireDate',
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'Monthly Salary',
      key: 'salary',
      render: (_: any, record: Staff) => {
        if (record.salary === undefined || record.salary === null) return <span className="text-slate-400">—</span>;
        return (
          <div className="flex flex-col">
            <span className="font-medium">${record.salary.toLocaleString()}</span>
            <span className="text-xs text-slate-500">{record.salaryType === 'monthly' ? '/ mo' : '/ hr'}</span>
          </div>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'right' as const,
      render: (_: any, record: Staff) => (
        <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']} placement="bottomRight">
          <Button type="text" onClick={(e) => e.stopPropagation()} icon={<MoreVertical size={18} className="text-slate-500" />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <PageWrapper 
      title="Staff Management"
      subtitle="Manage your team members and their information."
      action={
        <Button type="primary" size="large" icon={<Plus size={18} />} onClick={handleAddStaff}>
          Add Staff
        </Button>
      }
    >
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <Input
          placeholder="Search by name, email or phone..."
          prefix={<Search size={18} className="text-slate-400" />}
          className="w-full md:w-80"
          size="large"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <Space size="middle">
          <Select
            size="large"
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: 140 }}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'admin', label: 'Admin' },
              { value: 'staff', label: 'Staff' },
            ]}
          />
          <Select
            size="large"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </Space>
      </div>

      <Card className="shadow-sm overflow-hidden border-slate-200" bodyStyle={{ padding: 0 }}>
        <Table 
          columns={columns} 
          dataSource={filteredStaff} 
          rowKey="id" 
          loading={isLoading}
          locale={{
            emptyText: (
              <EmptyState 
                icon={<Contact size={32} />}
                title="No Staff Found"
                description={searchTerm ? "No staff members match your search criteria." : "You haven't added any staff members yet."}
                actionText={!searchTerm ? "Add Staff Member" : undefined}
                onAction={handleAddStaff}
              />
            )
          }}
          pagination={{ pageSize: 15 }}
          scroll={{ x: 1000 }}
          onRow={(record) => ({
            onClick: () => handleViewProfile(record),
            className: 'cursor-pointer hover:bg-slate-50 transition-colors'
          })}
        />
      </Card>

      <StaffFormModal
        key={selectedStaff?.id || 'new'}
        visible={isFormModalVisible}
        onClose={() => setIsFormModalVisible(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedStaff}
        loading={isLoading}
      />

      <StaffDetailDrawer
        visible={isDetailDrawerVisible}
        onClose={() => setIsDetailDrawerVisible(false)}
        staff={selectedStaff}
        onEdit={() => handleEditStaff(selectedStaff as Staff)}
      />
    </PageWrapper>
  );
};

export default StaffListPage;
