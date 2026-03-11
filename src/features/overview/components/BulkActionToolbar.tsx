import React, { useState } from 'react';
import { Button, Space, Input } from 'antd';
import { Lock, Unlock, X, Calendar, Ban } from 'lucide-react';
import { useCourtOverviewStore } from '@/store/courtOverviewStore';
import { useAuthStore } from '@/store/authStore';

interface BulkActionToolbarProps {
  onBookSelected: () => void;
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({ onBookSelected }) => {
  const slots = useCourtOverviewStore(state => state.slots);
  const selectedCells = useCourtOverviewStore(state => state.selectedCells);
  const clearSelection = useCourtOverviewStore(state => state.clearSelection);
  const bulkLockSlots = useCourtOverviewStore(state => state.bulkLockSlots);
  const cancelBooking = useCourtOverviewStore(state => state.cancelBooking);
  
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  
  if (selectedCells.length === 0) return null;

  const canCancel = user?.role === 'admin' || user?.role === 'staff';
  const hasAvailable = selectedCells.some(id => !slots[id] || slots[id]?.status === 'available');
  const hasLocked = selectedCells.some(id => slots[id]?.status === 'locked');
  const isSingleBookedSlot = selectedCells.length === 1 && slots[selectedCells[0]]?.status === 'booked';

  const handleAction = async (action: 'lock' | 'unlock') => {
    setIsSubmitting(true);
    try {
      await bulkLockSlots({
        slots: selectedCells,
        action,
        reason: action === 'lock' ? reason : undefined
      });
      setReason('');
    } catch (error) {
      console.error('Failed bulk action', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!isSingleBookedSlot) return;
    const slot = slots[selectedCells[0]];
    const bookingId = slot?.booking?.id;
    if (!bookingId) {
      console.error('No booking ID found for selected slot');
      return;
    }
    setIsSubmitting(true);
    try {
       await cancelBooking(bookingId, reason || 'Cancelled by admin/staff');
       setReason('');
       clearSelection();
    } catch (error) {
       console.error("Failed to cancel booking", error);
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-300">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-6 border border-slate-700/50 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/90">
        
        {/* Count */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            {selectedCells.length}
          </div>
          <div className="text-sm font-medium">Slots Selected</div>
        </div>

        <div className="w-px h-8 bg-slate-700" />

        {/* Input */}
        <Input 
          placeholder="Reason (optional)" 
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-48 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-800"
          disabled={isSubmitting}
        />

        {/* Actions */}
        <Space size="middle">
          {isSingleBookedSlot && canCancel && (
            <Button
              danger
              className="hover:scale-105 transition-transform"
              icon={<Ban size={16} />}
              onClick={handleCancelBooking}
              loading={isSubmitting}
            >
              Cancel Booking
            </Button>
          )}

          {!isSingleBookedSlot && hasLocked && (
            <Button 
              className="hover:scale-105 transition-transform"
              icon={<Unlock size={16} />}
              onClick={() => handleAction('unlock')}
              loading={isSubmitting}
            >
              Unlock Selected
            </Button>
          )}

          {!isSingleBookedSlot && hasAvailable && (
            <Button 
              className="hover:scale-105 transition-transform"
              icon={<Lock size={16} />}
              onClick={() => handleAction('lock')}
              loading={isSubmitting}
            >
              Lock Selected
            </Button>
          )}

          {!isSingleBookedSlot && hasAvailable && (
            <Button 
              className="bg-indigo-600 hover:bg-indigo-500 border-indigo-600 hover:border-indigo-500 text-white hover:scale-105 transition-transform ml-2"
              icon={<Calendar size={16} />}
              onClick={onBookSelected}
              disabled={isSubmitting}
            >
              Book Selected
            </Button>
          )}
          
          <Button 
            type="text" 
            className="text-slate-400 hover:text-white ml-2"
            icon={<X size={18} />}
            onClick={clearSelection}
            disabled={isSubmitting}
          />
        </Space>

      </div>
    </div>
  );
};
