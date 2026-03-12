import React, { useEffect, useState, useMemo } from 'react';
import { Drawer, Form, Input, Select, Button, InputNumber, Divider, Timeline, Spin, Typography, Tag, Alert, message } from 'antd';
import { User, Phone, CreditCard, DollarSign, Calendar, Search } from 'lucide-react';
import { useCourtOverviewStore } from '@/store/courtOverviewStore';
import { overviewApi, CreateBookingDto, PriceBreakdown } from '@/features/overview/api';

const { Text } = Typography;

interface BookingFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // If activeCell is provided, it's a single slot booking. If undefined, we use selectedCells from the store.
  activeCellId?: string; 
}

export const BookingFormDrawer: React.FC<BookingFormDrawerProps> = ({ isOpen, onClose, activeCellId }) => {
  const [form] = Form.useForm();
  
  const courts = useCourtOverviewStore(state => state.courts);
  const slots = useCourtOverviewStore(state => state.slots);
  const selectedCells = useCourtOverviewStore(state => state.selectedCells);
  const selectedDate = useCourtOverviewStore(state => state.selectedDate);
  const createBooking = useCourtOverviewStore(state => state.createBooking);
  const operatingHours = useCourtOverviewStore(state => state.operatingHours);

  // States for Real-Time Validation
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [customerLookupStatus, setCustomerLookupStatus] = useState<'idle' | 'found' | 'not-found' | 'error'>('idle');
  const [customerTier, setCustomerTier] = useState<string | null>(null);
  
  const [hasConflicts, setHasConflicts] = useState(false);
  const [conflictKeys, setConflictKeys] = useState<string[]>([]);
  
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine which cells we are booking
  const baseCellsToBook = activeCellId ? [activeCellId] : selectedCells;
  
  // Here we would ideally recompute the range based on baseCellsToBook + dynamically selected end time.
  // Currently the standard behavior relies on dragging, so we stick to the store's selectedCells
  const cellsToBook = useMemo(() => baseCellsToBook, [baseCellsToBook]);
  
  // Calculate summary details
  const totalSlotsCount = cellsToBook.length;
  const totalPrice = useMemo(() => cellsToBook.reduce((acc, cellId) => {
     return acc + (slots[cellId]?.price || 0);
  }, 0), [cellsToBook, slots]);

  // Group cells by court for timeline view, and sort chronologically
  const sortedCells = useMemo(() => [...cellsToBook].sort((a, b) => {
    const timeA = a.split('_')[1];
    const timeB = b.split('_')[1];
    return parseInt(timeA) - parseInt(timeB);
  }), [cellsToBook]);

  // Stable key for the selected cells to use as useEffect dependency
  const cellsKey = useMemo(() => sortedCells.join(','), [sortedCells]);
  
  const cellsByCourt = sortedCells.reduce((acc, cellId) => {
    const [courtId, timeId] = cellId.split('_');
    if (!acc[courtId]) acc[courtId] = [];
    acc[courtId].push(timeId);
    return acc;
  }, {} as Record<string, string[]>);

  // Helper to format TimeSlot ID back to human readable
  const formatTimeSlot = (timeId: string) => {
     const hour = parseInt(timeId.substring(0, 2), 10);
     const min = timeId.substring(2);
     const ampm = hour >= 12 ? 'PM' : 'AM';
     const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
     return `${displayHour}:${min.padStart(2, '0')} ${ampm}`;
  };

  const getEndTimeId = (timeId: string, intervalsToAdd = 1) => {
     const interval = operatingHours?.intervalMinutes || 30;
     const totalMin = parseInt(timeId.substring(0, 2), 10) * 60 + parseInt(timeId.substring(2), 10) + (interval * intervalsToAdd);
     const h = Math.floor(totalMin / 60);
     const m = totalMin % 60;
     return `${h.toString().padStart(2, '0')}${m.toString().padStart(2, '0')}`;
  };

  const getConsecutiveBlocks = (timeslots: string[]) => {
     if (timeslots.length === 0) return [];
     
     const interval = operatingHours?.intervalMinutes || 30;
     const toMinutes = (time: string) => parseInt(time.substring(0,2), 10) * 60 + parseInt(time.substring(2), 10);
     
     const blocks: { start: string, end: string, count: number }[] = [];
     let currentStart = timeslots[0];
     let currentEnd = timeslots[0];
     let count = 1;
     
     for (let i = 1; i < timeslots.length; i++) {
        const prevMin = toMinutes(currentEnd);
        const currMin = toMinutes(timeslots[i]);
        
        if (currMin - prevMin === interval) {
           currentEnd = timeslots[i];
           count++;
        } else {
           blocks.push({ start: currentStart, end: currentEnd, count });
           currentStart = timeslots[i];
           currentEnd = timeslots[i];
           count = 1;
        }
     }
     blocks.push({ start: currentStart, end: currentEnd, count });
     return blocks;
  };

  // 1. PHONE LOOKUP (debounced)
  const phoneValue = Form.useWatch('phone', form);
  
  useEffect(() => {
    if (!phoneValue || phoneValue.length < 10) {
      setCustomerLookupStatus('idle');
      setCustomerTier(null);
      form.setFieldValue('customerName', ''); // Reset name if phone is short
      return;
    }

    const timer = setTimeout(async () => {
      setIsPhoneLoading(true);
      try {
        const res = await overviewApi.lookupByPhone(phoneValue);
        if (res.found && res.customer) {
          setCustomerLookupStatus('found');
          setCustomerTier(res.customer.membershipTier || 'Standard');
          form.setFieldValue('customerName', res.customer.name);
        } else {
          setCustomerLookupStatus('not-found');
          form.setFieldValue('customerName', '');
        }
      } catch (err: any) {
        setCustomerLookupStatus('error');
      } finally {
        setIsPhoneLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [phoneValue, form]);

  // 2. SLOT RANGE VALIDATION (Client-side)
  useEffect(() => {
    if (!isOpen || cellsToBook.length === 0) return;
    
    let conflict = false;
    const conflicts: string[] = [];
    
    cellsToBook.forEach(key => {
      const slot = slots[key];
      // If it's booked or locked by someone else, we consider it a conflict
      if (slot && (slot.status === 'booked' || slot.status === 'locked')) {
        conflict = true;
        conflicts.push(key);
      }
    });
    
    setHasConflicts(conflict);
    setConflictKeys(conflicts);
  }, [cellsToBook, slots, isOpen]);

  // 3. PRICE PREVIEW via API
  useEffect(() => {
    if (!isOpen || cellsToBook.length === 0) return;

    // Derive court, start and end from the sorted cells
    const firstCell = sortedCells[0];
    const lastCell = sortedCells[sortedCells.length - 1];
    if (!firstCell || !lastCell) return;

    const courtId = firstCell.split('_')[0];
    const startTimeId = firstCell.split('_')[1];
    const endTimeId = getEndTimeId(lastCell.split('_')[1], 1);
    const date = selectedDate.format('YYYY-MM-DD');

    // Format time IDs to HH:mm
    const toHHmm = (id: string) => `${id.substring(0, 2)}:${id.substring(2)}`;
    const startTime = toHHmm(startTimeId);
    const endTime = toHHmm(endTimeId);

    // Set local fallback immediately
    setCalculatedPrice(totalPrice);
    form.setFieldsValue({ totalAmount: totalPrice, paymentMode: 'cash', downPayment: 0 });

    // Call API for real price
    const abortController = new AbortController();
    setIsPriceLoading(true);

    overviewApi
      .calculatePrice(courtId, date, startTime, endTime)
      .then((res) => {
        if (!abortController.signal.aborted) {
          setPriceBreakdown(res);
          setCalculatedPrice(res.totalAmount);
          form.setFieldValue('totalAmount', res.totalAmount);
        }
      })
      .catch(() => {
        // Fallback: keep local calculation
        if (!abortController.signal.aborted) {
          setPriceBreakdown(null);
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsPriceLoading(false);
        }
      });

    return () => abortController.abort();
  }, [isOpen, cellsKey, selectedDate]);

  const handleSubmit = async (values: any) => {
    if (hasConflicts) {
      message.error("Cannot book due to slot conflicts.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Derive courtId from the first selected cell
      const firstCourtId = cellsToBook[0]?.split('_')[0] || '';
      const date = selectedDate.format('YYYY-MM-DD');

      // Derive start/end times from sorted cells
      const firstTimeId = sortedCells[0]?.split('_')[1] || '';
      const lastTimeId = sortedCells[sortedCells.length - 1]?.split('_')[1] || '';
      const endTimeId = getEndTimeId(lastTimeId, 1);

      const toHHmm = (id: string) => `${id.substring(0, 2)}:${id.substring(2)}`;

      const dto: CreateBookingDto = {
        courtId: firstCourtId,
        date,
        startTime: toHHmm(firstTimeId),
        endTime: toHHmm(endTimeId),
        customerName: values.customerName,
        customerPhone: values.phone,
        paidAmount: values.downPayment || 0,
        _selectedCells: cellsToBook,
      };
      
      await createBooking(dto);
      onClose(); // store shows success toast
    } catch (error: any) {
       console.error("Booking failed", error);
       // Handle 409 conflict
       if (error.response?.status === 409 || error.code === 'SLOT_NOT_AVAILABLE') {
         // Optionally update local conflict UI here
         message.error("Slots were booked or locked by another user just now.");
       } else {
         message.error("Failed to create booking.");
       }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cellsToBook.length === 0) return null;

  return (
    <Drawer
      title={
         <div className="flex flex-col">
            <span className="text-xl font-bold text-slate-800 tracking-tight">Walk-in Booking</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
               {totalSlotsCount} Slot{totalSlotsCount > 1 ? 's' : ''} Selected
            </span>
         </div>
      }
      placement="right"
      width={480}
      onClose={onClose}
      open={isOpen}
      destroyOnHidden
      closeIcon={<div className="text-slate-400 hover:text-slate-700 transition-colors">✕</div>}
      styles={{
        header: { borderBottom: '1px solid #f1f5f9', padding: '24px' },
        body: { padding: 0 },
        footer: { borderTop: 'none', padding: '24px' }
      }}
      footer={
         <div className="flex gap-4">
            <Button size="large" onClick={onClose} className="flex-1 font-medium" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
               size="large" 
               type="primary" 
               className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 font-medium"
               onClick={() => form.submit()}
               loading={isSubmitting}
               disabled={hasConflicts || isSubmitting}
            >
              Confirm Booking
            </Button>
         </div>
      }
    >
      <Spin spinning={isSubmitting} size="large">
        <div className="p-6">
           {/* Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 shadow-sm">
             <div className="flex items-start gap-4 mb-4">
                <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-lg">
                   <Calendar size={20} />
                </div>
                <div>
                   <h4 className="font-semibold text-slate-800 text-sm">Booking Overview</h4>
                   <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                     You are about to book {totalSlotsCount} time slot(s). Please verify the timeline below before confirming.
                   </p>
                </div>
             </div>

              {/* Timeline Sequence Box */}
              {hasConflicts && (
                <Alert 
                  message="Slot Conflicts Detected"
                  description="Some slots in your selection are no longer available. Please adjust your time."
                  type="error"
                  showIcon
                  className="mb-4"
                />
              )}
              
              {/* Slot Mini-Strip: visual per-slot availability */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Slot Availability</div>
                <div className="flex gap-1 flex-wrap">
                  {sortedCells.map((cellId) => {
                    const slot = slots[cellId];
                    const timeId = cellId.split('_')[1];
                    const isConflict = conflictKeys.includes(cellId);
                    const isLocked = slot?.status === 'locked';

                    let bgColor = 'bg-emerald-400'; // available
                    let borderColor = 'border-emerald-300';
                    let tooltip = `${formatTimeSlot(timeId)} — Available`;

                    if (isConflict) {
                      bgColor = 'bg-red-400';
                      borderColor = 'border-red-300';
                      tooltip = `${formatTimeSlot(timeId)} — ${isLocked ? 'Locked' : 'Booked'}`;
                    } else if (isLocked) {
                      bgColor = 'bg-slate-400';
                      borderColor = 'border-slate-300';
                      tooltip = `${formatTimeSlot(timeId)} — Locked`;
                    }

                    return (
                      <div
                        key={cellId}
                        title={tooltip}
                        className={`h-7 rounded-md border ${bgColor} ${borderColor} flex items-center justify-center px-2 cursor-default transition-all hover:scale-105 hover:shadow-sm`}
                      >
                        <span className="text-[10px] font-bold text-white drop-shadow-sm">
                          {formatTimeSlot(timeId)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {hasConflicts && (
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-medium text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Available</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Conflict</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> Locked</span>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className={`bg-white rounded-lg border p-4 mb-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] ${hasConflicts ? 'border-red-300 bg-red-50' : 'border-slate-100'}`}>
                <Timeline 
                  className="pt-2 pl-1"
                  items={Object.entries(cellsByCourt).flatMap(([courtId, timeslots]) => {
                    const courtName = courts.find(c => c.id === courtId)?.name || 'Court';
                    const blocks = getConsecutiveBlocks(timeslots);
                    
                    // Format nodes to emphasize continuity across time blocks
                    return blocks.map((block, index) => {
                      const endTimeObj = getEndTimeId(block.end, 1);
                      const isLastBlockForCourt = index === blocks.length - 1;
                      
                      // Check for conflicts inside this block
                      let blockHasConflict = false;
                      const startMin = parseInt(block.start.substring(0, 2)) * 60 + parseInt(block.start.substring(2));
                      const endMin = parseInt(block.end.substring(0, 2)) * 60 + parseInt(block.end.substring(2));
                      
                      conflictKeys.forEach(key => {
                        const [cId, time] = key.split('_');
                        if (cId === courtId) {
                          const tMin = parseInt(time.substring(0,2)) * 60 + parseInt(time.substring(2));
                          if (tMin >= startMin && tMin <= endMin) {
                            blockHasConflict = true;
                          }
                        }
                      });
                      
                      return {
                        color: blockHasConflict ? 'red' : 'indigo',
                        children: (
                          <div className={`-mt-1.5 ${isLastBlockForCourt ? 'pb-6' : 'pb-2'}`}>
                            <div className={`text-sm font-semibold tracking-tight flex items-center gap-2 ${blockHasConflict ? 'text-red-700' : 'text-slate-800'}`}>
                               {formatTimeSlot(block.start)} - {formatTimeSlot(endTimeObj)}
                               {block.count > 1 && (
                                 <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none border shadow-sm ${blockHasConflict ? 'bg-red-100 text-red-600 border-red-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                   {block.count} SLOTS
                                 </span>
                               )}
                               {blockHasConflict && (
                                 <Tag color="error" className="ml-2 border-0">UNAVAILABLE</Tag>
                               )}
                            </div>
                            <div className="text-xs text-slate-500 font-medium bg-slate-50 inline-flex items-center px-1.5 py-0.5 rounded border border-slate-100 mt-1 shadow-sm">
                               {courtName}
                            </div>
                          </div>
                        )
                      };
                    });
                  })}
                />
             </div>

             <Divider className="my-3 border-slate-200" />
              
              {/* Price Breakdown */}
              <div className="py-2 space-y-2">
                {isPriceLoading ? (
                  <div className="flex items-center justify-center py-3">
                    <Spin size="small" />
                    <span className="ml-2 text-xs text-slate-400">Calculating price…</span>
                  </div>
                ) : (
                  <>
                    {priceBreakdown?.details?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="font-medium text-slate-700">
                          {(item?.amount || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    ))}
                    {priceBreakdown && !priceBreakdown.details?.length && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Court fee</span>
                        <span className="font-medium text-slate-700">
                          {(priceBreakdown?.courtFee || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    )}
                    <Divider className="my-1 border-slate-100" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500">Total</span>
                      <span className="text-lg font-bold text-indigo-700">
                        {((calculatedPrice ?? totalPrice) || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </>
                )}
              </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-5"
          >
             {/* Customer Segment */}
             <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                     <User size={16} className="text-slate-400" />
                     Customer Details
                  </h3>
                  {customerLookupStatus === 'error' && (
                    <Text type="danger" className="text-xs">Lookup failed, enter name manually</Text>
                  )}
                  {customerLookupStatus === 'not-found' && (
                    <Tag color="blue" className="mr-0 border-0">New Customer</Tag>
                  )}
                  {customerLookupStatus === 'found' && (
                    <Tag color="green" className="mr-0 border-0 flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {customerTier || 'Member'}
                    </Tag>
                  )}
                </div>
                
                <Form.Item
                  label={<span className="text-slate-600 font-medium">Phone Number</span>}
                  name="phone"
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                  <Input 
                     prefix={<Phone size={16} className="text-slate-400 mr-1" />} 
                     suffix={isPhoneLoading ? <Spin size="small" /> : <Search size={16} className="text-slate-300" />}
                     placeholder="Enter phone to search..." 
                     size="large"
                     className="rounded-lg h-12"
                     disabled={isSubmitting}
                  />
                </Form.Item>
                
                <Form.Item
                  label={<span className="text-slate-600 font-medium">Full Name</span>}
                  name="customerName"
                  rules={[{ required: true, message: 'Please enter customer name' }]}
                >
                  <Input 
                     prefix={<User size={16} className="text-slate-400 mr-1" />} 
                     placeholder="John Doe" 
                     size="large"
                     className={`rounded-lg h-12 ${customerLookupStatus === 'found' ? 'bg-green-50 border-green-200' : ''}`}
                     disabled={isSubmitting || customerLookupStatus === 'found'}
                     readOnly={customerLookupStatus === 'found'}
                  />
                </Form.Item>
             </div>

             <Divider className="my-2 border-slate-100" />

             {/* Payment Segment */}
             <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <CreditCard size={16} className="text-slate-400" />
                   Payment
                </h3>

                <Form.Item
                  label={<span className="text-slate-600 font-medium">Payment Method</span>}
                  name="paymentMode"
                >
                  <Select size="large" className="rounded-lg">
                    <Select.Option value="cash">Cash in Counter</Select.Option>
                    <Select.Option value="transfer">Bank Transfer</Select.Option>
                    <Select.Option value="card">Credit Card (Terminal)</Select.Option>
                  </Select>
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    label={<span className="text-slate-600 font-medium">Down Payment</span>}
                    name="downPayment"
                  >
                    <InputNumber 
                       prefix={<DollarSign size={14} className="text-slate-400" />}
                       className="w-full rounded-lg h-12 flex items-center" 
                       size="large"
                       min={0}
                       max={calculatedPrice || totalPrice}
                       disabled={isSubmitting}
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-slate-600 font-medium">Total Amount</span>}
                    name="totalAmount"
                  >
                    <InputNumber 
                       prefix={<DollarSign size={14} className="text-slate-400" />}
                       className="w-full rounded-lg h-12 flex items-center bg-slate-50 text-slate-500" 
                       size="large"
                       readOnly
                       disabled={isSubmitting}
                    />
                  </Form.Item>
                </div>
             </div>
          </Form>
        </div>
      </Spin>
    </Drawer>
  );
};
