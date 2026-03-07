import { Drawer, Avatar, Tag, Button, Divider, Table, Modal, Select, message } from 'antd';
import { UserOutlined, ClockCircleOutlined, DeleteOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useState, useMemo } from 'react';
import { Shift, ShiftStatus } from '@/types/shift.types';
import { useStaffStore } from '@/store/staffStore';
import { useShiftStore } from '@/store/shiftStore';
import dayjs from 'dayjs';

interface ShiftDetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  shift: Shift | null;
  loading?: boolean;
}

export const ShiftDetailDrawer = ({ visible, onClose, shift, loading }: ShiftDetailDrawerProps) => {
  const { staffList } = useStaffStore();
  const { assignStaffToShift, removeStaffFromShift, updateShiftStatus } = useShiftStore();
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStaffToAdd, setSelectedStaffToAdd] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const handleUpdateStatus = async (status: ShiftStatus) => {
    if (!shift) return;
    try {
      setActionLoading(true);
      await updateShiftStatus(shift.id, status);
      message.success(`Shift marked as ${status}`);
    } catch (e) {
      message.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveStaff = async (staffId: string) => {
    if (!shift) return;
    Modal.confirm({
      title: 'Remove Staff from Shift',
      content: 'Are you sure you want to remove this staff member from this shift?',
      onOk: async () => {
        try {
          await removeStaffFromShift(shift.id, staffId);
          message.success('Staff removed successfully');
        } catch (e) {
          message.error('Failed to remove staff');
        }
      }
    });
  };

  const handleAssignStaff = async () => {
    if (!shift || selectedStaffToAdd.length === 0) return;
    try {
      setActionLoading(true);
      for (const staffId of selectedStaffToAdd) {
        await assignStaffToShift(shift.id, staffId);
      }
      message.success('Staff assigned successfully');
      setIsAssignModalOpen(false);
      setSelectedStaffToAdd([]);
    } catch (e) {
      message.error('Failed to piece together all assignments');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ongoing': return 'processing';
      case 'upcoming': return 'default';
      default: return 'default';
    }
  };

  // Staff not already in this shift
  const availableStaff = useMemo(() => {
    if (!shift) return [];
    return staffList.filter(s => !shift.assignedStaff.find(as => as.id === s.id));
  }, [staffList, shift]);


  const staffColumns = [
    {
      title: 'Staff Member',
      key: 'staff',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2">
          <Avatar src={record.avatar} icon={<UserOutlined />} size="small" />
          <span className="font-medium text-slate-800">{record.name}</span>
        </div>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (r: string) => <span className="text-slate-500 uppercase text-xs">{r}</span>
    },
    {
      title: 'Action',
      key: 'action',
      width: 60,
      render: (_: any, record: any) => (
        <Button 
           type="text" 
           danger 
           icon={<DeleteOutlined />} 
           onClick={() => handleRemoveStaff(record.id)}
           size="small"
        />
      )
    }
  ];

  return (
    <>
      <Drawer
        title="Shift Details"
        placement="right"
        width={500}
        onClose={onClose}
        open={visible}
        extra={
          shift?.status !== 'completed' && (
            <Button 
               type="text" 
               className="text-green-600 font-medium bg-green-50 border-green-200 hover:bg-green-100"
               icon={<CheckCircleOutlined />} 
               onClick={() => handleUpdateStatus('completed')}
               loading={actionLoading}
            >
              Mark Completed
            </Button>
          )
        }
      >
        {loading || !shift ? (
          <div className="opacity-50 text-center py-10">Loading...</div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Header / Basic Info */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
               <div className="flex justify-between items-start mb-2">
                 <h2 className="text-xl font-bold m-0 text-slate-800">{shift.name}</h2>
                 <Tag color={getStatusColor(shift.status)} className="m-0 text-sm">
                   {shift.status.toUpperCase()}
                 </Tag>
               </div>
               <div className="flex items-center gap-2 text-slate-600 font-medium mb-1">
                 <ClockCircleOutlined className="text-blue-500" />
                 {dayjs(shift.date).format('dddd, MMMM D, YYYY')}
               </div>
               <div className="text-slate-500 ml-6">
                  {shift.startTime} - {shift.endTime}
               </div>

               {shift.notes && (
                 <div className="mt-4 bg-white p-3 rounded text-slate-600 text-sm border border-slate-200 flex items-start gap-2">
                   <InfoCircleOutlined className="mt-0.5 text-blue-400" />
                   <div>{shift.notes}</div>
                 </div>
               )}
            </div>

            <Divider className="my-0" />

            {/* Assigned Staff Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold m-0 text-slate-800">Assigned Staff</h3>
                <Button size="small" type="primary" ghost onClick={() => setIsAssignModalOpen(true)}>
                  Assign Staff
                </Button>
              </div>

              <Table 
                 dataSource={shift.assignedStaff}
                 columns={staffColumns}
                 rowKey="id"
                 pagination={false}
                 size="small"
                 className="border border-slate-200 rounded-lg overflow-hidden"
                 locale={{ emptyText: 'No staff assigned to this shift yet.' }}
              />
            </section>
          </div>
        )}
      </Drawer>

      <Modal
        title="Assign Staff to Shift"
        open={isAssignModalOpen}
        onOk={handleAssignStaff}
        onCancel={() => { setIsAssignModalOpen(false); setSelectedStaffToAdd([]); }}
        confirmLoading={actionLoading}
        okButtonProps={{ disabled: selectedStaffToAdd.length === 0 }}
      >
        <div className="py-4">
          <div className="mb-2 text-slate-600">Select one or more available staff members to add to this shift:</div>
          <Select
            mode="multiple"
            className="w-full"
            placeholder="Search and select staff"
            value={selectedStaffToAdd}
            onChange={setSelectedStaffToAdd}
            optionFilterProp="label"
            options={availableStaff.map(s => ({
              label: `${s.name} (${s.role})`,
              value: s.id
            }))}
          />
        </div>
      </Modal>
    </>
  );
};
