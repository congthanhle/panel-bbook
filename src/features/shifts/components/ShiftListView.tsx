import { Table, Tag, Avatar, Tooltip, Dropdown, Button, MenuProps } from 'antd';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { UserOutlined } from '@ant-design/icons';
import { Shift } from '@/types/shift.types';
import dayjs from 'dayjs';

interface ShiftListViewProps {
  shifts: Shift[];
  loading: boolean;
  onEdit: (shift: Shift) => void;
  onDelete: (id: string) => void;
  onView: (shift: Shift) => void;
}

export const ShiftListView = ({ shifts, loading, onEdit, onDelete, onView }: ShiftListViewProps) => {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ongoing': return 'processing';
      case 'upcoming': return 'default';
      default: return 'default';
    }
  };

  const getActionItems = (shift: Shift): MenuProps['items'] => [
    {
      key: 'edit',
      label: 'Edit Info',
      icon: <Edit2 size={16} />,
      onClick: (e) => { e.domEvent.stopPropagation(); onEdit(shift); },
    },
    {
      key: 'delete',
      label: 'Delete Shift',
      icon: <Trash2 size={16} className="text-red-500" />,
      danger: true,
      onClick: (e) => { e.domEvent.stopPropagation(); onDelete(shift.id); },
    },
  ];

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: Shift, b: Shift) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
      render: (text: string) => <span className="font-semibold text-slate-700 tracking-tight">{dayjs(text).format('MMM D, YYYY')}</span>,
    },
    {
      title: 'Shift Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Shift, b: Shift) => a.name.localeCompare(b.name),
      render: (text: string) => <span className="font-bold text-indigo-950">{text}</span>
    },
    {
      title: 'Time',
      key: 'time',
      render: (_: any, record: Shift) => (
        <span className="text-slate-500 font-medium tracking-wide text-sm bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
          {record.startTime} <span className="mx-0.5 text-slate-300">→</span> {record.endTime}
        </span>
      )
    },
    {
      title: 'Assigned Staff',
      key: 'staff',
      render: (_: any, record: Shift) => (
        <Avatar.Group maxCount={3} maxStyle={{ color: '#4f46e5', backgroundColor: '#e0e7ff', border: '2px solid white', fontWeight: 'bold' }}>
          {record.assignedStaff.map(staff => (
             <Tooltip key={staff.id} title={staff.name} placement="top">
               <Avatar src={staff.avatar} icon={<UserOutlined />} className="ring-2 ring-white shadow-sm hover:scale-110 hover:z-10 transition-transform duration-300 relative cursor-pointer" />
             </Tooltip>
          ))}
          {record.assignedStaff.length === 0 && <span className="text-slate-400 text-sm font-medium italic border border-dashed border-slate-200 px-2 py-0.5 rounded-full">Unassigned</span>}
        </Avatar.Group>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Upcoming', value: 'upcoming' },
        { text: 'Ongoing', value: 'ongoing' },
        { text: 'Completed', value: 'completed' },
      ],
      onFilter: (value: boolean | React.Key, record: Shift) => record.status === value,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} className="px-3 py-1 rounded-xl border-none font-bold tracking-wider text-[10px] shadow-sm m-0">
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      align: 'right' as const,
      render: (_: any, record: Shift) => (
        <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']} placement="bottomRight">
          <Button type="text" onClick={(e) => e.stopPropagation()} icon={<MoreVertical size={18} className="text-slate-500" />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden transition-all duration-500 custom-elegant-table shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <Table 
        columns={columns} 
        dataSource={shifts} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 12, className: 'px-4' }}
        onRow={(record) => ({
          onClick: () => onView(record),
          className: 'cursor-pointer hover:bg-indigo-50/40 transition-colors duration-300'
        })}
      />
      <style>{`
        .custom-elegant-table .ant-table-thead > tr > th {
          background: transparent !important;
          border-bottom: 2px solid #f1f5f9;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
          padding: 16px;
        }
        .custom-elegant-table .ant-table-tbody > tr > td {
          border-bottom: 1px dashed #e2e8f0;
          padding: 16px;
        }
        .custom-elegant-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none;
        }
        .custom-elegant-table .ant-table {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
};
