import { PageWrapper } from '@/components/layout';
import { Button } from 'antd';
import { Plus } from 'lucide-react';

const Bookings = () => {
  return (
    <PageWrapper 
      title="Bookings" 
      subtitle="Manage your schedule and customer reservations."
      action={<Button type="primary" icon={<Plus size={16} />}>New Booking</Button>}
    >
      <div className="bg-white p-6 rounded-xl border border-slate-200 min-h-[400px]">
        <p className="text-slate-500">Booking Calendar Component goes here.</p>
      </div>
    </PageWrapper>
  );
};

export default Bookings;
