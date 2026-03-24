import { useState, useEffect } from 'react';
import { Form, Card, Switch, Input, Button, Divider, Alert, Tag, message } from 'antd';
import { Mail, MessageSquare } from 'lucide-react';
import { settingsApi } from '../api';

const { TextArea } = Input;

const NotificationsTab = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await settingsApi.getAll();
        const notif = data.notifications || {};
        const triggers = notif.triggers || {};
        
        form.setFieldsValue({
          emailEnabled: notif.emailEnabled ?? true,
          smsEnabled: notif.smsEnabled ?? false,
          triggerNewBooking: triggers.booking_created ?? true,
          triggerCancellation: triggers.booking_cancelled ?? true,
          triggerPayment: triggers.shift_assigned ?? true,
          tplNewBooking: notif.tplNewBooking ?? 'Hi {{CustomerName}}, your booking for {{CourtName}} on {{Date}} at {{Time}} is confirmed. ID: {{BookingId}}',
          tplCancellation: notif.tplCancellation ?? 'Hi {{CustomerName}}, your booking {{BookingId}} on {{Date}} at {{Time}} has been cancelled as requested.',
          tplPayment: notif.tplPayment ?? 'Hi {{CustomerName}}, we have received your payment for {{BookingId}}. Thank you!',
        });
      } catch (err) {
        message.error('Failed to load notification settings');
      }
    };
    loadData();
  }, [form]);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      await settingsApi.updateNotifications({
        emailEnabled: values.emailEnabled,
        smsEnabled: values.smsEnabled,
        triggers: {
          booking_created: values.triggerNewBooking,
          booking_cancelled: values.triggerCancellation,
          shift_assigned: values.triggerPayment,
        },
        tplNewBooking: values.tplNewBooking,
        tplCancellation: values.tplCancellation,
        tplPayment: values.tplPayment,
      });
      message.success('Notification preferences saved');
    } catch {
      message.error('Failed to save notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const templateVariables = ['{{CustomerName}}', '{{CourtName}}', '{{Date}}', '{{Time}}', '{{BookingId}}'];

  return (
    <div className="max-w-4xl">
      <Alert 
        message="Configure automated messages sent to customers upon specific events."
        type="info"
        className="mb-6 rounded-lg border-indigo-200 bg-indigo-50 text-indigo-800"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Card title="Channels" className="mb-6 shadow-sm border-slate-200" bordered={false}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="font-medium text-slate-800">Email Notifications</div>
                  <div className="text-sm text-slate-500">Send confirmations and reminders via email</div>
                </div>
              </div>
              <Form.Item name="emailEnabled" valuePropName="checked" className="mb-0">
                <Switch />
              </Form.Item>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <div className="font-medium text-slate-800">SMS Notifications</div>
                  <div className="text-sm text-slate-500">Send text messages (additional charges apply)</div>
                </div>
              </div>
              <Form.Item name="smsEnabled" valuePropName="checked" className="mb-0">
                <Switch />
              </Form.Item>
            </div>
          </div>
        </Card>

        <Card title="Triggers & Templates" className="mb-6 shadow-sm border-slate-200" bordered={false}>
          <div className="mb-6">
            <div className="text-sm text-slate-500 mb-2">Available Variables to insert:</div>
            <div className="flex flex-wrap gap-2">
              {templateVariables.map((val) => (
                <Tag key={val} className="text-xs font-mono bg-slate-50 text-slate-600 border-slate-200 text-[11px] cursor-pointer hover:bg-slate-100 transition-colors">
                  {val}
                </Tag>
              ))}
            </div>
          </div>

          <Divider />

          {/* New Booking */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <div className="font-medium text-base text-slate-800">New Booking Confirmation</div>
              <Form.Item name="triggerNewBooking" valuePropName="checked" className="mb-0">
                <Switch />
              </Form.Item>
            </div>
            <Form.Item name="tplNewBooking" help="Sent immediately when a booking is confirmed" className="mb-0">
              <TextArea rows={3} className="font-mono text-sm" />
            </Form.Item>
          </div>

          <Divider />

          {/* Cancellation */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <div className="font-medium text-base text-slate-800">Booking Cancellation</div>
              <Form.Item name="triggerCancellation" valuePropName="checked" className="mb-0">
                <Switch />
              </Form.Item>
            </div>
            <Form.Item name="tplCancellation" help="Sent when a booking is cancelled by customer or admin" className="mb-0">
              <TextArea rows={3} className="font-mono text-sm" />
            </Form.Item>
          </div>

          <Divider />

          {/* Payment */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <div className="font-medium text-base text-slate-800">Payment Received</div>
              <Form.Item name="triggerPayment" valuePropName="checked" className="mb-0">
                <Switch />
              </Form.Item>
            </div>
            <Form.Item name="tplPayment" help="Sent when a pending payment is successfully processed" className="mb-0">
              <TextArea rows={3} className="font-mono text-sm" />
            </Form.Item>
          </div>
        </Card>

        <div className="flex justify-end gap-3 mt-8">
          <Button size="large" disabled={loading}>Discard Changes</Button>
          <Button type="primary" htmlType="submit" size="large" loading={loading}>
            Save Notifications
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default NotificationsTab;
