import { useEffect, useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button, Input, Select, Space, Segmented, message } from 'antd';
import { Plus, Search, Calendar as CalendarIcon, AlignJustify } from 'lucide-react';
import { useShiftStore } from '@/store/shiftStore';
import { ShiftListView } from './components/ShiftListView';
import { ShiftCalendarView } from './components/ShiftCalendarView';
import { CreateShiftModal } from './components/CreateShiftModal';
import { ShiftDetailDrawer } from './components/ShiftDetailDrawer';
import { Shift } from '@/types/shift.types';
import dayjs, { Dayjs } from 'dayjs';

const ShiftsPage = () => {
  const { shifts, isLoading, fetchShifts, createShift, createBulkShift, updateShift, deleteShift } = useShiftStore();
  
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Load shifts for the current month
  useEffect(() => {
    fetchShifts(currentMonth.format('YYYY-MM'));
  }, [fetchShifts, currentMonth]);

  const filteredShifts = useMemo(() => {
    return shifts.filter(shift => {
      const matchSearch = shift.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          shift.assignedStaff.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'all' || shift.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [shifts, searchTerm, statusFilter]);

  const handleCreateShift = () => {
    setSelectedShift(null);
    setIsModalVisible(true);
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setIsModalVisible(true);
  };

  const handleViewShift = (shift: Shift) => {
    setSelectedShift(shift);
    setIsDrawerVisible(true);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (selectedShift) {
        await updateShift(selectedShift.id, values);
        message.success('Shift updated successfully');
        if (isDrawerVisible) {
          // close drawer since references might be stale if major edits occurred
          setIsDrawerVisible(false);
        }
      } else {
        if (values.startDate) {
          await createBulkShift(values);
          message.success('Multiple shifts created successfully');
        } else {
          await createShift(values);
          message.success('Shift created successfully');
        }
      }
      setIsModalVisible(false);
    } catch (error) {
       message.error('An error occurred while saving.');
       throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteShift(id);
      message.success('Shift deleted successfully');
      setIsDrawerVisible(false);
    } catch (e) {
      message.error('Failed to delete shift');
    }
  };

  const handleDateClick = (date: Dayjs) => {
    const dayShifts = filteredShifts.filter(s => s.date === date.format('YYYY-MM-DD'));
    if (dayShifts.length > 0) {
      // If there's only one, open it directly. Otherwise, switch to List View filtered by date
      if (dayShifts.length === 1) {
        handleViewShift(dayShifts[0]);
      } else {
        setViewMode('list');
        setSearchTerm(date.format('YYYY-MM-DD')); // Hacky filter, but works
      }
    }
  };

  return (
    <PageWrapper 
      title="Shift Management"
      subtitle="Schedule and manage staff shifts across the facility."
      action={
        <Button type="primary" size="large" icon={<Plus size={18} />} onClick={handleCreateShift}>
          Create Shift
        </Button>
      }
    >
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <Space size="middle">
          <Input
            placeholder="Search shifts or staff..."
            prefix={<Search size={18} className="text-slate-400" />}
            className="w-full md:w-80"
            size="large"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Select
            size="large"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'ongoing', label: 'Ongoing' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
        </Space>

        <Segmented
          size="large"
          className="custom-elegant-segmented shadow-sm p-1 rounded-2xl relative z-10 bg-white/60 backdrop-blur-md border border-slate-200/50"
          value={viewMode}
          onChange={(val) => setViewMode(val as 'calendar' | 'list')}
          options={[
            { 
              value: 'calendar', 
              label: (
                <div className="flex items-center justify-center gap-2 w-28">
                  <CalendarIcon size={16} className="text-indigo-500" />
                  <span className="font-semibold tracking-wide">Calendar</span>
                </div>
              ) 
            },
            { 
              value: 'list', 
              label: (
                <div className="flex items-center justify-center gap-2 w-28">
                  <AlignJustify size={16} className="text-indigo-500" />
                  <span className="font-semibold tracking-wide">List</span>
                </div>
              ) 
            },
          ]}
        />
        
        <style>{`
          .custom-elegant-segmented {
             background: rgba(255, 255, 255, 0.4) !important;
          }
          .custom-elegant-segmented .ant-segmented-item {
             border-radius: 12px !important;
             color: #64748b;
             transition: all 0.3s ease;
          }
          .custom-elegant-segmented .ant-segmented-item:hover {
             color: #4f46e5;
             background: rgba(255, 255, 255, 0.5);
          }
          .custom-elegant-segmented .ant-segmented-item-selected {
             background: white !important;
             color: #4f46e5 !important;
             box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
          }
        `}</style>
      </div>

      <div className="relative">
        {viewMode === 'calendar' ? (
          <ShiftCalendarView 
            shifts={filteredShifts} 
            onDateClick={handleDateClick}
            onPanelChange={(date) => setCurrentMonth(date)}
          />
        ) : (
          <ShiftListView 
            shifts={filteredShifts} 
            loading={isLoading} 
            onEdit={handleEditShift} 
            onDelete={handleDelete}
            onView={handleViewShift}
          />
        )}
      </div>

      <CreateShiftModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedShift}
        loading={isLoading}
        existingShifts={shifts}
      />

      <ShiftDetailDrawer
        visible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        shift={shifts.find(s => s.id === selectedShift?.id) || null} 
        loading={isLoading}
      />

    </PageWrapper>
  );
};

export default ShiftsPage;
