import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';
import { RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-slate-100">
            <Result
              status="500"
              title={<span className="text-2xl font-bold text-slate-800">Oops! Something went wrong.</span>}
              subTitle={
                <div className="text-slate-500 mt-2 mb-6 text-base">
                  An unexpected error has occurred. Our team has been notified.
                  <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-mono text-left overflow-auto max-h-32">
                    {this.state.error?.message || 'Unknown error'}
                  </div>
                </div>
              }
              extra={
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<RefreshCcw size={16} />} 
                  onClick={() => window.location.reload()}
                  className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-xl"
                >
                  Reload Application
                </Button>
              }
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
