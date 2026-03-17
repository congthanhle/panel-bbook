import { useState } from 'react';
import { Popover, InputNumber, Button, message } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useProductStore } from '@/store/productStore';

interface Props {
  productId: string;
  type: 'add' | 'subtract';
  currentStock: number;
}

export const StockAdjustmentPopover = ({ productId, type, currentStock }: Props) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const { adjustStock } = useProductStore();
  const [loading, setLoading] = useState(false);

  const handleAdjust = async () => {
    if (!amount || amount <= 0) return;
    
    // If subtracting, ensure we don't drop below 0
    if (type === 'subtract' && amount > currentStock) {
      message.error("Cannot deduct more than current stock");
      return;
    }

    try {
      setLoading(true);
      const adjustment = type === 'add' ? amount : -amount;
      const reason = type === 'add' ? 'Manual Restock' : 'Manual Deduction';
      
      await adjustStock(productId, adjustment, reason);
      message.success(`Stock ${type === 'add' ? 'added' : 'deducted'} successfully`);
      setOpen(false);
      setAmount(null);
    } catch (error: any) {
      message.error(error.message || 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="flex flex-col gap-3 min-w-[200px]">
      <div className="text-sm text-slate-600 mb-1">
        {type === 'add' ? 'Add Stock' : 'Deduct Stock'}
      </div>
      <InputNumber 
        min={1} 
        value={amount} 
        onChange={setAmount} 
        placeholder="Enter amount..."
        className="w-full"
        onPressEnter={handleAdjust}
      />
      <div className="flex justify-end gap-2 mt-2">
        <Button size="small" onClick={() => setOpen(false)}>Cancel</Button>
        <Button 
          size="small" 
          type="primary" 
          danger={type === 'subtract'}
          onClick={handleAdjust}
          loading={loading}
          disabled={!amount || amount <= 0}
        >
          Confirm
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      title={type === 'add' ? "Restock Item" : "Deduct Inventory"}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottom"
    >
      <Button 
        size="small" 
        type="text" 
        icon={type === 'add' ? <PlusOutlined /> : <MinusOutlined />} 
        className={type === 'add' ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"}
      />
    </Popover>
  );
};
