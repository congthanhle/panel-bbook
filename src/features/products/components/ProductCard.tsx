import { Card, Tag, Switch, Typography, Button } from 'antd';
import { EditOutlined, DeleteOutlined, AlertOutlined, ShoppingCartOutlined, ToolOutlined } from '@ant-design/icons';
import { Product } from '@/types/product.types';

interface Props {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

const categoryColors: Record<string, string> = {
  equipment_rental: 'blue',
  beverage: 'cyan',
  snack: 'orange',
  shuttle_cock: 'green',
  coaching: 'purple',
  other: 'default',
};

const categoryLabels: Record<string, string> = {
  equipment_rental: 'Rental',
  beverage: 'Beverage',
  snack: 'Snack',
  shuttle_cock: 'Shuttlecock',
  coaching: 'Coaching',
  other: 'Other',
};

export const ProductCard = ({ product, onEdit, onDelete, onToggleActive }: Props) => {
  const isLowStock = !product.isService && product.stock !== undefined && product.stock < 5;

  return (
    <Card
      hoverable
      className="overflow-hidden flex flex-col h-full border-slate-200"
      bodyStyle={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}
      cover={
        <div className="relative h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img 
              alt={product.name} 
              src={product.imageUrl} 
              className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${!product.isActive ? 'grayscale opacity-60' : ''}`}
            />
          ) : (
            product.isService ? 
              <ToolOutlined className="text-4xl text-slate-300" /> : 
              <ShoppingCartOutlined className="text-4xl text-slate-300" />
          )}
          
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Tag color={categoryColors[product.category]} className="m-0 shadow-sm font-medium">
              {categoryLabels[product.category]}
            </Tag>
            {product.isService && (
              <Tag color="magenta" className="m-0 shadow-sm font-medium">Service</Tag>
            )}
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-2">
            {!product.isActive && <Tag color="error" className="m-0 border-none shadow-sm font-medium">Inactive</Tag>}
          </div>

          {isLowStock && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 shadow-sm border border-amber-200">
                <AlertOutlined /> Low Stock: Only {product.stock} left
              </div>
            </div>
          )}
        </div>
      }
      actions={[
        <Switch
          key="active"
          checked={product.isActive}
          onChange={(checked) => onToggleActive(product.id, checked)}
          checkedChildren="Active"
          unCheckedChildren="Hidden"
          size="small"
        />,
        <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => onEdit(product)} className="text-slate-500 hover:text-indigo-600" />,
        <Button key="delete" type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(product.id)} />,
      ]}
    >
      <div className="p-4 flex-1 flex flex-col">
        <Typography.Title level={5} className="!mb-1 !text-slate-800 line-clamp-1">
          {product.name}
        </Typography.Title>
        <div className="text-xl font-bold text-indigo-600 mb-2">
          ${product.price.toFixed(2)} <span className="text-sm font-normal text-slate-400">/ {product.unit}</span>
        </div>
        
        {product.description && (
          <p className="text-sm text-slate-500 line-clamp-2 mt-auto mb-0">
            {product.description}
          </p>
        )}
        
        {!product.isService && product.stock !== undefined && !isLowStock && (
          <div className="text-sm text-slate-500 mt-3 pt-3 border-t border-slate-100">
            Stock: <span className="font-semibold text-slate-700">{product.stock}</span> units
          </div>
        )}
      </div>
    </Card>
  );
};
