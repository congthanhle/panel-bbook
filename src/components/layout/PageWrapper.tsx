import { ReactNode } from 'react';

export interface PageWrapperProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const PageWrapper = ({ title, subtitle, action, children, className = '' }: PageWrapperProps) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-[calc(100vh-64px)] flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 mb-1">{title}</h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-slate-500 font-medium">{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="flex items-center gap-3 shrink-0">
            {action}
          </div>
        )}
      </div>

      {/* Page Content */}
      <div className={`flex-1 ${className}`}>
        {children}
      </div>
    </div>
  );
};
