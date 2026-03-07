import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, message } from 'antd';
import { Product } from '@/types/product.types';
import { useProductStore } from '@/store/productStore';

interface Props {
  open: boolean;
  onClose: () => void;
  product?: Product; // Edit mode if provided
}

export const ProductFormModal = ({ open, onClose, product }: Props) => {
  const [form] = Form.useForm();
  const isServiceValue = Form.useWatch('isService', form);
  
  const { createProduct, updateProduct, isLoading } = useProductStore();

  useEffect(() => {
    if (open) {
      if (product) {
        form.setFieldsValue(product);
      } else {
        form.resetFields();
        form.setFieldsValue({
          isActive: true,
          isService: false,
          category: 'other',
          price: 0,
          unit: 'item'
        });
      }
    }
  }, [open, product, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (product) {
        await updateProduct(product.id, values);
        message.success('Item updated successfully');
      } else {
        await createProduct(values);
        message.success('Item created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Validation/Submission error:', error);
    }
  };

  return (
    <Modal
      title={product ? `Edit Item: ${product.name}` : 'Add New Item'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      width={600}
      okText={product ? 'Save Changes' : 'Create Item'}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
          <div>
             <div className="font-medium text-slate-800">Is this item a Service?</div>
             <div className="text-xs text-slate-500">Services do not track stock inventory.</div>
          </div>
          <Form.Item name="isService" valuePropName="checked" className="m-0">
            <Switch />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Name is required' }]}
            className="col-span-2 sm:col-span-1"
          >
            <Input placeholder="Yonex Racket / Gatorade" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Category is required' }]}
          >
            <Select>
              <Select.Option value="equipment_rental">Equipment Rental</Select.Option>
              <Select.Option value="beverage">Beverage</Select.Option>
              <Select.Option value="snack">Snack</Select.Option>
              <Select.Option value="shuttle_cock">Shuttlecock</Select.Option>
              <Select.Option value="coaching">Coaching</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Price ($)"
            rules={[{ required: true, message: 'Price is required' }]}
          >
            <InputNumber className="w-full" min={0} step={0.5} prefix="$" />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Unit Type"
            rules={[{ required: true, message: 'Unit is required' }]}
          >
            <Input placeholder="tube, bottle, hour, session..." />
          </Form.Item>

          {!isServiceValue && (
            <Form.Item
              name="stock"
              label="Stock Inventory"
              rules={[{ required: true, message: 'Stock is required for products' }]}
            >
              <InputNumber className="w-full" min={0} />
            </Form.Item>
          )}

          <Form.Item name="isActive" valuePropName="checked" label="Status" className="flex items-center">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </div>

        <Form.Item name="imageUrl" label="Image URL">
          <Input placeholder="https://unsplash.com/photos/..." />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Brief description of the product or service..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
