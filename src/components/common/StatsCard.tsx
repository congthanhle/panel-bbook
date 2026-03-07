import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Using clsx and tailwind-merge directly to avoid unknown imports
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface StatsCardProps {
  title: string;
  value: number;
  prefix?: React.ReactNode;
  trend?: number; // percentage
  color?: 'blue' | 'emerald' | 'indigo' | 'amber';
  isCurrency?: boolean;
  isPercentage?: boolean;
}

const colorStyles = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  amber: 'bg-amber-50 text-amber-600',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  prefix,
  trend,
  color = 'blue',
  isCurrency = false,
  isPercentage = false,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000; // 1 second animation

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function: easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      setDisplayValue(value * easeProgress);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: isCurrency ? 'currency' : 'decimal',
    currency: 'USD',
    maximumFractionDigits: isPercentage || !Number.isInteger(value) ? 1 : 0,
  }).format(isPercentage ? displayValue : Math.round(displayValue));

  const displayString = isPercentage ? `${formattedValue}%` : formattedValue;

  return (
    <Card 
      className="shadow-sm hover:shadow-md transition-shadow duration-300 border-slate-200"
      bodyStyle={{ padding: '24px' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">
            {displayString}
          </h3>
          
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span 
                className={cn(
                  "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full",
                  trend >= 0 ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
                )}
              >
                {trend >= 0 ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                {Math.abs(trend)}%
              </span>
              <span className="text-xs text-slate-400 ml-1">vs last period</span>
            </div>
          )}
        </div>
        
        {prefix && (
          <div className={cn("p-3 rounded-xl flex items-center justify-center", colorStyles[color])}>
            {prefix}
          </div>
        )}
      </div>
    </Card>
  );
};
