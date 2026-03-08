import { PageWrapper } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';

const StaffProfile = () => {
  const { user } = useAuth();

  return (
    <PageWrapper 
      title="My Profile" 
      subtitle="View your shift schedule and details."
    >
      <div className="bg-white p-6 rounded-xl border border-slate-200 min-h-[400px]">
        <h2 className="text-xl font-semibold mb-4">Hello, {user?.name}</h2>
        <p className="text-slate-500">Your personal staff record goes here.</p>
      </div>
    </PageWrapper>
  );
};

export default StaffProfile;
