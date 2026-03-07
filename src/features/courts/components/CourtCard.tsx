import React from 'react';
import { Card, Tag, Button, Dropdown, MenuProps } from 'antd';
import { Edit2, DollarSign, Trash2, MoreVertical, CalendarClock } from 'lucide-react';
import { Court } from '@/types/court.types';
import { useAuthStore } from '@/store/authStore';

interface CourtCardProps {
  court: Court;
  onEdit: (court: Court) => void;
  onPricing: (court: Court) => void;
  onLock: (court: Court) => void;
  onDelete: (court: Court) => void;
}

export const CourtCard: React.FC<CourtCardProps> = ({ court, onEdit, onPricing, onLock, onDelete }) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Fallback image if none provided
  const imageUrl = court.imageUrl || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';

  const typeConfig: Record<string, { color: string, label: string }> = {
    badminton: { color: 'blue', label: 'Badminton' },
    pickleball: { color: 'green', label: 'Pickleball' },
    tennis: { color: 'orange', label: 'Tennis' },
    futsal: { color: 'cyan', label: 'Futsal' },
  };

  const statusConfig = {
    active: { badgeUrl: 'bg-emerald-500', bgUrl: 'bg-emerald-50 text-emerald-700', label: 'Active' },
    inactive: { badgeUrl: 'bg-slate-400', bgUrl: 'bg-slate-100 text-slate-600', label: 'Inactive' },
  };

  const currentStatus = statusConfig[court.status] || statusConfig.inactive;
  const currentType = typeConfig[court.type] || { color: 'default', label: court.type };

  // Dropdown menu items for Admin
  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <Edit2 size={16} />,
      label: 'Edit Court Details',
      onClick: () => onEdit(court),
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <Trash2 size={16} />,
      label: 'Delete Court',
      danger: true,
      onClick: () => onDelete(court),
    },
  ];

  return (
    <Card 
      hoverable
      className="overflow-hidden rounded-2xl border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
      styles={{ body: { padding: 0 } }}
    >
      {/* Image Cover */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img 
          src={imageUrl} 
          alt={court.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Status overlay badge */}
        <div className="absolute top-4 left-4">
          <div className={`px-2.5 py-1 rounded-full backdrop-blur-md bg-white/90 border border-white/20 shadow-sm flex items-center gap-1.5 text-xs font-semibold ${currentStatus.bgUrl}`}>
             <span className={`w-2 h-2 rounded-full ${currentStatus.badgeUrl}`} />
             {currentStatus.label}
          </div>
        </div>
        {/* Admin context menu */}
        {isAdmin && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
              <Button 
                type="text" 
                icon={<MoreVertical size={18} className="text-white drop-shadow-md" />} 
                className="bg-black/20 hover:bg-black/40 backdrop-blur-md border-0 w-8 h-8 rounded-full flex justify-center items-center"
              />
            </Dropdown>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start gap-2 mb-2">
           <h3 className="font-bold text-lg text-slate-800 leading-tight m-0">{court.name}</h3>
           <Tag color={currentType.color} className="m-0 border-transparent capitalize font-medium shrink-0">
             {currentType.label}
           </Tag>
        </div>
        
        <p className="text-slate-500 text-sm line-clamp-2 min-h-[40px] mb-5">
          {court.description || 'No description provided for this court.'}
        </p>

        {/* Action Bar */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
          <Button 
            className="flex items-center justify-center gap-2 h-10 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 font-medium"
            onClick={() => onPricing(court)}
          >
            <DollarSign size={16} /> Pricing
          </Button>
          <Button 
            className="flex items-center justify-center gap-2 h-10 border-slate-200 hover:border-amber-500 hover:text-amber-600 font-medium"
            onClick={() => onLock(court)}
          >
            <CalendarClock size={16} /> Block Slots
          </Button>
        </div>
      </div>
    </Card>
  );
};
