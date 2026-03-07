import { PageWrapper } from '@/components/layout';
import { Button } from 'antd';
import { Plus } from 'lucide-react';

const Shifts = () => {
  return (
    <PageWrapper 
      title="Staff Shifts" 
      subtitle="Manage working hours and schedules."
      action={<Button type="primary" icon={<Plus size={16} />}>Assign Shift</Button>}
    >
      <div className="bg-white p-6 rounded-xl border border-slate-200 min-h-[400px]">
        <p className="text-slate-500">Shift Management Table goes here.</p>
      </div>
    </PageWrapper>
  );
};

export default Shifts;
