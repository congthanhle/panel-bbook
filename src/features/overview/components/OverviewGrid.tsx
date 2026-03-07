import React, { useRef } from 'react';
import { useCourtOverviewStore } from '@/store/courtOverviewStore';
import { SlotCell } from './SlotCell';
import { SlotCell as SlotCellType } from '@/types/overview.types';
import { Skeleton } from 'antd';
import dayjs from 'dayjs';

export interface OverviewGridProps {
  onCellClick: (cellData: SlotCellType, isMulti: boolean) => void;
}

// Helper to generate dynamic axis based on store config
const generateTimeAxis = (operatingHours: any) => {
   if (!operatingHours) return [];
   const slots = [];
   const [openHour, openMin] = operatingHours.openTime.split(':').map(Number);
   const [closeHour, closeMin] = operatingHours.closeTime.split(':').map(Number);
   
   let current = dayjs().hour(openHour).minute(openMin).second(0);
   const end = dayjs().hour(closeHour).minute(closeMin).second(0);
   
   while (current.isBefore(end)) {
     slots.push({
       id: current.format('HHmm'),
       label: current.format('h:mm A')
     });
     current = current.add(operatingHours.intervalMinutes, 'minute');
   }
   return slots;
};

export const OverviewGrid: React.FC<OverviewGridProps> = ({ onCellClick }) => {
  const courts = useCourtOverviewStore(state => state.courts);
  const slots = useCourtOverviewStore(state => state.slots);
  const operatingHours = useCourtOverviewStore(state => state.operatingHours);
  const isLoading = useCourtOverviewStore(state => state.isLoading);
  
  // Dynamically constructed labels memoized 
  const timeLabels = React.useMemo(() => generateTimeAxis(operatingHours), [operatingHours]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  if (isLoading && Object.keys(slots).length === 0) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
         <Skeleton active paragraph={{ rows: 1 }} />
         <div className="flex gap-4">
           {Array.from({length: 8}).map((_, i) => (
             <Skeleton.Input key={i} active size="large" className="flex-1" />
           ))}
         </div>
         <Skeleton active paragraph={{ rows: 15 }} />
      </div>
    );
  }

  return (
    <div 
      className="w-full bg-white rounded-2xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden flex flex-col relative"
      ref={containerRef}
    >
      {/* Scrollable Container */}
      <div className="overflow-auto max-h-[800px] w-full" style={{ scrollbarGutter: 'stable' }}>
        
        {/* Grid Structure */}
        <div 
          className="min-w-fit"
          style={{
            display: 'grid',
            gridTemplateColumns: `160px repeat(${timeLabels.length}, minmax(90px, 1fr))`
          }}
        >
          {/* Header Row (Sticky top) */}
          <div className="sticky top-0 left-0 z-40 bg-slate-50 border-b border-slate-200 border-r shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]" /> {/* Top-left empty corner */}
          
          {timeLabels.map(time => (
            <div 
              key={time.id} 
              className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 flex items-center justify-center py-3 px-2 text-center shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]"
            >
              <div className="text-xs font-semibold tracking-wider text-slate-800 whitespace-nowrap">{time.label}</div>
            </div>
          ))}

          {/* Body Rows */}
          {courts.map((court) => (
            <React.Fragment key={court.id}>
              {/* Court Label Column (Sticky left) */}
              <div className="sticky left-0 z-30 bg-slate-50/90 backdrop-blur-sm border-b border-r border-slate-200 p-4 flex flex-col justify-center items-start shadow-[1px_0_3px_0_rgba(0,0,0,0.02)] min-h-[64px]">
                 <div className="font-bold text-slate-800 tracking-tight text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{court.name}</div>
                 <div className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">{court.type}</div>
              </div>

              {/* Time Slot Columns for this Court */}
              {timeLabels.map((time) => {
                const cellId = `${court.id}_${time.id}`;
                const cellData = slots[cellId];
                
                return (
                  <SlotCell
                    key={cellId}
                    courtId={court.id}
                    timeSlotId={time.id}
                    data={cellData}
                    onClick={onCellClick}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>

      </div>
    </div>
  );
};
