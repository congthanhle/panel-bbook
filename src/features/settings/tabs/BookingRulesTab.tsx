import { useState, useEffect } from 'react';
import { Form, Card, Button, InputNumber, Switch, Select, Divider, Alert, Typography, message } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { settingsApi } from '../api';

const { Text } = Typography;
const { Option } = Select;

const BookingRulesTab = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await settingsApi.getAll();
        form.setFieldsValue({
          minAdvanceHours: data.bookingRules?.minAdvanceHours ?? 2,
          maxAdvanceDays: data.bookingRules?.maxAdvanceDays ?? 30,
          cancellationHours: data.bookingRules?.cancellationHours ?? 24,
          autoLockFutureMonths: data.bookingRules?.autoLockFutureMonths ?? true,
          defaultSlotDuration: data.bookingRules?.defaultSlotDuration ?? 60,
        });
      } catch (err) {
        message.error('Failed to load booking rules');
      }
    };
    loadData();
  }, [form]);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      await settingsApi.updateBookingRules(values);
      message.success('Booking Rules saved successfully');
    } catch {
      message.error('Failed to save booking rules');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <Alert 
        message="Changes to booking rules only apply to future bookings."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        className="mb-6 rounded-lg border-indigo-200 bg-indigo-50 text-indigo-800"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card title="Booking Limitations" className="shadow-sm border-slate-200 h-full" bordered={false}>
              <Form.Item 
                label={<span className="font-medium text-slate-700">Minimum Advance Booking</span>}
                name="minAdvanceHours"
                extra="How many hours in advance an online booking must be made."
              >
                <InputNumber min={0} max={72} addonAfter="hours" className="w-full" size="large" />
              </Form.Item>

              <Divider className="my-4" />

              <Form.Item 
                label={<span className="font-medium text-slate-700">Maximum Advance Booking</span>}
                name="maxAdvanceDays"
                extra="How far into the future customers can book."
              >
                <InputNumber min={1} max={365} addonAfter="days" className="w-full" size="large" />
              </Form.Item>

              <Divider className="my-4" />

              <Form.Item 
                label={<span className="font-medium text-slate-700">Default Slot Duration</span>}
                name="defaultSlotDuration"
                extra="Granularity of bookings on the frontend."
              >
                <Select size="large">
                  <Option value={30}>30 Minutes</Option>
                  <Option value={60}>60 Minutes (1 Hour)</Option>
                  <Option value={90}>90 Minutes (1.5 Hours)</Option>
                  <Option value={120}>120 Minutes (2 Hours)</Option>
                </Select>
              </Form.Item>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Cancellation & Moderation" className="shadow-sm border-slate-200 h-full" bordered={false}>
              <Form.Item 
                label={<span className="font-medium text-slate-700">Free Cancellation Window</span>}
                name="cancellationHours"
                extra="Hours before booking starts when customers can still cancel for a refund."
              >
                <InputNumber min={0} max={168} addonAfter="hours" className="w-full" size="large" />
              </Form.Item>

              <Divider className="my-4" />

              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-slate-700 mb-1">Auto-lock Future Months</div>
                  <Text className="text-slate-500 text-sm block max-w-[280px]">
                    Automatically lock the calendar beyond the maximum advance booking limit to prevent glitches or manual requests.
                  </Text>
                </div>
                <Form.Item name="autoLockFutureMonths" valuePropName="checked" className="mb-0">
                  <Switch />
                </Form.Item>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button size="large" disabled={loading}>Discard Changes</Button>
          <Button type="primary" htmlType="submit" size="large" loading={loading}>
            Save Booking Rules
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default BookingRulesTab;
