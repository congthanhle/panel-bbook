import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, message, Button, Space } from 'antd';
import dayjs from 'dayjs';
import { Customer } from '@/types/customer.types';
import { useCustomerStore } from '@/store/customerStore';
import { customersApi } from '@/features/customers/api';

interface Props {
  open: boolean;
  onClose: () => void;
  customer?: Customer; // If provided, we are editing, otherwise creating
  onOpenDetail?: (customer: Customer) => void; // Provided if we want to view a duplicate
}

export const CustomerFormModal = ({ open, onClose, customer, onOpenDetail }: Props) => {
  const [form] = Form.useForm();
  const { createCustomer, updateCustomer, isLoading } = useCustomerStore();
  const [duplicateError, setDuplicateError] = useState<{ message: string, phone: string } | null>(null);

  useEffect(() => {
    if (open) {
      if (customer) {
        form.setFieldsValue({
          ...customer,
          dob: customer.dateOfBirth ? dayjs(customer.dateOfBirth) : undefined,
        });
      } else {
        form.resetFields();
      }
      setDuplicateError(null);
    }
  }, [open, customer, form]);

  const handleDuplicateClick = async (phone: string) => {
    try {
      const existingCustomerResponse = await customersApi.lookupByPhone(phone);
      if (existingCustomerResponse && onOpenDetail) {
        // We received the LookupDTO, we need to map to Customer or open the drawer and have it handle the ID
        // The drawer requires a Customer type right now. Since lookupByPhone might not return all details,
        // we'll fetch full details first:
        const fullCustomer = await customersApi.getOne(existingCustomerResponse.id);
        onOpenDetail(fullCustomer);
      }
    } catch (err) {
      message.error("Could not find existing customer details");
    }
  };

  const handleSubmit = async () => {
    try {
      setDuplicateError(null);
      const values = await form.validateFields();
      
      // Map frontend form keys to backend DTO expected keys
      const formattedValues = {
        name: values.name,
        phone: values.phone,
        email: values.email,
        gender: values.gender,
        notes: values.notes,
        dateOfBirth: values.dob ? values.dob.format('YYYY-MM-DD') : undefined,
      };

      if (customer) {
        await updateCustomer(customer.id, formattedValues);
        message.success('Customer updated successfully');
      } else {
        await createCustomer(formattedValues);
        message.success('Customer created successfully');
      }
      onClose();
    } catch (error: any) {
      // Validation error or explicit throw from API (like 409 Conflict)
      if (error && error.message && error.message.includes('already registered')) {
         const currentPhone = form.getFieldValue('phone');
         setDuplicateError({
           message: "This phone is already registered",
           phone: currentPhone
         });
         
         // Highlight the field as error
         form.setFields([
           {
             name: 'phone',
             errors: ['This phone is already registered'],
           }
         ]);
      } else {
         console.error('Validation/Submission error:', error);
      }
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
        onChange={() => setDuplicateError(null)}
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
            help={
              duplicateError ? (
                <Space>
                  <span className="text-red-500">{duplicateError.message}</span>
                  <Button 
                    type="link" 
                    size="small" 
                    className="p-0 text-red-600 hover:text-red-700 underline"
                    onClick={() => handleDuplicateClick(duplicateError.phone)}
                  >
                    View existing customer
                  </Button>
                </Space>
              ) : undefined
            }
            validateStatus={duplicateError ? 'error' : ''}
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
