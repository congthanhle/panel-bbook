import React, { useState, useEffect } from 'react';
import { Modal, DatePicker, Checkbox, Input, Button, message } from 'antd';
import { Lock, AlertCircle, CalendarClock } from 'lucide-react';
import { Court } from '@/types/court.types';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface CourtLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  court: Court | null;
}

export const CourtLockModal: React.FC<CourtLockModalProps> = ({ isOpen, onClose, court }) => {
  const [dateRange, setDateRange] = useState<any>(null);
  const [lockAllSlots, setLockAllSlots] = useState(true);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDateRange(null);
      setLockAllSlots(true);
      setReason('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!court) return;
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      message.error('Please select a date range');
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, this would dispatch to an endpoint like /api/courts/:id/lock
      // which would create lock records spanning the selected dates
      const payload = {
        courtId: court.id,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        allSlots: lockAllSlots,
        reason: reason
      };
      
      console.log('Dispatching lock to backend:', payload);
      // Simulate API call for the mock since we don't have a specific bulk date lock endpoint in MSW yet
      await new Promise(resolve => setTimeout(resolve, 800));
      
      message.success(`Court successfully locked for ${dateRange[0].format('MMM D')} - ${dateRange[1].format('MMM D')}`);
      onClose();
    } catch (error) {
      message.error('Failed to lock court');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CalendarClock className="text-amber-500" size={20} />
          <span>Block Court Schedule</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={480}
    >
      <div className="space-y-6 mt-4">
        
        <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-800">
           <AlertCircle className="mt-0.5 shrink-0" size={18} />
           <div className="text-sm leading-relaxed text-amber-900/80">
             Locking the court prevents any new bookings from being made during the selected period. Existing bookings will <strong>not</strong> be automatically cancelled.
           </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Date Range</label>
            <RangePicker 
              className="w-full" 
              size="large"
              value={dateRange}
              onChange={setDateRange}
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <Checkbox 
              checked={lockAllSlots} 
              onChange={(e) => setLockAllSlots(e.target.checked)}
              className="font-medium text-slate-700"
            >
              Lock all time slots for these dates
            </Checkbox>
            {!lockAllSlots && (
               <div className="mt-3 pl-6 text-sm text-slate-500">
                 <em>* Selecting specific times for date ranges must be done manually via the Court Overview page.</em>
               </div>
            )}
          </div>

          <div>
             <label className="text-sm font-medium text-slate-700 block mb-1.5">Reason for blocking (Internal)</label>
             <TextArea 
                placeholder="e.g. Court resurfacing, tournament booking..."
                rows={3}
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="resize-none"
             />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button 
            type="primary" 
            danger 
            className="bg-amber-500 hover:bg-amber-600 border-amber-500 hover:border-amber-600"
            icon={<Lock size={16} />} 
            onClick={handleSubmit} 
            loading={isSubmitting}
          >
            Block Selected Dates
          </Button>
        </div>
      </div>
    </Modal>
  );
};
