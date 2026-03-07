import { Modal, Form, Input, DatePicker, TimePicker, Select, Alert, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useEffect, useState, useMemo } from 'react';
import { Shift } from '@/types/shift.types';
import { useStaffStore } from '@/store/staffStore';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface CreateShiftModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  initialData?: Shift | null;
  loading?: boolean;
  existingShifts: Shift[];
}

export const CreateShiftModal = ({ visible, onClose, onSubmit, initialData, loading, existingShifts }: CreateShiftModalProps) => {
  const [form] = Form.useForm();
  const { staffList, fetchStaff } = useStaffStore();
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    if (visible && initialData) {
      form.setFieldsValue({
        name: initialData.name,
        date: dayjs(initialData.date),
        timeRange: [dayjs(initialData.startTime, 'HH:mm'), dayjs(initialData.endTime, 'HH:mm')],
        notes: initialData.notes,
        staffIds: initialData.assignedStaff.map(s => s.id),
      });
    } else if (visible) {
      form.resetFields();
    }
    setConflictWarning(null);
  }, [visible, initialData, form]);

  // Conflict Detection Logic
  const handleValuesChange = (_: any, allValues: any) => {
    if (!allValues.date || !allValues.timeRange || !allValues.staffIds || allValues.staffIds.length === 0) {
      setConflictWarning(null);
      return;
    }

    const selectedDateStr = allValues.date.format('YYYY-MM-DD');
    const selStart = allValues.timeRange[0].format('HH:mm');
    const selEnd = allValues.timeRange[1].format('HH:mm');

    const conflicts: string[] = [];

    // Check all existing shifts on the same day (excluding the one being edited)
    const dayShifts = existingShifts.filter(s => s.date === selectedDateStr && s.id !== initialData?.id);
    
    allValues.staffIds.forEach((staffId: string) => {
      const isConflicting = dayShifts.some(shift => {
        // Does shift contain this staff member?
        const hasStaff = shift.assignedStaff.some(s => s.id === staffId);
        if (!hasStaff) return false;

        // Does the time overlap?
        // overlap condition: max(start1, start2) < min(end1, end2)
        const overlapStart = selStart > shift.startTime ? selStart : shift.startTime;
        const overlapEnd = selEnd < shift.endTime ? selEnd : shift.endTime;
        return overlapStart < overlapEnd;
      });

      if (isConflicting) {
        const staff = staffList.find(s => s.id === staffId);
        if (staff) conflicts.push(staff.name);
      }
    });

    if (conflicts.length > 0) {
      setConflictWarning(`Conflict detected: ${conflicts.join(', ')} already ${conflicts.length === 1 ? 'has' : 'have'} an overlapping shift.`);
    } else {
      setConflictWarning(null);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        date: values.date.format('YYYY-MM-DD'),
        startTime: values.timeRange[0].format('HH:mm'),
        endTime: values.timeRange[1].format('HH:mm'),
        notes: values.notes,
        staffIds: values.staffIds || [],
      };
      await onSubmit(payload);
    } catch (error) {
      // form validation error
    }
  };

  // Staff options specifically formatted to include avatars in dropdown list
  const staffOptions = useMemo(() => staffList.map(staff => ({
    label: (
      <div className="flex items-center gap-2">
         <Avatar size="small" src={staff.avatar} icon={<UserOutlined />} />
         <span>{staff.name}</span>
      </div>
    ),
    value: staff.id,
    name: staff.name // searchable
  })), [staffList]);

  return (
    <Modal
      title={initialData ? 'Edit Shift' : 'Create New Shift'}
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      width={600}
      okText={initialData ? 'Save Changes' : 'Create Shift'}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        onValuesChange={handleValuesChange}
      >
        <Form.Item 
          label="Shift Name" 
          name="name" 
          rules={[{ required: true, message: 'Shift Name is required' }]}
        >
          <Input placeholder="e.g., Morning Opening Shift" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item 
            label="Date" 
            name="date"
            rules={[{ required: true, message: 'Date is required' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item 
            label="Time (Start - End)" 
            name="timeRange"
            rules={[{ required: true, message: 'Time is required' }]}
          >
            <TimePicker.RangePicker className="w-full" format="HH:mm" />
          </Form.Item>
        </div>

        <Form.Item 
          label="Assign Staff" 
          name="staffIds"
        >
          <Select
            mode="multiple"
            placeholder="Select staff members"
            options={staffOptions}
            optionFilterProp="name"
            className="w-full"
            maxTagCount="responsive"
          />
        </Form.Item>

        {conflictWarning && (
          <Alert message={conflictWarning} type="warning" showIcon className="mb-4" />
        )}

        <Form.Item 
          label="Notes (Optional)" 
          name="notes" 
        >
          <Input.TextArea rows={3} placeholder="Add instructions or specific requirements..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
