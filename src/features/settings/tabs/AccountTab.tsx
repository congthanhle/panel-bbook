import { Form, Input, Button, Card, Switch, Table, Tag, Typography } from 'antd';
import { ShieldCheck, MonitorSmartphone, Smartphone } from 'lucide-react';

const { Title, Text } = Typography;

const sessionsData = [
  {
    key: '1',
    device: 'Windows PC - Chrome',
    location: 'New York, USA',
    ip: '192.168.1.5',
    recent: 'Active Now',
    icon: <MonitorSmartphone size={16} />,
    isCurrent: true,
  },
  {
    key: '2',
    device: 'iPhone 13 - Safari',
    location: 'New York, USA',
    ip: '172.24.1.92',
    recent: '2 hours ago',
    icon: <Smartphone size={16} />,
    isCurrent: false,
  },
];

const AccountTab = () => {
  const [form] = Form.useForm();

  const handlePasswordChange = (values: any) => {
    console.log('Password updated:', values);
  };

  const columns = [
    {
      title: 'Device',
      dataIndex: 'device',
      key: 'device',
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            {record.icon}
          </div>
          <div>
            <div className="font-medium text-slate-800 flex items-center gap-2">
              {text}
              {record.isCurrent && <Tag color="blue" className="ml-1 leading-normal border-0">Current</Tag>}
            </div>
            <div className="text-xs text-slate-500">{record.location} • {record.ip}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Last Active',
      dataIndex: 'recent',
      key: 'recent',
      width: 150,
      render: (text: string, record: any) => (
        <span className={record.isCurrent ? 'text-green-600 font-medium' : 'text-slate-500'}>
          {text}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <Button type="link" danger disabled={record.isCurrent} className="px-0">
          Revoke
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <Card title="Change Password" bordered={false} className="shadow-sm border-slate-200">
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePasswordChange}
          className="max-w-md"
        >
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[{ required: true, message: 'Please input your current password!' }]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 8, message: 'Password must be at least 8 characters long.' },
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Button type="primary" htmlType="submit">Update Password</Button>
        </Form>
      </Card>

      <Card title="Security Preferences" bordered={false} className="shadow-sm border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <Title level={5} className="!mt-0 !mb-1 text-slate-800">Two-Factor Authentication (2FA)</Title>
              <Text className="text-slate-500 text-sm max-w-sm block">
                Add an extra layer of security to your account by requiring an authenticator code.
              </Text>
            </div>
          </div>
          <Switch />
        </div>
      </Card>

      <Card 
        title="Active Sessions" 
        bordered={false} 
        className="shadow-sm border-slate-200"
        extra={<Button type="default" danger>Revoke All Others</Button>}
      >
        <Table 
          columns={columns} 
          dataSource={sessionsData} 
          pagination={false} 
          className="rounded-lg overflow-hidden border border-slate-100"
          rowClassName="last:border-b-0"
        />
      </Card>
    </div>
  );
};

export default AccountTab;
