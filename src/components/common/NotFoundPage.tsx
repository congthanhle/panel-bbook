import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

const { Title, Text } = Typography;

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-4 w-full">
      {/* CSS Art Shuttlecock */}
      <div className="relative w-32 h-32 mb-8 animate-bounce" style={{ animationDuration: '2s' }}>
        {/* Cork base */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-10 bg-amber-200 rounded-b-full rounded-t-lg z-20 border-2 border-amber-300 shadow-inner"></div>
        {/* Feathers base wrap */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-14 h-4 bg-red-500 rounded-full z-30"></div>
        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 w-14 h-4 bg-white/50 rounded-full z-30"></div>
        {/* Feathers */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-28 h-20 flex justify-between px-1 z-10">
          <div className="w-4 h-full bg-white rounded-t-full origin-bottom rotate-[-25deg] shadow-sm border border-slate-100"></div>
          <div className="w-4 h-full bg-slate-50 rounded-t-full origin-bottom rotate-[-15deg] shadow-sm border border-slate-100"></div>
          <div className="w-4 h-full bg-white rounded-t-full origin-bottom rotate-[-5deg] shadow-sm border border-slate-100 z-10"></div>
          <div className="w-4 h-full bg-slate-50 rounded-t-full origin-bottom rotate-[5deg] shadow-sm border border-slate-100 z-10"></div>
          <div className="w-4 h-full bg-white rounded-t-full origin-bottom rotate-[15deg] shadow-sm border border-slate-100"></div>
          <div className="w-4 h-full bg-slate-50 rounded-t-full origin-bottom rotate-[25deg] shadow-sm border border-slate-100"></div>
        </div>
      </div>

      <Title level={1} className="!text-slate-800 !mb-2 !text-5xl">404</Title>
      <Title level={3} className="!text-slate-700 !mt-0 !mb-4">Out of Bounds!</Title>
      <Text className="text-slate-500 text-lg max-w-md block mb-8">
        Looks like your shot landed outside the court lines. The page you are looking for doesn't exist or has been moved.
      </Text>
      
      <Button 
        type="primary" 
        size="large" 
        icon={<LayoutDashboard size={18} />} 
        onClick={() => navigate('/dashboard')}
        className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-xl font-medium"
      >
        Back to Court (Dashboard)
      </Button>
    </div>
  );
};
