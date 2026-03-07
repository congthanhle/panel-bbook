import { useState } from 'react';
import { Form, Input, Button, Card, Upload, Row, Col, Typography, TimePicker, message } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const VenueInfoTab = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleFinish = async (_values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      message.success('Venue Information saved successfully');
    } catch {
      message.error('Failed to save venue info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          name: 'CourtOS Arena',
          email: 'hello@courtos.com',
          phone: '+1 (555) 123-4567',
          address: '123 Smash Avenue, Badminton City',
          weekdayOpen: dayjs('08:00', 'HH:mm'),
          weekdayClose: dayjs('22:00', 'HH:mm'),
          weekendOpen: dayjs('07:00', 'HH:mm'),
          weekendClose: dayjs('23:00', 'HH:mm'),
        }}
      >
        <Card title="Basic Information" className="mb-6 shadow-sm drop-shadow-sm border-slate-200" bordered={false}>
          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Form.Item label="Venue Name" name="name" rules={[{ required: true }]}>
                <Input placeholder="Enter venue name" size="large" />
              </Form.Item>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Contact Email" name="email" rules={[{ required: true, type: 'email' }]}>
                    <Input placeholder="contact@example.com" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Phone Number" name="phone">
                    <Input placeholder="+1 (555) 000-0000" size="large" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Address" name="address">
                <Input.TextArea rows={2} placeholder="Full address" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8} className="flex flex-col items-center justify-start pt-8">
              <Form.Item name="logo" valuePropName="fileList">
                <Upload
                  name="logo"
                  listType="picture-card"
                  className="venue-logo-uploader"
                  showUploadList={false}
                  action="/upload.do"
                >
                  <div className="flex flex-col items-center justify-center p-4">
                    <UploadOutlined className="text-2xl text-slate-400 mb-2" />
                    <div className="text-slate-500 font-medium">Upload Logo</div>
                  </div>
                </Upload>
              </Form.Item>
              <Text type="secondary" className="text-xs text-center">
                Recommended: 512x512px, PNG or JPG max 2MB
              </Text>
            </Col>
          </Row>
        </Card>

        <Card title="Operating Hours" className="mb-6 shadow-sm border-slate-200" bordered={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <Title level={5} className="mt-0 mb-4 text-slate-700">Weekdays (Mon - Fri)</Title>
              <div className="flex items-center gap-4">
                <Form.Item name="weekdayOpen" className="mb-0 flex-1">
                  <TimePicker format="HH:mm" size="large" className="w-full" placeholder="Opening Time" />
                </Form.Item>
                <span className="text-slate-400 font-medium">to</span>
                <Form.Item name="weekdayClose" className="mb-0 flex-1">
                  <TimePicker format="HH:mm" size="large" className="w-full" placeholder="Closing Time" />
                </Form.Item>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <Title level={5} className="mt-0 mb-4 text-slate-700">Weekends (Sat - Sun)</Title>
              <div className="flex items-center gap-4">
                <Form.Item name="weekendOpen" className="mb-0 flex-1">
                  <TimePicker format="HH:mm" size="large" className="w-full" placeholder="Opening Time" />
                </Form.Item>
                <span className="text-slate-400 font-medium">to</span>
                <Form.Item name="weekendClose" className="mb-0 flex-1">
                  <TimePicker format="HH:mm" size="large" className="w-full" placeholder="Closing Time" />
                </Form.Item>
              </div>
            </div>
          </div>
        </Card>

        <Card 
          title="Holiday & Closure Dates" 
          className="mb-6 shadow-sm border-slate-200" 
          bordered={false}
          extra={<Button type="dashed" icon={<PlusOutlined />}>Add Holiday</Button>}
        >
          <Form.List name="holidays">
            {(fields, { remove }) => (
              <div className="space-y-3">
                {fields.length === 0 && (
                  <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    No holiday dates configured. Venue will operate on standard hours everyday.
                  </div>
                )}
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="flex gap-4 items-start">
                    <Form.Item
                      {...restField}
                      name={[name, 'date']}
                      rules={[{ required: true, message: 'Missing date' }]}
                      className="mb-0"
                    >
                      <Input type="date" size="large" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'reason']}
                      rules={[{ required: true, message: 'Missing reason' }]}
                      className="mb-0 flex-1"
                    >
                      <Input placeholder="Reason (e.g. Christmas, Maintenance)" size="large" />
                    </Form.Item>
                    <Button type="text" danger onClick={() => remove(name)} icon={<DeleteOutlined />} className="mt-1" />
                  </div>
                ))}
              </div>
            )}
          </Form.List>
        </Card>

        <div className="flex justify-end gap-3 mt-8">
          <Button size="large" disabled={loading}>Discard Changes</Button>
          <Button type="primary" htmlType="submit" size="large" loading={loading}>
            Save Venue Info
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default VenueInfoTab;
