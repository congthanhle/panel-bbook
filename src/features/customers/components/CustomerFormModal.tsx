import { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import { Customer } from '@/types/customer.types';
import { useCustomerStore } from '@/store/customerStore';

interface Props {
  open: boolean;
  onClose: () => void;
  customer?: Customer; // If provided, we are editing, otherwise creating
}

export const CustomerFormModal = ({ open, onClose, customer }: Props) => {
  const [form] = Form.useForm();
  const { createCustomer, updateCustomer, isLoading } = useCustomerStore();

  useEffect(() => {
    if (open) {
      if (customer) {
        form.setFieldsValue({
          ...customer,
          dob: customer.dob ? dayjs(customer.dob) : undefined,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, customer, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : undefined,
      };

      if (customer) {
        await updateCustomer(customer.id, formattedValues);
        message.success('Customer updated successfully');
      } else {
        await createCustomer(formattedValues);
        message.success('Customer created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Validation/Submission error:', error);
    }
  };

  return (
    <Modal
      title={customer ? `Edit Customer: ${customer.name}` : 'Add New Customer'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      width={600}
      okText={customer ? 'Save Changes' : 'Create Customer'}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        initialValues={{ membershipTier: 'regular' }}
      >
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input placeholder="John Doe" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: 'Phone is required' }]}
          >
            <Input placeholder="+1234567890" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Valid email is required' }]}
          >
            <Input placeholder="john@example.com" />
          </Form.Item>

          <Form.Item name="gender" label="Gender">
            <Select placeholder="Select gender">
              <Select.Option value="male">Male</Select.Option>
              <Select.Option value="female">Female</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="dob" label="Date of Birth">
             <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item name="membershipTier" label="Membership Tier">
            <Select>
              <Select.Option value="regular">Regular</Select.Option>
              <Select.Option value="silver">Silver</Select.Option>
              <Select.Option value="gold">Gold</Select.Option>
              <Select.Option value="vip">VIP</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3} placeholder="Customer preferences, sizing, or notes..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
