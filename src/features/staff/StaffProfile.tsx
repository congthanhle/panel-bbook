import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { useStaffStore } from '@/store/staffStore';
import { Button, message, Descriptions, Card, Avatar, Tag } from 'antd';
import { Edit2 } from 'lucide-react';
import { UserOutlined } from '@ant-design/icons';
import { StaffFormModal } from './components/StaffFormModal';

const StaffProfile = () => {
  const { user } = useAuth();
  const { currentStaffProfile, fetchCurrentProfile, updateStaff, isLoading } = useStaffStore();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    fetchCurrentProfile();
  }, [fetchCurrentProfile]);

  const handleUpdateProfile = async (values: any) => {
    try {
      if (currentStaffProfile?.id) {
        await updateStaff(currentStaffProfile.id, values);
        message.success('Profile updated successfully');
        setIsEditModalVisible(false);
      }
    } catch (error) {
      message.error('Failed to update profile');
    }
  };

  return (
    <PageWrapper 
      title="My Profile" 
      subtitle="View your shift schedule and details."
      action={
        <Button 
          type="primary" 
          icon={<Edit2 size={16} />} 
          onClick={() => setIsEditModalVisible(true)}
        >
          Edit Profile
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 shadow-sm border-slate-200">
          <div className="flex flex-col items-center p-4">
            <Avatar 
              size={120} 
              src={currentStaffProfile?.avatarUrl} 
              icon={<UserOutlined />} 
              className="mb-4"
            />
            <h2 className="text-xl font-bold text-slate-800">{currentStaffProfile?.name || user?.name}</h2>
            <p className="text-slate-500 mb-2">{currentStaffProfile?.email}</p>
            <Tag color={currentStaffProfile?.isActive ? 'success' : 'default'}>
              {currentStaffProfile?.isActive ? 'ACTIVE' : 'INACTIVE'}
            </Tag>
          </div>
        </Card>

        <Card title="Personal Information" className="col-span-1 md:col-span-2 shadow-sm border-slate-200">
          <Descriptions column={1} labelStyle={{ width: '150px' }}>
            <Descriptions.Item label="Role">
              <span className="capitalize">{currentStaffProfile?.role}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Phone Number">
              {currentStaffProfile?.phone || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {currentStaffProfile?.address || '-'}
            </Descriptions.Item>
            {currentStaffProfile?.hireDate && (
              <Descriptions.Item label="Hire Date">
                {currentStaffProfile.hireDate}
              </Descriptions.Item>
            )}
            {currentStaffProfile?.notes && (
              <Descriptions.Item label="Notes">
                {currentStaffProfile.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      </div>

      <StaffFormModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSubmit={handleUpdateProfile}
        initialData={currentStaffProfile}
        loading={isLoading}
      />
    </PageWrapper>
  );
};

export default StaffProfile;
