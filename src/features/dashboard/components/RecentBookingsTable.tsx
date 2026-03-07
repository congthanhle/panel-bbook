import React from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { RecentBooking } from '@/types/dashboard.types';
import dayjs from 'dayjs';

interface RecentBookingsTableProps {
  data: RecentBooking[];
}

export const RecentBookingsTable: React.FC<RecentBookingsTableProps> = ({ data }) => {
  const columns: ColumnsType<RecentBooking> = [
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text) => <span className="font-medium text-slate-800">{text}</span>,
    },
    {
      title: 'Court',
      dataIndex: 'courtName',
      key: 'courtName',
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_, record) => (
        <span className="text-slate-500">
          {dayjs(record.date).format('MMM D, YYYY')} • {record.time}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'confirmed') color = 'blue';
        else if (status === 'completed') color = 'success';
        else if (status === 'cancelled') color = 'error';
        else if (status === 'pending') color = 'warning';
        return <Tag color={color} className="uppercase text-xs font-semibold">{status}</Tag>;
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (val) => (
        <span className="font-semibold text-slate-700">
          ${val.toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={data} 
      rowKey="id" 
      pagination={false}
      size="middle"
      className="overflow-x-auto"
    />
  );
};
