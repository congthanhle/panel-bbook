import { useLocation } from 'react-router-dom';
import { Card, Input, Button, Form, Checkbox, App } from 'antd';
import { LogIn, User, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const { login, isLoading } = useAuth();
  const location = useLocation();
  const { message } = App.useApp();

  const from = location.state?.from?.pathname || '/dashboard';

  const onFinish = async (values: any) => {
    const { email, password } = values;
    const result = await login({ email, password }, from);
    
    if (result.success) {
      message.success('Welcome back to CourtOS');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-950 overflow-hidden font-sans">
      {/* Decorative Badminton Court CSS Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
         {/* Green base with gradient overlay */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/30 via-slate-950 to-slate-950" />
         
         {/* Court Lines Map */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[1000px] border-4 border-emerald-500/30 rounded-sm transform rotate-45 scale-150 blur-[2px]">
            {/* Center Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-emerald-500/30 -translate-y-1/2" />
            
            {/* Short Service Lines */}
            <div className="absolute top-[35%] left-0 w-full h-[2px] bg-emerald-500/30" />
            <div className="absolute bottom-[35%] left-0 w-full h-[2px] bg-emerald-500/30" />
            
            {/* Center bounds */}
            <div className="absolute top-[35%] left-1/2 w-[2px] h-[30%] bg-emerald-500/30 -translate-x-1/2" />
         </div>

         {/* Grain/Noise Overlay */}
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30 mix-blend-overlay" />
      </div>

      <div className="z-10 w-full max-w-[420px] relative">
        {/* Glowing backdrop effect behind the card */}
        <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-emerald-500/20 via-primary-500/10 to-transparent blur-xl opacity-50 pointer-events-none" />
        
        <Card 
          className="border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-3xl"
          styles={{ body: { padding: '2.5rem 2rem' } }}
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-primary-600/20 text-emerald-400 mb-6 ring-1 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <LogIn size={28} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl tracking-tight font-extrabold text-white mb-2">CourtOS</h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">Admin Operations Deck</p>
          </div>

          <Form 
            layout="vertical" 
            onFinish={onFinish}
            requiredMark={false}
            className="space-y-4"
          >
            <Form.Item 
              name="email" 
              rules={[
                { required: true, message: 'Email sequence required' },
                { type: 'email', message: 'Invalid protocol format' }
              ]}
            >
              <Input 
                size="large" 
                placeholder="admin@courtos.vn" 
                prefix={<User size={18} className="text-slate-500 mr-2" />}
                className="bg-slate-950/50 border-white/5 hover:border-emerald-500/30 text-white focus:bg-white focus:text-slate-900 hover:text-black placeholder-slate-600 h-12 rounded-xl transition-colors"
              />
            </Form.Item>

            <Form.Item 
              name="password" 
              rules={[
                { required: true, message: 'Access key required' },
                { min: 6, message: 'Key must be at least 6 characters' }
              ]}
              className="mb-6"
            >
              <Input.Password 
                size="large" 
                placeholder="••••••••" 
                prefix={<LockKeyhole size={18} className="text-slate-500 mr-2" />}
                className="bg-slate-950/50 border-white/5 hover:border-emerald-500/30 focus-within:bg-white focus-within:text-slate-900 text-white placeholder-slate-600 h-12 rounded-xl transition-colors [&>input]:text-inherit [&>input]:bg-transparent"
              />
            </Form.Item>

            <div className="flex items-center justify-between mb-8">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="text-slate-400 hover:text-slate-300">
                  <span className="text-sm">Keep sequence active</span>
                </Checkbox>
              </Form.Item>
              <a href="#" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                Recover key?
              </a>
            </div>

            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              loading={isLoading} 
              className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-semibold tracking-wide border-0"
            >
              Initialize Override
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
