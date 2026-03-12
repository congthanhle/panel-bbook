import { Drawer, Avatar, Tag, Button, Divider, Descriptions, Skeleton } from 'antd';
import { UserOutlined, EditOutlined, PhoneOutlined, MailOutlined, HomeOutlined, IdcardOutlined, BankOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import { Staff } from '@/types/staff.types';
import { useAuth } from '@/hooks/useAuth';
import dayjs from 'dayjs';

interface StaffDetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  staff: Staff | null;
  onEdit?: () => void;
  loading?: boolean;
}

export const StaffDetailDrawer = ({ visible, onClose, staff, onEdit, loading }: StaffDetailDrawerProps) => {
  const { user } = useAuth();
  
  if (!staff && !loading) return null;

  const isAdmin = user?.role === 'admin';

  return (
    <Drawer
      title="Staff Profile"
      placement="right"
      width={480}
      onClose={onClose}
      open={visible}
      extra={
        onEdit && (
          <Button type="primary" icon={<EditOutlined />} onClick={onEdit}>
            Edit
          </Button>
        )
      }
    >
      {loading || !staff ? (
        <Skeleton avatar paragraph={{ rows: 8 }} active />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex items-center gap-4">
            <Avatar 
              size={80} 
              src={staff.avatarUrl} 
              icon={<UserOutlined />} 
              className="border-2 border-slate-100"
            />
            <div className="flex flex-col">
              <h2 className="text-xl font-bold m-0 leading-tight">{staff.name}</h2>
              <div className="text-slate-500 mb-2">{staff.role.toUpperCase()}</div>
              <div>
                <Tag color={staff.isActive ? 'success' : 'default'} className="m-0">
                  {staff.isActive ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
                {isAdmin && staff.salaryType && (
                  <Tag className="ml-2 border-slate-300 text-slate-600 bg-slate-50">
                    {staff.salaryType === 'monthly' ? 'FT' : 'PT'}
                  </Tag>
                )}
              </div>
            </div>
          </div>

          <Divider className="my-0" />

          {/* Contact Information */}
          <section>
            <h3 className="text-base font-semibold mb-4 text-slate-800">Contact Information</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-slate-600">
                <PhoneOutlined className="text-slate-400" />
                <span>{staff.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <MailOutlined className="text-slate-400" />
                <a href={`mailto:${staff.email}`} className="text-blue-600 hover:underline">{staff.email}</a>
              </div>
              <div className="flex items-start gap-3 text-slate-600">
                <HomeOutlined className="text-slate-400 mt-1" />
                <span>{staff.address}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <IdcardOutlined className="text-slate-400" />
                <span>{staff.idCardNumber}</span>
              </div>
            </div>
          </section>

          <Divider className="my-0" />

          {/* Employment Details */}
          <section>
            <h3 className="text-base font-semibold mb-4 text-slate-800">Employment Details</h3>
            <Descriptions column={1} size="small" labelStyle={{ color: '#64748b', width: '120px' }}>
              <Descriptions.Item label="Hire Date">
                {dayjs(staff.hireDate).format('MMMM D, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                {staff.role === 'admin' ? 'Administrator' : 'Staff Member'}
              </Descriptions.Item>
              
              {isAdmin && (
                <>
                  {staff.salary !== undefined && staff.salary !== null && (
                    <Descriptions.Item label="Salary">
                      <span className="font-medium flex items-center gap-1">
                        <MoneyCollectOutlined className="text-green-600" />
                        ${staff.salary.toLocaleString()} <span className="text-slate-400 font-normal ml-1">/{staff.salaryType === 'monthly' ? 'mo' : 'hr'}</span>
                      </span>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Notes">
                    {staff.notes || <span className="text-slate-400 italic">No notes provided</span>}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </section>

          <Divider className="my-0" />

          {/* Bank Information (Admin Only or Self) */}
          {(isAdmin || user?.id === staff.userId) && (staff.bankName || staff.bankAccountNumber) && (
            <section>
              <h3 className="text-base font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <BankOutlined /> Bank Information
              </h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
                  <div className="text-slate-500">Bank Name</div>
                  <div className="font-medium text-slate-800">{staff.bankName}</div>
                  
                  <div className="text-slate-500">Account Name</div>
                  <div className="font-medium text-slate-800 uppercase">{staff.bankAccountName}</div>
                  
                  <div className="text-slate-500">Account No.</div>
                  <div className="font-medium tracking-wide text-slate-800">{staff.bankAccountNumber}</div>
                </div>
              </div>
            </section>
          )}

        </div>
      )}
    </Drawer>
  );
};
