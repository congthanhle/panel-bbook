import React, { memo } from 'react';
import { SlotCell as SlotCellType } from '@/types/overview.types';
import { useCourtOverviewStore } from '@/store/courtOverviewStore';
import { Lock, Wrench, Plus, User } from 'lucide-react';
import { Tooltip } from 'antd';
import { useAuthStore } from '@/store/authStore';

interface SlotCellProps {
  data: SlotCellType;
  courtId: string;
  timeSlotId: string;
  onClick: (data: SlotCellType, isMulti: boolean) => void;
}

const SlotCellComponent: React.FC<SlotCellProps> = ({ 
  data, 
  courtId, 
  timeSlotId, 
  onClick
}) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const selectedCells = useCourtOverviewStore(state => state.selectedCells);
  
  const cellId = `${courtId}_${timeSlotId}`;
  const isSelected = selectedCells.includes(cellId);
  const status = data?.status || 'available';

  // Base styles for the cell
  const baseClasses = `
    relative h-12 w-full border-b border-r border-slate-100 transition-all duration-200
    flex items-center justify-center cursor-pointer select-none group
  `;

  // Status-specific styles
  const statusClasses = {
    available: 'bg-white hover:bg-emerald-50/50',
    booked: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
    locked: 'bg-slate-100/80 hover:bg-red-50 text-slate-400 hover:text-red-500',
    maintenance: 'bg-amber-50 hover:bg-amber-100 text-amber-600',
  };

  const selectedClasses = isSelected 
    ? 'ring-2 ring-blue-500 z-10 shadow-sm shadow-blue-200 scale-[0.98]' 
    : '';

  const getIcon = () => {
    switch (status) {
      case 'locked':
        return <Lock size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" />;
      case 'maintenance':
        return <Wrench size={14} className="opacity-70 group-hover:opacity-100" />;
      case 'booked':
        return data.booking?.customerInitial ? (
           <span className="text-xs font-semibold tracking-wider">
             {data.booking.customerInitial}
           </span>
        ) : <User size={14} />;
      case 'available':
        return <Plus size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100" />;
      default:
        return null;
    }
  };

  const getTooltipTitle = () => {
    if (status === 'booked' && data.booking) {
      return (
        <div className="text-xs">
          <div className="font-semibold mb-1">{data.booking.customerName}</div>
          <div className="opacity-80">Paid: ${(data.booking.amount ?? 0).toFixed(2)}</div>
        </div>
      );
    }
    if (status === 'locked' && data.lockedReason) {
      return `Locked: ${data.lockedReason}`;
    }
    if (status === 'available' && isAdmin) {
      return 'Click to Book or Lock';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdmin) {
       onClick(data, e.ctrlKey || e.metaKey);
    }
  };

  return (
    <Tooltip 
      title={getTooltipTitle()} 
      mouseEnterDelay={0.4}
      placement="top"
    >
      <div
        className={`${baseClasses} ${statusClasses[status]} ${selectedClasses}`}
        onClick={handleClick}
      >
        {/* Subtle background pattern for booked states to make them feel more physical */}
        {status === 'booked' && (
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />
        )}
        
        {/* Border radius only on hover or selected to keep grid tight, but soft on interaction */}
        <div className={`
          absolute inset-[1px] rounded-sm transition-all duration-300 flex items-center justify-center
          ${status === 'available' ? 'group-hover:bg-emerald-50/50' : ''}
        `}>
          {getIcon()}
        </div>
      </div>
    </Tooltip>
  );
};

// Memoize the cell to prevent massive re-renders when dragging to select multiple
export const SlotCell = memo(SlotCellComponent, (prevProps, nextProps) => {
  return (
    prevProps.courtId === nextProps.courtId &&
    prevProps.timeSlotId === nextProps.timeSlotId &&
    prevProps.data?.status === nextProps.data?.status &&
    prevProps.data?.booking?.id === nextProps.data?.booking?.id &&
    prevProps.data?.booking?.paymentStatus === nextProps.data?.booking?.paymentStatus &&
    prevProps.data?.lockedReason === nextProps.data?.lockedReason
  );
});
