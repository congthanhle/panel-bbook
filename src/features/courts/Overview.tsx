import { PageWrapper } from '@/components/layout';

const Overview = () => {
  return (
    <PageWrapper title="Court Overview" subtitle="Real-time map and status of your facility.">
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <p className="text-slate-500">Live Court Map Component goes here.</p>
      </div>
    </PageWrapper>
  );
};

export default Overview;
