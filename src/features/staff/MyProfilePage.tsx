import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout';
import { useStaffStore } from '@/store/staffStore';
import { Card, Avatar, Tag, Divider, Descriptions, Button, Skeleton, Modal, Form, Input, message } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined, EditOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { StaffShiftView } from '../shifts/components/StaffShiftView';
import { useShiftStore } from '@/store/shiftStore';

const MyProfilePage = () => {
  const { currentStaffProfile, isLoading, fetchCurrentProfile, updateStaff } = useStaffStore();
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const { fetchMyShifts } = useShiftStore();

  useEffect(() => {
    // only fetch if we don't have it yet to prevent spamming /me
    if (!currentStaffProfile) {
      fetchCurrentProfile();
    }
    fetchMyShifts();
  }, [currentStaffProfile, fetchCurrentProfile, fetchMyShifts]);

  const handleEditClick = () => {
    if (currentStaffProfile) {
      form.setFieldsValue({
        phone: currentStaffProfile.phone,
        address: currentStaffProfile.address,
      });
      setIsEditModalVisible(true);
    }
  };

  const handleUpdateContact = async () => {
    try {
      const values = await form.validateFields();
      if (currentStaffProfile) {
        await updateStaff(currentStaffProfile.id, values);
        message.success('Contact information updated successfully');
        setIsEditModalVisible(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <PageWrapper 
      title="My Profile" 
      subtitle="View your personal information and schedule."
      action={
        <Button icon={<EditOutlined />} onClick={handleEditClick}>
          Edit Contact Info
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Identifying Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="shadow-sm border-slate-200" bodyStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px' }}>
            {isLoading || !currentStaffProfile ? (
              <Skeleton.Avatar active size={120} shape="circle" />
            ) : (
              <Avatar 
                size={120} 
                src={currentStaffProfile.avatarUrl} 
                icon={<UserOutlined />} 
                className="mb-4 border-4 border-white shadow-md bg-blue-100 text-blue-500"
              />
            )}
            
            {isLoading || !currentStaffProfile ? (
              <Skeleton active paragraph={{ rows: 2 }} className="w-full text-center mt-4" />
            ) : (
              <div className="text-center w-full">
                <h2 className="text-2xl font-bold text-slate-800 m-0 mb-1">{currentStaffProfile.name}</h2>
                <p className="text-slate-500 m-0 mb-4 flex items-center justify-center gap-1">
                  <MailOutlined /> {currentStaffProfile.email}
                </p>
                <div className="flex justify-center gap-2 mb-6">
                  <Tag color="blue" className="px-3 py-1 rounded-full text-sm">{currentStaffProfile.role.toUpperCase()}</Tag>
                  <Tag color={currentStaffProfile.isActive ? 'success' : 'default'} className="px-3 py-1 rounded-full text-sm">
                    {currentStaffProfile.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Tag>
                </div>
              </div>
            )}
            
            <Divider className="my-2" />
            
            <div className="w-full text-left mt-2">
              <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Contact Details</h4>
              {isLoading || !currentStaffProfile ? (
                 <Skeleton active paragraph={{ rows: 2 }} />
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <PhoneOutlined className="text-slate-400 mt-1" />
                    <div>
                      <div className="text-xs text-slate-500">Phone Number</div>
                      <div className="text-slate-800 font-medium">{currentStaffProfile.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <HomeOutlined className="text-slate-400 mt-1" />
                    <div>
                      <div className="text-xs text-slate-500">Living Address</div>
                      <div className="text-slate-800 font-medium">{currentStaffProfile.address}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Employment & Other details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card title="Employment Details" className="shadow-sm border-slate-200">
            {isLoading || !currentStaffProfile ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <Descriptions column={2} layout="vertical" className="w-full">
                <Descriptions.Item label={<span className="text-slate-500 font-medium">Employee ID</span>}>
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <SafetyCertificateOutlined className="text-blue-500" />
                    {currentStaffProfile.id}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="text-slate-500 font-medium">ID Card Number</span>}>
                  <div className="font-medium text-slate-800">{currentStaffProfile.idCardNumber}</div>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="text-slate-500 font-medium">Hire Date</span>}>
                  <div className="font-medium text-slate-800">
                    {dayjs(currentStaffProfile.hireDate).format('MMMM D, YYYY')}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="text-slate-500 font-medium">Account Status</span>}>
                  <Tag color="success">Verified</Tag>
                </Descriptions.Item>
              </Descriptions>
            )}
          </Card>

          <Card title="Bank Information" className="shadow-sm border-slate-200">
             {isLoading || !currentStaffProfile ? (
              <Skeleton active paragraph={{ rows: 2 }} />
            ) : (
              (currentStaffProfile.bankName || currentStaffProfile.bankAccountNumber) ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Bank Name</div>
                    <div className="font-semibold text-slate-800">{currentStaffProfile.bankName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Account Number</div>
                    <div className="font-semibold tracking-wider text-slate-800">{currentStaffProfile.bankAccountNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Account Name</div>
                    <div className="font-semibold text-slate-800 uppercase">{currentStaffProfile.bankAccountName}</div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 italic">No bank information available. Please contact HR.</div>
              )
            )}
          </Card>

          <Card title="Upcoming Shifts & Schedule" className="shadow-sm border-slate-200" bodyStyle={{ padding: '16px' }}>
             <StaffShiftView />
          </Card>
        </div>
      </div>

      <Modal
        title="Edit Contact Information"
        open={isEditModalVisible}
        onOk={handleUpdateContact}
        onCancel={() => setIsEditModalVisible(false)}
        confirmLoading={isLoading}
        okText="Save Changes"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item 
            label="Phone Number" 
            name="phone"
            rules={[{ required: true, message: 'Phone number is required' }]}
          >
            <Input placeholder="+1 234 567 890" />
          </Form.Item>
          
          <Form.Item 
            label="Living Address" 
            name="address"
            rules={[{ required: true, message: 'Address is required' }]}
          >
            <Input.TextArea rows={3} placeholder="Full address" />
          </Form.Item>
        </Form>
      </Modal>

    </PageWrapper>
  );
};

export default MyProfilePage;
