import { Calendar, Badge, Tooltip } from 'antd';
import type { Dayjs } from 'dayjs';
import { Shift } from '@/types/shift.types';

interface ShiftCalendarViewProps {
  shifts: Shift[];
  onDateClick: (date: Dayjs) => void;
  onPanelChange: (value: Dayjs, mode: string) => void;
}

export const ShiftCalendarView = ({ shifts, onDateClick, onPanelChange }: ShiftCalendarViewProps) => {

  const getShiftBadgeStatus = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ongoing': return 'processing';
      case 'upcoming': return 'default';
      default: return 'default';
    }
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = shifts.filter(s => s.date === value.format('YYYY-MM-DD'));
    
    // Sort visually by start time
    listData.sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
      <ul className="m-0 p-0 list-none overflow-hidden h-full">
        {listData.map((item) => (
           <li key={item.id} className="mb-1.5 px-1">
             <Tooltip title={`${item.name} (${item.assignedStaff.length} staff)`}>
               <div className="text-xs truncate bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-lg px-2 py-1 shadow-sm hover:shadow hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-300 ease-out cursor-pointer group">
                  <Badge 
                    status={getShiftBadgeStatus(item.status) as any} 
                    text={<span className="text-[11.5px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors tracking-tight">{item.startTime} {item.name}</span>} 
                  />
               </div>
             </Tooltip>
           </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-slate-200/70 transition-all duration-500 hover:shadow-md">
      <Calendar 
        cellRender={(date, info) => info.type === 'date' ? dateCellRender(date) : info.originNode}
        onSelect={(date, info) => {
          if (info.source === 'date') onDateClick(date);
        }}
        onPanelChange={onPanelChange}
        className="custom-elegant-calendar"
      />
      <style>{`
        .custom-elegant-calendar .ant-picker-calendar-date {
           border-radius: 12px;
           transition: all 0.3s ease;
        }
        .custom-elegant-calendar .ant-picker-calendar-date:hover {
           background: #f8fafc !important;
        }
        .custom-elegant-calendar .ant-picker-calendar-date-today {
           border-color: #cbd5e1 !important;
        }
      `}</style>
    </div>
  );
};
