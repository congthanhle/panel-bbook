import { useState, useMemo } from 'react';
import { useShiftStore } from '@/store/shiftStore';
import { Calendar, Badge, Drawer, Tag, Divider } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { ClockCircleOutlined, InfoCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { Shift } from '@/types/shift.types';

export const StaffShiftView = () => {
  const { myShifts } = useShiftStore();
  
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const getShiftBadgeStatus = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ongoing': return 'processing';
      case 'upcoming': return 'default';
      default: return 'default';
    }
  };

  const handleDateClick = (date: Dayjs) => {
    const shiftOpt = myShifts.find(s => s.date === date.format('YYYY-MM-DD'));
    if (shiftOpt) {
      setSelectedShift(shiftOpt);
      setDrawerVisible(true);
    }
  };

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayShifts = myShifts.filter(s => s.date === dateStr);
    
    // Visually highlight days with shifts for this user
    return (
      <ul className="m-0 p-0 list-none overflow-hidden h-full">
        {dayShifts.map((item) => (
           <li key={item.id} className="mb-1.5 cursor-pointer group" onClick={() => { setSelectedShift(item); setDrawerVisible(true); }}>
              <div className={`text-xs truncate rounded-md px-2 py-1.5 transition-all duration-300 ease-out border shadow-sm group-hover:shadow group-hover:-translate-y-0.5 ${item.status === 'completed' ? 'bg-gradient-to-br from-emerald-50 to-green-50/50 text-emerald-700 border-emerald-100/60' : 'bg-gradient-to-br from-indigo-50 to-blue-50/50 text-indigo-700 border-indigo-100/60'} font-medium`}>
                <Badge status={getShiftBadgeStatus(item.status) as any} />
                <span className="ml-1.5 tracking-tight">{item.startTime}</span>
              </div>
           </li>
        ))}
      </ul>
    );
  };

  // Helper for quick stats
  const upcomingCount = useMemo(() => myShifts.filter(s => s.status === 'upcoming').length, [myShifts]);
  const completedCount = useMemo(() => myShifts.filter(s => s.status === 'completed').length, [myShifts]);

  return (
    <div className="flex flex-col gap-6">
      
      <div className="grid grid-cols-2 gap-5 mb-2">
         <div className="bg-gradient-to-tr from-indigo-50 via-white to-blue-50/50 rounded-2xl p-5 border border-indigo-100/50 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-5 group">
           <div className="bg-white text-indigo-500 p-3.5 rounded-xl shadow-sm border border-indigo-50 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300"><CalendarOutlined className="text-2xl" /></div>
           <div>
              <div className="text-3xl font-extrabold text-indigo-950 tracking-tight">{upcomingCount}</div>
              <div className="text-indigo-600/70 text-[11px] font-bold uppercase tracking-widest mt-0.5">Upcoming Shifts</div>
           </div>
         </div>
         <div className="bg-gradient-to-tr from-emerald-50 via-white to-green-50/50 rounded-2xl p-5 border border-emerald-100/50 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-5 group">
           <div className="bg-white text-emerald-500 p-3.5 rounded-xl shadow-sm border border-emerald-50 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300"><ClockCircleOutlined className="text-2xl" /></div>
           <div>
              <div className="text-3xl font-extrabold text-emerald-950 tracking-tight">{completedCount}</div>
              <div className="text-emerald-600/70 text-[11px] font-bold uppercase tracking-widest mt-0.5">Completed Shifts</div>
           </div>
         </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden custom-calendar-min transition-all duration-500">
        <Calendar 
          cellRender={(date, info) => info.type === 'date' ? dateCellRender(date) : info.originNode}
          onSelect={(date, info) => {
            if (info.source === 'date') handleDateClick(date);
          }}
        />
      </div>

      <Drawer
        title="My Shift Details"
        placement="right"
        width={400}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedShift && (
          <div className="flex flex-col gap-6 font-sans">
            <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none transition-all" />
               <div className="flex justify-between items-start mb-5 relative z-10">
                 <h2 className="text-2xl font-extrabold m-0 text-slate-800 tracking-tight leading-tight w-3/4">{selectedShift.name}</h2>
                 <Tag 
                   color={selectedShift.status === 'completed' ? 'success' : 'processing'} 
                   className="m-0 text-xs px-2.5 py-0.5 rounded-full border-none font-semibold shadow-sm tracking-wide"
                 >
                   {selectedShift.status.toUpperCase()}
                 </Tag>
               </div>
               
               <div className="flex flex-col gap-3 relative z-10">
                 <div className="flex items-center gap-3 text-slate-700 font-medium bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm transition-all hover:border-indigo-100 hover:shadow">
                   <div className="bg-indigo-50 p-1.5 rounded-lg"><CalendarOutlined className="text-indigo-500 text-lg" /></div>
                   <span className="tracking-wide text-sm">{dayjs(selectedShift.date).format('dddd, MMMM D, YYYY')}</span>
                 </div>
                 
                 <div className="flex items-center gap-3 text-slate-700 font-medium bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm transition-all hover:border-indigo-100 hover:shadow">
                    <div className="bg-indigo-50 p-1.5 rounded-lg"><ClockCircleOutlined className="text-indigo-500 text-lg" /></div>
                    <span className="tracking-wide text-sm">{selectedShift.startTime} <span className="text-slate-400 mx-1">→</span> {selectedShift.endTime}</span>
                 </div>
               </div>

               {selectedShift.notes && (
                 <div className="mt-5 bg-gradient-to-r from-amber-50 to-yellow-50/30 p-4 rounded-xl text-slate-700 border border-amber-100/50 flex items-start gap-3 shadow-sm relative z-10">
                   <InfoCircleOutlined className="mt-0.5 text-amber-500 text-lg flex-shrink-0" />
                   <div className="leading-relaxed whitespace-pre-wrap text-sm font-medium">{selectedShift.notes}</div>
                 </div>
               )}
            </div>

            <Divider className="my-0" />
            
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Co-workers on Shift</h3>
              <div className="flex flex-col gap-2.5">
                {selectedShift.assignedStaff.length > 1 ? (
                  selectedShift.assignedStaff.map(s => (
                    <div key={s.id} className="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow hover:border-slate-200 transition-all duration-300 group cursor-default">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shadow-inner ring-2 ring-white group-hover:ring-indigo-50 transition-all">
                        <img src={s.avatar} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-sm tracking-tight">{s.name}</span>
                        <span className="text-slate-400 font-medium text-xs uppercase tracking-wider mt-0.5">{s.role}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 italic text-sm p-4 bg-slate-50 rounded-xl border border-slate-100/50 text-center">You are the only member assigned to this shift.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <style>{`
        .custom-calendar-min .ant-picker-calendar-date {
          height: 80px !important;
        }
      `}</style>
    </div>
  );
};
