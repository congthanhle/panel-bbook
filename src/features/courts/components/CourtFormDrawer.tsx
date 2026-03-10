import React, { useEffect } from 'react';
import { Drawer, Form, Input, Select, Button } from 'antd';
import { Image as ImageIcon, Upload as UploadIcon } from 'lucide-react';
import { Court } from '@/types/court.types';
import { useCourtStore } from '@/store/courtStore';

const { TextArea } = Input;
const { Option } = Select;

interface CourtFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  court: Court | null; // null means create mode
}

export const CourtFormDrawer: React.FC<CourtFormDrawerProps> = ({ isOpen, onClose, court }) => {
  const [form] = Form.useForm();
  const createCourt = useCourtStore(state => state.create);
  const updateCourt = useCourtStore(state => state.update);
  const isLoading = useCourtStore(state => state.isLoading);

  useEffect(() => {
    if (isOpen) {
      if (court) {
        form.setFieldsValue({
          name: court.name,
          type: court.type,
          description: court.description,
          imageUrl: court.imageUrl,
          isActive: court.isActive,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ type: 'badminton' });
      }
    }
  }, [court, isOpen, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (court) {
        // Send all fields including isActive for update
        await updateCourt(court.id, values);
      } else {
        // Only send fields accepted by CreateCourtDto
        const { isActive, ...createPayload } = values;
        await createCourt(createPayload);
      }
      onClose();
    } catch (error) {
      // Store handles toast
    }
  };

  return (
    <Drawer
      title={court ? 'Edit Court Details' : 'Add New Court'}
      width={480}
      onClose={onClose}
      open={isOpen}
      destroyOnHidden
      footer={
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="primary" onClick={() => form.submit()} loading={isLoading}>
            {court ? 'Save Changes' : 'Create Court'}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="space-y-4"
        requiredMark={false}
      >
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 mb-2">Court Image</p>
          <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 hover:border-indigo-300 transition-colors">
            {court?.imageUrl ? (
               <div className="relative w-full h-32 rounded-lg overflow-hidden group">
                 <img src={court.imageUrl} alt="Court Preview" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button icon={<UploadIcon size={16}/>} type="text" className="text-white hover:text-white border-white/40">Change Image</Button>
                 </div>
               </div>
            ) : (
                <>
                  <ImageIcon size={32} className="text-slate-400 mb-3" />
                  <p className="text-sm font-medium text-slate-600 mb-1">Click to upload an image</p>
                  <p className="text-xs text-slate-400">JPG, PNG or WEBP (max. 5MB)</p>
                </>
            )}
            
            {/* Hidden actual upload implementation for frontend-design purposes */}
            <Form.Item name="imageUrl" hidden>
               <Input />
            </Form.Item>
          </div>
        </div>

        <Form.Item
          name="name"
          label={<span className="font-medium text-slate-700">Court Name</span>}
          rules={[{ required: true, message: 'Please enter a court name' }]}
        >
          <Input placeholder="e.g. Center Court, Court 1" size="large" className="rounded-lg" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="type"
            label={<span className="font-medium text-slate-700">Type</span>}
            rules={[{ required: true, message: 'Please select court type' }]}
          >
            <Select size="large" className="rounded-lg [&_.ant-select-selector]:rounded-lg">
              <Option value="badminton">Badminton</Option>
              <Option value="pickleball">Pickleball</Option>
              <Option value="tennis">Tennis</Option>
              <Option value="futsal">Futsal</Option>
            </Select>
          </Form.Item>

          {court && (
            <Form.Item
              name="isActive"
              label={<span className="font-medium text-slate-700">Status</span>}
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select size="large" className="rounded-lg [&_.ant-select-selector]:rounded-lg">
                <Option value={true}>Active</Option>
                <Option value={false}>Inactive</Option>
              </Select>
            </Form.Item>
          )}
        </div>

        <Form.Item
          name="description"
          label={<span className="font-medium text-slate-700">Description (Optional)</span>}
        >
          <TextArea 
            rows={4} 
            placeholder="Add details about court surface, lighting, location..." 
            className="rounded-lg resize-none"
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
