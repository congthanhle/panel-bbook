import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Drawer, Skeleton, Button, Modal, Input, Divider, InputNumber, Select,
  Tag, Spin, message, Descriptions, Table, Typography, Space, Popconfirm,
} from 'antd';
import {
  CheckCircle, XCircle, LogIn, Package, CreditCard, Phone, User, Clock, Hash,
} from 'lucide-react';
import { useCourtOverviewStore } from '@/store/courtOverviewStore';
import {
  overviewApi, BookingDetail, BookingService, AddServiceDto,
} from '@/features/overview/api';
import { Product } from '@/types/product.types';

const { Text } = Typography;
const { TextArea } = Input;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

type PaymentStatus = 'unpaid' | 'partial' | 'paid';
const derivePaymentStatus = (paid: number, total: number): PaymentStatus => {
  if (paid <= 0) return 'unpaid';
  if (paid < total) return 'partial';
  return 'paid';
};

const paymentStatusColor: Record<PaymentStatus, string> = {
  unpaid: 'red',
  partial: 'orange',
  paid: 'green',
};

const bookingStatusConfig: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmed', color: 'blue' },
  checked_in: { label: 'Checked In', color: 'cyan' },
  completed: { label: 'Completed', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' },
};

const fmt = (n: number) => n.toLocaleString('vi-VN');

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BookingDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | null;
  /** The store slot key, e.g. "court1_0630" */
  cellKey: string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = ({
  isOpen,
  onClose,
  bookingId,
  cellKey,
}) => {
  // Store
  const slots = useCourtOverviewStore((s) => s.slots);
  const updateSlotBooking = useCourtOverviewStore((s) => s.updateSlotBooking);
  const revertSlotToAvailable = useCourtOverviewStore((s) => s.revertSlotToAvailable);

  // Local state
  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Cancel form
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Services
  const [products, setProducts] = useState<Product[]>([]);
  const [addingService, setAddingService] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [serviceQty, setServiceQty] = useState(1);
  const [serviceActionLoading, setServiceActionLoading] = useState<string | null>(null);

  // Payment inline edit
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [editPaidAmount, setEditPaidAmount] = useState(0);
  const paymentInputRef = useRef<HTMLInputElement>(null);

  // Preview booking from slot (shown during loading)
  const slotBooking = cellKey ? slots[cellKey]?.booking : null;

  // -------------------------------------------------------------------------
  // 1. LOAD BOOKING DETAIL
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen || !bookingId) {
      setDetail(null);
      setShowCancelForm(false);
      setCancelReason('');
      setIsEditingPayment(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    Promise.all([overviewApi.getBooking(bookingId), delay(200)])
      .then(([data]) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load booking');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [isOpen, bookingId]);

  // Load products for the services section
  useEffect(() => {
    if (!isOpen) return;
    overviewApi.getActiveProducts().then(setProducts).catch(() => {});
  }, [isOpen]);

  // -------------------------------------------------------------------------
  // 2. STATUS ACTIONS
  // -------------------------------------------------------------------------
  const handleCheckIn = useCallback(async () => {
    if (!detail || !cellKey) return;
    Modal.confirm({
      title: 'Check in this customer?',
      content: `${detail.customerName} — ${detail.bookingCode}`,
      okText: 'Check In',
      okType: 'primary',
      onOk: async () => {
        setActionLoading(true);
        try {
          await overviewApi.checkIn(detail.id);
          setDetail((prev) => prev ? { ...prev, status: 'checked_in', checkedInAt: new Date().toISOString() } : prev);
          updateSlotBooking(cellKey, { status: 'confirmed' }); // grid stays 'booked'; update status text
          message.success('Customer checked in');
        } catch {
          message.error('Check-in failed');
        } finally {
          setActionLoading(false);
        }
      },
    });
  }, [detail, cellKey, updateSlotBooking]);

  const handleComplete = useCallback(async () => {
    if (!detail || !cellKey) return;
    Modal.confirm({
      title: 'Mark booking as completed?',
      content: `${detail.customerName} — ${detail.bookingCode}`,
      okText: 'Complete',
      okType: 'primary',
      onOk: async () => {
        setActionLoading(true);
        try {
          await overviewApi.complete(detail.id);
          setDetail((prev) => prev ? { ...prev, status: 'completed', completedAt: new Date().toISOString() } : prev);
          updateSlotBooking(cellKey, { status: 'completed' });
          message.success('Booking completed');
        } catch {
          message.error('Failed to complete booking');
        } finally {
          setActionLoading(false);
        }
      },
    });
  }, [detail, cellKey, updateSlotBooking]);

  const handleCancel = useCallback(async () => {
    if (!detail || !cellKey || !cancelReason.trim()) {
      message.warning('Please enter a cancellation reason');
      return;
    }
    setActionLoading(true);
    try {
      await overviewApi.cancelBooking(detail.id, cancelReason);
      setDetail((prev) => prev ? { ...prev, status: 'cancelled', cancelReason } : prev);
      revertSlotToAvailable(cellKey);
      message.success('Booking cancelled');
      setShowCancelForm(false);
    } catch {
      message.error('Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  }, [detail, cellKey, cancelReason, revertSlotToAvailable]);

  // -------------------------------------------------------------------------
  // 3. SERVICES
  // -------------------------------------------------------------------------
  const handleAddService = useCallback(async () => {
    if (!detail || !selectedProduct) return;
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const dto: AddServiceDto = { productId: product.id, quantity: serviceQty };
    const optimistic: BookingService = {
      id: `temp_${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantity: serviceQty,
      unitPrice: product.price,
      total: product.price * serviceQty,
    };

    // Optimistic
    setDetail((prev) => {
      if (!prev) return prev;
      const newServices = [...prev.services, optimistic];
      const newServiceFee = newServices.reduce((s, sv) => s + sv.total, 0);
      return { ...prev, services: newServices, serviceFee: newServiceFee, totalAmount: prev.courtFee + newServiceFee };
    });

    try {
      const result = await overviewApi.addService(detail.id, dto);
      // Replace optimistic item with real
      setDetail((prev) => {
        if (!prev) return prev;
        const real = (result as any);
        const newServices = prev.services.map((s) =>
          s.id === optimistic.id ? { ...optimistic, id: real.id || optimistic.id } : s,
        );
        return { ...prev, services: newServices };
      });
      setSelectedProduct(null);
      setServiceQty(1);
      message.success('Service added');
    } catch {
      // Rollback
      setDetail((prev) => {
        if (!prev) return prev;
        const newServices = prev.services.filter((s) => s.id !== optimistic.id);
        const newServiceFee = newServices.reduce((s, sv) => s + sv.total, 0);
        return { ...prev, services: newServices, serviceFee: newServiceFee, totalAmount: prev.courtFee + newServiceFee };
      });
      message.error('Failed to add service');
    }
  }, [detail, selectedProduct, serviceQty, products]);

  const handleRemoveService = useCallback(async (service: BookingService) => {
    if (!detail) return;
    setServiceActionLoading(service.id);

    // Optimistic
    const prevServices = detail.services;
    setDetail((prev) => {
      if (!prev) return prev;
      const newServices = prev.services.filter((s) => s.id !== service.id);
      const newServiceFee = newServices.reduce((s, sv) => s + sv.total, 0);
      return { ...prev, services: newServices, serviceFee: newServiceFee, totalAmount: prev.courtFee + newServiceFee };
    });

    try {
      await overviewApi.removeService(detail.id, service.id);
      message.success('Service removed');
    } catch {
      setDetail((prev) => {
        if (!prev) return prev;
        const newServiceFee = prevServices.reduce((s, sv) => s + sv.total, 0);
        return { ...prev, services: prevServices, serviceFee: newServiceFee, totalAmount: prev.courtFee + newServiceFee };
      });
      message.error('Failed to remove service');
    } finally {
      setServiceActionLoading(null);
    }
  }, [detail]);

  // -------------------------------------------------------------------------
  // 4. PAYMENT
  // -------------------------------------------------------------------------
  const handlePaymentSave = useCallback(async () => {
    if (!detail) return;
    const amount = editPaidAmount;
    const newStatus = derivePaymentStatus(amount, detail.totalAmount);

    setIsEditingPayment(false);
    const prevPaid = detail.paidAmount;
    const prevStatus = detail.paymentStatus;

    // Optimistic
    setDetail((prev) => prev ? { ...prev, paidAmount: amount, paymentStatus: newStatus } : prev);
    if (cellKey) updateSlotBooking(cellKey, { paymentStatus: newStatus === 'paid' ? 'paid' : 'pending' });

    try {
      await overviewApi.updatePayment(detail.id, { paymentMode: detail.paymentMode, amount });
      message.success('Payment updated');
    } catch {
      setDetail((prev) => prev ? { ...prev, paidAmount: prevPaid, paymentStatus: prevStatus } : prev);
      if (cellKey) updateSlotBooking(cellKey, { paymentStatus: prevStatus === 'paid' ? 'paid' : 'pending' });
      message.error('Failed to update payment');
    }
  }, [detail, editPaidAmount, cellKey, updateSlotBooking]);

  // -------------------------------------------------------------------------
  // RENDER HELPERS
  // -------------------------------------------------------------------------
  const isTerminal = detail?.status === 'completed' || detail?.status === 'cancelled';

  const serviceColumns = [
    {
      title: 'Item',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 60,
      align: 'center' as const,
    },
    {
      title: 'Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (v: number) => `${fmt(v)}đ`,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 100,
      render: (v: number) => <Text strong>{fmt(v)}đ</Text>,
    },
    ...(!isTerminal
      ? [
          {
            title: '',
            key: 'action',
            width: 40,
            render: (_: any, record: BookingService) => (
              <Popconfirm
                title="Remove this service?"
                onConfirm={() => handleRemoveService(record)}
                okText="Remove"
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  loading={serviceActionLoading === record.id}
                >
                  <XCircle size={14} />
                </Button>
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return (
    <Drawer
      title={
        <div className="flex flex-col">
          <span className="text-xl font-bold text-slate-800 tracking-tight">
            Booking Detail
          </span>
          {(detail || slotBooking) && (
            <span className="text-xs font-medium text-slate-400 mt-0.5">
              {detail?.bookingCode || slotBooking?.bookingCode || ''}
            </span>
          )}
        </div>
      }
      placement="right"
      width={520}
      onClose={onClose}
      open={isOpen}
      destroyOnClose
      closeIcon={
        <div className="text-slate-400 hover:text-slate-700 transition-colors">
          ✕
        </div>
      }
      styles={{
        header: { borderBottom: '1px solid #f1f5f9', padding: '24px' },
        body: { padding: 0 },
      }}
    >
      {/* LOADING STATE */}
      {isLoading && (
        <div className="p-6 space-y-6">
          {/* Show slot summary preview while loading */}
          {slotBooking && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-lg">
                  {slotBooking.customerInitial || slotBooking.customerName?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="font-semibold text-slate-800">{slotBooking.customerName}</div>
                  {slotBooking.phone && (
                    <div className="text-xs text-slate-500">{slotBooking.phone}</div>
                  )}
                </div>
              </div>
            </div>
          )}
          <Skeleton active paragraph={{ rows: 3 }} />
          <Skeleton active paragraph={{ rows: 2 }} />
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      )}

      {/* LOADED STATE */}
      {!isLoading && detail && (
        <Spin spinning={actionLoading} tip="Processing…">
          <div className="p-6 space-y-6">
            {/* ── Header ── */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl shrink-0">
                  {detail.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-800 m-0 truncate">
                      {detail.customerName}
                    </h3>
                    <Tag color={bookingStatusConfig[detail.status]?.color || 'default'}>
                      {bookingStatusConfig[detail.status]?.label || detail.status}
                    </Tag>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Phone size={12} /> {detail.phone}</span>
                    <span className="flex items-center gap-1"><Hash size={12} /> {detail.bookingCode}</span>
                  </div>
                </div>
              </div>

              <Divider className="my-3 border-slate-200" />

              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Court</div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">{detail.courtName}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Time</div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">
                    {detail.startTime} – {detail.endTime}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Date</div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">{detail.date}</div>
                </div>
              </div>
            </div>

            {/* ── Status Action Buttons ── */}
            {!isTerminal && (
              <div className="flex gap-3">
                {detail.status === 'confirmed' && (
                  <Button
                    type="primary"
                    icon={<LogIn size={16} />}
                    size="large"
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 shadow-md shadow-cyan-200 font-medium"
                    onClick={handleCheckIn}
                  >
                    Check In
                  </Button>
                )}
                {detail.status === 'checked_in' && (
                  <Button
                    type="primary"
                    icon={<CheckCircle size={16} />}
                    size="large"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 font-medium"
                    onClick={handleComplete}
                  >
                    Complete
                  </Button>
                )}
                <Button
                  danger
                  icon={<XCircle size={16} />}
                  size="large"
                  className="font-medium"
                  onClick={() => setShowCancelForm(true)}
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* ── Cancel Form ── */}
            {showCancelForm && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                <div className="text-sm font-semibold text-red-700">Cancel Booking</div>
                <TextArea
                  rows={3}
                  placeholder="Enter cancellation reason (required)…"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="rounded-lg"
                />
                <div className="flex gap-2 justify-end">
                  <Button size="small" onClick={() => { setShowCancelForm(false); setCancelReason(''); }}>
                    Back
                  </Button>
                  <Button
                    size="small"
                    danger
                    type="primary"
                    disabled={!cancelReason.trim()}
                    loading={actionLoading}
                    onClick={handleCancel}
                  >
                    Confirm Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* ── Payment Section ── */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CreditCard size={14} className="text-slate-400" />
                Payment
              </h4>
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Court fee</span>
                  <span className="font-medium text-slate-700">{fmt(detail.courtFee)}đ</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Services</span>
                  <span className="font-medium text-slate-700">{fmt(detail.serviceFee)}đ</span>
                </div>
                <Divider className="my-1 border-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">Total</span>
                  <span className="text-lg font-bold text-indigo-700">{fmt(detail.totalAmount)}đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">Paid</span>
                  {isEditingPayment ? (
                    <InputNumber
                      ref={paymentInputRef as any}
                      size="small"
                      value={editPaidAmount}
                      min={0}
                      max={detail.totalAmount}
                      onChange={(v) => setEditPaidAmount(v || 0)}
                      onPressEnter={handlePaymentSave}
                      onBlur={handlePaymentSave}
                      autoFocus
                      className="w-32"
                      formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    />
                  ) : (
                    <span
                      className={`text-lg font-bold cursor-pointer hover:underline ${
                        detail.paymentStatus === 'paid'
                          ? 'text-emerald-600'
                          : detail.paymentStatus === 'partial'
                          ? 'text-orange-600'
                          : 'text-red-600'
                      }`}
                      onClick={() => {
                        if (!isTerminal) {
                          setEditPaidAmount(detail.paidAmount);
                          setIsEditingPayment(true);
                        }
                      }}
                    >
                      {fmt(detail.paidAmount)}đ
                    </span>
                  )}
                </div>
                <div className="flex justify-end">
                  <Tag color={paymentStatusColor[detail.paymentStatus]}>
                    {detail.paymentStatus.toUpperCase()}
                  </Tag>
                </div>
              </div>
            </div>

            {/* ── Services Section ── */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Package size={14} className="text-slate-400" />
                Services
              </h4>

              <Table
                dataSource={detail.services}
                columns={serviceColumns}
                pagination={false}
                rowKey="id"
                size="small"
                locale={{ emptyText: 'No services added' }}
                className="mb-3"
              />

              {/* Add service inline */}
              {!isTerminal && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Product</div>
                      <Select
                        placeholder="Select product"
                        size="small"
                        className="w-full"
                        value={selectedProduct}
                        onChange={setSelectedProduct}
                        options={products.map((p) => ({
                          value: p.id,
                          label: `${p.name} — ${fmt(p.price)}đ`,
                        }))}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                      />
                    </div>
                    <div className="w-16">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Qty</div>
                      <InputNumber
                        size="small"
                        min={1}
                        max={99}
                        value={serviceQty}
                        onChange={(v) => setServiceQty(v || 1)}
                        className="w-full"
                      />
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      disabled={!selectedProduct}
                      loading={addingService}
                      onClick={async () => {
                        setAddingService(true);
                        await handleAddService();
                        setAddingService(false);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Cancel Reason (if cancelled) ── */}
            {detail.status === 'cancelled' && detail.cancelReason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="text-xs font-semibold text-red-600 uppercase mb-1">Cancellation Reason</div>
                <div className="text-sm text-red-800">{detail.cancelReason}</div>
              </div>
            )}
          </div>
        </Spin>
      )}

      {/* No booking selected */}
      {!isLoading && !detail && isOpen && (
        <div className="p-6 flex items-center justify-center h-64 text-slate-400">
          No booking selected
        </div>
      )}
    </Drawer>
  );
};
