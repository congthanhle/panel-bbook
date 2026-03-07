import React from 'react';
import { Table, Avatar } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TopCustomer } from '@/types/dashboard.types';
import { User } from 'lucide-react';

interface TopCustomersTableProps {
  data: TopCustomer[];
}

export const TopCustomersTable: React.FC<TopCustomersTableProps> = ({ data }) => {
  const columns: ColumnsType<TopCustomer> = [
    {
      title: 'Rank',
      key: 'rank',
      width: 70,
      render: (_, __, index) => (
        <span className="text-slate-400 font-medium">#{index + 1}</span>
      ),
    },
    {
      title: 'Customer',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar 
            icon={<User size={16} />} 
            className="bg-indigo-100 text-indigo-600 flex items-center justify-center p-1"
          />
          <span className="font-medium text-slate-800">{record.name}</span>
        </div>
      ),
    },
    {
      title: 'Visits',
      dataIndex: 'visits',
      key: 'visits',
      align: 'center',
    },
    {
      title: 'Total Spend',
      dataIndex: 'totalSpend',
      key: 'totalSpend',
      align: 'right',
      render: (val) => (
        <span className="font-semibold text-emerald-600">
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
