import React, { useEffect, useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DatePicker, Button, Space } from 'antd';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { useCourtOverviewStore } from '@/store/courtOverviewStore';

// Components
import { OverviewGrid } from './components/OverviewGrid';
import { BulkActionToolbar } from './components/BulkActionToolbar';
import { BookingFormDrawer } from './components/BookingFormDrawer';
import { SlotCell } from '@/types/overview.types';

const CourtOverviewPage: React.FC = () => {
  const selectedDate = useCourtOverviewStore(state => state.selectedDate);
  const slots = useCourtOverviewStore(state => state.slots);
  const setDate = useCourtOverviewStore(state => state.setDate);
  const loadOverviewData = useCourtOverviewStore(state => state.loadOverviewData);
  const toggleCellSelection = useCourtOverviewStore(state => state.toggleCellSelection);
  const addCellsToSelection = useCourtOverviewStore(state => state.addCellsToSelection);
  const clearSelection = useCourtOverviewStore(state => state.clearSelection);

  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);

  // Load data when date changes
  useEffect(() => {
    loadOverviewData(selectedDate);
    clearSelection();
  }, [selectedDate, loadOverviewData, clearSelection]);

  // Calculate stats for chips
  const stats = useMemo(() => {
    let available = 0;
    let booked = 0;
    let locked = 0;
    let maintenance = 0;

    Object.values(slots).forEach(slot => {
      if (slot.status === 'available') available++;
      if (slot.status === 'booked') booked++;
      if (slot.status === 'locked') locked++;
      if (slot.status === 'maintenance') maintenance++;
    });

    return { available, booked, locked, maintenance };
  }, [slots]);

  const handleDateChange = (date: Dayjs | null) => {
    if (date) setDate(date);
  };

  const jumpToToday = () => setDate(dayjs());
  const prevDay = () => setDate(selectedDate.subtract(1, 'day'));
  const nextDay = () => setDate(selectedDate.add(1, 'day'));

  const handleCellClick = (cellData: SlotCell, isMulti: boolean) => {
     const cellId = `${cellData.courtId}_${cellData.timeSlotId}`;
     if (isMulti) {
        toggleCellSelection(cellId);
     } else {
        clearSelection();
        addCellsToSelection([cellId]);
     }
  };

  const handleOpenBookingBulk = () => {
     setBookingDrawerOpen(true);
  };

  const DateControls = (
    <div className="flex items-center gap-3">
      <Space.Compact>
        <Button icon={<ChevronLeft size={16} />} onClick={prevDay} />
        <Button onClick={jumpToToday}>Today</Button>
        <Button icon={<ChevronRight size={16} />} onClick={nextDay} />
      </Space.Compact>
      
      <DatePicker 
        value={selectedDate} 
        onChange={handleDateChange} 
        allowClear={false}
        className="w-40"
        suffixIcon={<CalendarIcon size={16} className="text-slate-400" />}
      />
    </div>
  );

  return (
    <PageWrapper 
      title="Court Overview" 
      subtitle={selectedDate.format('dddd, MMMM D, YYYY')}
      action={DateControls}
      className="flex flex-col h-full"
    >
      {/* Top Banner & Legend */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sticky top-0 z-10 bg-slate-50 border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 shadow-sm">
        
        {/* Status Chips */}
        <div className="flex flex-wrap items-center gap-2">
           <div className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600 flex items-center gap-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              Available 
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center ml-1">
                {stats.available}
              </span>
           </div>
           <div className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600 flex items-center gap-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
              Booked 
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center ml-1">
                {stats.booked}
              </span>
           </div>
           <div className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600 flex items-center gap-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
              Locked 
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center ml-1">
                {stats.locked}
              </span>
           </div>
           {stats.maintenance > 0 && (
             <div className="px-3 py-1.5 rounded-full bg-white border border-amber-200 text-sm font-medium text-amber-700 flex items-center gap-2 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                Maintenance 
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center ml-1">
                  {stats.maintenance}
                </span>
             </div>
           )}
        </div>

        {/* Info text */}
        <div className="text-sm text-slate-500 bg-white px-3 py-1.5 rounded border border-slate-100 hidden md:block shadow-sm">
          Hold <kbd className="font-sans px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-xs text-slate-600">Ctrl</kbd> or <kbd className="font-sans px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-xs text-slate-600">Cmd</kbd> + Click to select multiple slots
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 min-h-0 relative">
        <OverviewGrid onCellClick={handleCellClick} />
      </div>

      {/* Overlays */}
      <BulkActionToolbar onBookSelected={handleOpenBookingBulk} />
      
      <BookingFormDrawer 
        isOpen={bookingDrawerOpen} 
        onClose={() => setBookingDrawerOpen(false)} 
      />
    </PageWrapper>
  );
};

export default CourtOverviewPage;
