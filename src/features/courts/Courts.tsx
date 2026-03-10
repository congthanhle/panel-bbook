import { useEffect, useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button, Input, Segmented, Skeleton, Empty } from 'antd';
import { Plus, Search } from 'lucide-react';
import { useCourtStore } from '@/store/courtStore';
import { Court, CourtType } from '@/types/court.types';
import { useAuthStore } from '@/store/authStore';

// Components
import { CourtCard } from './components/CourtCard';
import { CourtFormDrawer } from './components/CourtFormDrawer';
import { PricingDrawer } from './components/PricingDrawer';
import { CourtLockModal } from './components/CourtLockModal';

const Courts = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  
  const courts = useCourtStore(state => state.courts);
  const isLoading = useCourtStore(state => state.isLoading);
  const fetchAll = useCourtStore(state => state.fetchAll);
  const remove = useCourtStore(state => state.remove);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<CourtType | 'all'>('all');

  // Modals state
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [pricingDrawerOpen, setPricingDrawerOpen] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [activeCourt, setActiveCourt] = useState<Court | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredCourts = useMemo(() => {
    return courts.filter(court => {
      const matchesSearch = court.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || court.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [courts, searchQuery, filterType]);

  // Actions
  const handleAddClick = () => {
    setActiveCourt(null);
    setFormDrawerOpen(true);
  };

  const handleEditClick = (court: Court) => {
     setActiveCourt(court);
     setFormDrawerOpen(true);
  };
  
  const handlePricingClick = (court: Court) => {
     setActiveCourt(court);
     setPricingDrawerOpen(true);
  };
  
  const handleLockClick = (court: Court) => {
     setActiveCourt(court);
     setLockModalOpen(true);
  };
  
  const handleDeleteClick = (court: Court) => {
     remove(court.id);
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100">
                <Skeleton.Image className="w-full h-40 mb-4" />
                <Skeleton active paragraph={{ rows: 2 }} />
             </div>
          ))}
        </div>
      );
    }

    if (filteredCourts.length === 0) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 py-16 flex justify-center">
           <Empty 
             description={<span className="text-slate-500 text-lg">No courts found matching your filters.</span>}
             image={Empty.PRESENTED_IMAGE_SIMPLE}
           />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourts.map(court => (
          <CourtCard 
            key={court.id} 
            court={court} 
            onEdit={handleEditClick}
            onPricing={handlePricingClick}
            onLock={handleLockClick}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>
    );
  };

  return (
    <PageWrapper 
      title="Court Management" 
      subtitle="Manage your physical courts, their statuses, and specific pricing."
      action={
        isAdmin ? (
          <Button 
            type="primary" 
            icon={<Plus size={16} />} 
            className="bg-indigo-600 hover:bg-indigo-500 border-indigo-600 hover:border-indigo-500 h-10 px-5 shadow-sm"
            onClick={handleAddClick}
          >
            Add New Court
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
           <Input 
             placeholder="Search courts by name..." 
             prefix={<Search size={16} className="text-slate-400" />}
             className="w-full sm:max-w-xs h-10 bg-slate-50"
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
           />
           
           <div className="overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
             <Segmented 
                options={[
                  { label: 'All Types', value: 'all' },
                  { label: 'Badminton', value: 'badminton' },
                  { label: 'Pickleball', value: 'pickleball' },
                  { label: 'Tennis', value: 'tennis' },
                  { label: 'Futsal', value: 'futsal' },
                ]}
                value={filterType}
                onChange={(val) => setFilterType(val as any)}
                className="bg-slate-100 p-1 rounded-lg font-medium"
             />
           </div>
        </div>

        {/* Content */}
        {renderContent()}

        {/* Modals & Drawers */}
        <CourtFormDrawer 
           isOpen={formDrawerOpen} 
           onClose={() => setFormDrawerOpen(false)} 
           court={activeCourt} 
        />
        
        <PricingDrawer 
           isOpen={pricingDrawerOpen} 
           onClose={() => setPricingDrawerOpen(false)} 
           court={activeCourt} 
        />
        
        <CourtLockModal 
           isOpen={lockModalOpen} 
           onClose={() => setLockModalOpen(false)} 
           court={activeCourt} 
        />
      </div>
    </PageWrapper>
  );
};

export default Courts;
