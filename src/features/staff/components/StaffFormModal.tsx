import { Modal, Form, Input, Select, DatePicker, Tabs, InputNumber, Avatar, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Staff } from '@/types/staff.types';
import dayjs from 'dayjs';

interface StaffFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  initialData?: Staff | null;
  loading?: boolean;
}

export const StaffFormModal = ({ visible, onClose, onSubmit, initialData, loading }: StaffFormModalProps) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');

  const avatarValue = Form.useWatch('avatar', form);

  useEffect(() => {
    if (visible && initialData) {
      form.setFieldsValue({
        ...initialData,
        hireDate: initialData.hireDate ? dayjs(initialData.hireDate) : undefined,
        status: initialData.isActive ? 'active' : 'inactive',
        avatar: initialData.avatarUrl,
        bankName: initialData.bankName,
        accountNumber: initialData.bankAccountNumber,
        accountName: initialData.bankAccountName,
      });
    } else if (visible) {
      form.resetFields();
      setActiveTab('1');
    }
  }, [visible, initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const payload = {
        name: values.name,
        // Only include email and password if we are creating new staff
        ...(!initialData && { email: values.email, password: 'Password@123' }),
        phone: values.phone,
        address: values.address,
        idCardNumber: values.idCardNumber,
        avatarUrl: values.avatar,
        salary: values.salary,
        salaryType: values.salaryType,
        hireDate: values.hireDate?.format('YYYY-MM-DD'),
        notes: values.notes,
        bankName: values.bankName,
        bankAccountNumber: values.accountNumber,
        bankAccountName: values.accountName,
      };
      
      await onSubmit(payload);
    } catch (error) {
      message.error('Please complete all required fields correctly.');
    }
  };

  const getAvatarUrl = () => {
    return avatarValue;
  };

  return (
    <Modal
      title={initialData ? 'Edit Staff Member' : 'Add New Staff'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      okText={initialData ? 'Update Staff' : 'Add Staff'}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: 'active', role: 'staff', salaryType: 'monthly' }}
        className="mt-4"
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          {
            key: '1',
            label: 'Personal Info',
            forceRender: true,
            children: (
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4">
                <div className="col-span-2 flex items-center gap-4 mb-2">
                  <Avatar size={64} icon={<UserOutlined />} src={getAvatarUrl()} />
                  <Form.Item name="avatar" className="mb-0 flex-1">
                    <Input placeholder="Avatar URL" />
                  </Form.Item>
                </div>

                <Form.Item 
                  label="Full Name" 
                  name="name" 
                  rules={[{ required: true, message: 'Name is required' }]}
                >
                  <Input placeholder="John Doe" />
                </Form.Item>

                <Form.Item 
                  label="Email" 
                  name="email" 
                  rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Invalid email' }
                  ]}
                >
                  <Input placeholder="john@example.com" />
                </Form.Item>

                <Form.Item 
                  label="Phone Number" 
                  name="phone" 
                  rules={[{ required: true, message: 'Phone is required' }]}
                >
                  <Input placeholder="+1234567890" />
                </Form.Item>

                <Form.Item 
                  label="ID Card Number" 
                  name="idCardNumber" 
                  rules={[{ required: true, message: 'ID Card is required' }]}
                >
                  <Input placeholder="0123456789" />
                </Form.Item>

                <Form.Item 
                  label="Address" 
                  name="address" 
                  className="col-span-2"
                  rules={[{ required: true, message: 'Address is required' }]}
                >
                  <Input.TextArea rows={2} placeholder="Full address" />
                </Form.Item>
              </div>
            )
          },
          {
            key: '2',
            label: 'Employment',
            forceRender: true,
            children: (
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4">
                <Form.Item 
                  label="Role" 
                  name="role" 
                  rules={[{ required: true, message: 'Role is required' }]}
                >
                  <Select>
                    <Select.Option value="admin">Admin</Select.Option>
                    <Select.Option value="staff">Staff</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item 
                  label="Status" 
                  name="status"
                  rules={[{ required: true, message: 'Status is required' }]}
                >
                  <Select>
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="inactive">Inactive</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item 
                  label="Hire Date" 
                  name="hireDate"
                  rules={[{ required: true, message: 'Hire date is required' }]}
                >
                  <DatePicker className="w-full" format="YYYY-MM-DD" />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item 
                    label="Salary Type" 
                    name="salaryType"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Select>
                      <Select.Option value="monthly">Monthly</Select.Option>
                      <Select.Option value="hourly">Hourly</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item 
                    label="Amount" 
                    name="salary"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <InputNumber className="w-full" formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value!.replace(/\$\s?|(,*)/g, '') as any} />
                  </Form.Item>
                </div>

                <Form.Item 
                  label="Notes" 
                  name="notes" 
                  className="col-span-2"
                >
                  <Input.TextArea rows={3} placeholder="Additional employment details..." />
                </Form.Item>
              </div>
            )
          },
          {
            key: '3',
            label: 'Bank Account',
            forceRender: true,
            children: (
              <div className="grid grid-cols-1 gap-y-4 pt-4">
                <Form.Item 
                  label="Bank Name" 
                  name="bankName"
                  rules={[{ required: true, message: 'Bank Name is required' }]}
                >
                  <Input placeholder="e.g. Chase Bank, Vietcombank" />
                </Form.Item>

                <Form.Item 
                  label="Account Name" 
                  name="accountName"
                  rules={[{ required: true, message: 'Account Name is required' }]}
                >
                  <Input placeholder="JOHN DOE" />
                </Form.Item>

                <Form.Item 
                  label="Account Number" 
                  name="accountNumber"
                  rules={[{ required: true, message: 'Account Number is required' }]}
                >
                  <Input placeholder="0123456789" />
                </Form.Item>
              </div>
            )
          }
        ]} />
      </Form>
    </Modal>
  );
};
