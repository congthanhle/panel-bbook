import React, { useEffect, useState } from 'react';
import { Drawer, Table, Button, Form, Select, TimePicker, InputNumber, Popconfirm, Tag, DatePicker } from 'antd';
import { Plus, Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Court, PriceRule } from '@/types/court.types';
import { useCourtStore } from '@/store/courtStore';
import dayjs from 'dayjs';

const { Option } = Select;

interface PricingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  court: Court | null;
}

export const PricingDrawer: React.FC<PricingDrawerProps> = ({ isOpen, onClose, court }) => {
  const fetchPriceRules = useCourtStore(state => state.fetchPriceRules);
  const addRule = useCourtStore(state => state.addRule);
  const deleteRule = useCourtStore(state => state.deleteRule);
  const pricingRules = useCourtStore(state => state.pricingRules);
  const isPricingLoading = useCourtStore(state => state.isPricingLoading);

  const [form] = Form.useForm();
  const [isAdding, setIsAdding] = useState(false);


  useEffect(() => {
    if (isOpen && court) {
      fetchPriceRules(court.id);
      setIsAdding(false);
      form.resetFields();
    }
  }, [isOpen, court, fetchPriceRules, form]);

  const currentRules = court ? (pricingRules[court.id] || []) : [];

  const handleAddSubmit = async (values: any) => {
    if (!court) return;
    try {
      const payload = {
        dayType: values.dayType,
        timeStart: values.timeRange[0].format('HH:mm'),
        timeEnd: values.timeRange[1].format('HH:mm'),
        price: values.price,
        specificDate: values.dayType === 'specific_date' ? values.specificDate.format('YYYY-MM-DD') : undefined,
      };
      
      await addRule(court.id, payload);
      setIsAdding(false);
      form.resetFields();
    } catch (error) {
      // Store handles toast
    }
  };

  const handleDelete = async (id: string) => {
    if (!court) return;
    try {
      await deleteRule(id, court.id);
    } catch (error) {
      // Store handles toast
    }
  };

  // Format currency
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const columns = [
    {
      title: 'Day Type',
      dataIndex: 'dayType',
      key: 'dayType',
      render: (text: string, record: PriceRule) => {
        const colors: Record<string, string> = {
          weekday: 'blue',
          weekend: 'orange',
          holiday: 'red',
          specific_date: 'purple'
        };
        const labels: Record<string, string> = {
          weekday: 'Weekday',
          weekend: 'Weekend',
          holiday: 'Holiday',
          specific_date: record.specificDate ? `Date: ${dayjs(record.specificDate).format('MMM D, YYYY')}` : 'Specific Date'
        };
        return <Tag color={colors[text]}>{labels[text]}</Tag>;
      }
    },
    {
      title: 'Time Range',
      key: 'time',
      render: (_: any, record: PriceRule) => (
         <div className="flex items-center gap-1.5 text-slate-600">
            <Clock size={14} className="text-slate-400" />
            <span className="font-mono text-xs">{record.timeStart} - {record.timeEnd}</span>
         </div>
      )
    },
    {
      title: 'Price / Hour',
      dataIndex: 'price',
      key: 'price',
      render: (val: number) => <span className="font-semibold text-emerald-600">{formatVND(val)}</span>
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_: any, record: PriceRule) => (
         <Popconfirm
           title="Delete this rule?"
           onConfirm={() => handleDelete(record.id)}
           okText="Yes"
           cancelText="No"
         >
            <Button type="text" danger icon={<Trash2 size={16} />} size="small" />
         </Popconfirm>
      )
    }
  ];

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
           <span className="font-semibold">{court?.name}</span>
           <span className="text-slate-400 font-normal">|</span>
           <span className="text-slate-600 font-normal text-base">Pricing Rules</span>
        </div>
      }
      width={600}
      onClose={onClose}
      open={isOpen}
      destroyOnHidden
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-800">
           <CalendarIcon className="mt-0.5 shrink-0" size={18} />
           <div className="text-sm leading-relaxed text-blue-700/90">
             Pricing rules determine the cost of bookings. Rules are evaluated in order of specificity: 
             <strong> Specific Date &gt; Holiday &gt; Weekend &gt; Weekday</strong>. Empty time slots will not be bookable.
           </div>
        </div>

        {/* Add New Rule Form */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
           <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
             <h4 className="font-medium text-slate-700 m-0">Pricing Schedule</h4>
             <Button 
               type="primary" 
               icon={<Plus size={16} />} 
               size="small"
               onClick={() => setIsAdding(!isAdding)}
             >
                {isAdding ? 'Cancel' : 'Add Rule'}
             </Button>
           </div>
           
           {isAdding && (
             <div className="p-4 bg-white border-b border-slate-100 animate-in slide-in-from-top-4 duration-200">
               <Form 
                 form={form} 
                 layout="vertical" 
                 onFinish={handleAddSubmit}
                 initialValues={{ dayType: 'weekday' }}
               >
                 <div className="grid grid-cols-2 gap-4">
                   <Form.Item name="dayType" label="Applies To" rules={[{ required: true }]}>
                      <Select>
                        <Option value="weekday">Weekdays (Mon-Fri)</Option>
                        <Option value="weekend">Weekends (Sat-Sun)</Option>
                        <Option value="holiday">Public Holidays</Option>
                        <Option value="specific_date">Specific Date Override</Option>
                      </Select>
                   </Form.Item>

                   <Form.Item 
                      noStyle 
                      shouldUpdate={(prev, curr) => prev.dayType !== curr.dayType}
                   >
                     {({ getFieldValue }) => 
                       getFieldValue('dayType') === 'specific_date' ? (
                          <Form.Item name="specificDate" label="Select Date" rules={[{ required: true }]}>
                             <DatePicker className="w-full" />
                          </Form.Item>
                       ) : <div />
                     }
                   </Form.Item>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="timeRange" label="Time Range" rules={[{ required: true }]}>
                       <TimePicker.RangePicker format="HH:mm" className="w-full" minuteStep={30} />
                    </Form.Item>
                    <Form.Item name="price" label="Price (VND)" rules={[{ required: true }]}>
                       <InputNumber 
                          className="w-full" 
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value!.replace(/\$\s?|(\.*)/g, '').replace(/,/g, '') as any}
                          step={10000}
                          min={0}
                          addonAfter="đ"
                       />
                    </Form.Item>
                 </div>

                 <div className="flex justify-end pt-2">
                    <Button type="primary" htmlType="submit" className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700">
                      Save Rule
                    </Button>
                 </div>
               </Form>
             </div>
           )}

           <Table 
             dataSource={currentRules} 
             columns={columns} 
             rowKey="id"
             pagination={false}
             loading={isPricingLoading}
             size="middle"
             className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:font-medium"
           />
        </div>
      </div>
    </Drawer>
  );
};
