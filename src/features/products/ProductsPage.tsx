import { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Segmented, Tag } from 'antd';
import { 
  PlusOutlined, 
  AppstoreOutlined,
  BarsOutlined,
  SearchOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { PackageSearch } from 'lucide-react';

import { PageWrapper } from '@/components/layout';
import { EmptyState } from '@/components/common/EmptyState';

import { useProductStore } from '@/store/productStore';
import { Product, ProductCategory } from '@/types/product.types';
import { ProductCard } from './components/ProductCard';
import { ProductFormModal } from './components/ProductFormModal';
import { StockAdjustmentPopover } from './components/StockAdjustmentPopover';

const categoryOptions = [
  { label: 'All', value: 'all' },
  { label: 'Equipment', value: 'equipment' },
  { label: 'Refreshment', value: 'refreshment' },
  { label: 'Merchandise', value: 'merchandise' },
  { label: 'Rental', value: 'rental' },
  { label: 'Other', value: 'other' },
];

const categoryLabels: Record<string, string> = {
  equipment: 'Equipment',
  refreshment: 'Refreshment',
  merchandise: 'Merchandise',
  rental: 'Rental',
  other: 'Other',
};

const ProductsPage = () => {
  const { products, lowStockProducts, isLoading, fetchProducts, fetchLowStock, deleteProduct, updateProduct } = useProductStore();
  
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  useEffect(() => {
    fetchProducts();
    fetchLowStock();
  }, [fetchProducts, fetchLowStock]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateProduct(id, { isActive });
  };

  const filteredProducts = (products || []).filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const columns: ColumnsType<Product> = [
    {
      title: 'Item',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleEdit(record)}>
          {record.imageUrl ? (
            <img src={record.imageUrl} alt={record.name} className="w-10 h-10 rounded-md object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
              No Img
            </div>
          )}
          <div>
            <div className="font-semibold text-slate-800 hover:text-indigo-600 transition-colors">
              {record.name}
            </div>
            {record.isService && <Tag color="magenta" className="mt-1">Service</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: 'SKU / Barcode',
      dataIndex: 'sku',
      key: 'sku',
      render: (sku: string) => sku || <span className="text-slate-400">N/A</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => <Tag>{categoryLabels[cat] || cat}</Tag>,
    },
    {
      title: 'Cost',
      dataIndex: 'costPrice',
      key: 'costPrice',
      render: (val: number) => `$${(val || 0).toFixed(2)}`,
      sorter: (a, b) => (a.costPrice || 0) - (b.costPrice || 0),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (val: number) => `$${val.toFixed(2)}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Stock',
      key: 'stock',
      render: (_, record) => {
        if (record.isService) return <span className="text-slate-400">-</span>;
        const stock = record.stock || 0;
        const isLow = stock < 5;
        return (
          <div className="flex items-center gap-2">
            {isLow ? (
              <span className="text-amber-600 font-semibold">{stock} (Low)</span>
            ) : (
              <span>{stock}</span>
            )}
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2">
              <StockAdjustmentPopover productId={record.id} type="subtract" currentStock={stock} />
              <StockAdjustmentPopover productId={record.id} type="add" currentStock={stock} />
            </div>
          </div>
        );
      },
      sorter: (a, b) => (a.stock || 0) - (b.stock || 0),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        active ? <Tag color="success">Active</Tag> : <Tag color="default">Hidden</Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Hidden', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
  ];

  return (
    <PageWrapper
      title="Products & Services"
      subtitle="Manage your inventory, rentals, and coaching services"
      action={
        <div className="flex items-center gap-4">
          {lowStockProducts.length > 0 && (
            <Tag color="warning" className="text-sm px-3 py-1 flex items-center gap-2 border-amber-200 bg-amber-50 text-amber-700">
              <PackageSearch size={16} />
              <span>{lowStockProducts.length} items low on stock</span>
            </Tag>
          )}
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingProduct(undefined);
              setIsFormOpen(true);
            }}
          >
            Add Item
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Card className="shadow-sm border-slate-200" bodyStyle={{ padding: '16px 24px' }}>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <Input
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search items..."
              className="md:w-64"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />

            <Segmented
              options={categoryOptions}
              value={activeCategory}
              onChange={(val) => setActiveCategory(val as ProductCategory | 'all')}
              className="overflow-x-auto max-w-full"
            />

            <Segmented
              options={[
                { value: 'grid', icon: <AppstoreOutlined /> },
                { value: 'table', icon: <BarsOutlined /> },
              ]}
              value={viewMode}
              onChange={(val) => setViewMode(val as 'grid' | 'table')}
            />
          </div>
        </Card>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))}
            {filteredProducts.length === 0 && !isLoading && (
              <div className="col-span-full py-12 text-center text-slate-500">
                No products found matching your criteria.
              </div>
            )}
          </div>
        ) : (
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <Table
              columns={columns}
              dataSource={filteredProducts}
              rowKey="id"
              loading={isLoading}
              locale={{
                emptyText: (
                  <EmptyState 
                    icon={<PackageSearch size={32} />}
                    title="No Products Found"
                    description={searchText ? "No products match your search criteria." : "You haven't added any products or services yet."}
                    actionText={!searchText ? "Add First Item" : undefined}
                    onAction={() => {
                      setEditingProduct(undefined);
                      setIsFormOpen(true);
                    }}
                  />
                )
              }}
              pagination={{
                total: filteredProducts.length,
                pageSize: 10,
                showSizeChanger: true,
              }}
              scroll={{ x: 800 }}
            />
          </Card>
        )}

        <ProductFormModal 
          open={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          product={editingProduct} 
        />
      </div>
    </PageWrapper>
  );
};

export default ProductsPage;
