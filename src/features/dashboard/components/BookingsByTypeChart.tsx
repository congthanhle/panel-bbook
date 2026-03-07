import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { BookingTypeData } from '@/types/dashboard.types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface BookingsByTypeChartProps {
  data: BookingTypeData[];
}

export const BookingsByTypeChart: React.FC<BookingsByTypeChartProps> = ({ data }) => {
  const backgroundColors = [
    'rgb(59, 130, 246)', // blue-500
    'rgb(16, 185, 129)', // emerald-500
    'rgb(245, 158, 11)', // amber-500
    'rgb(139, 92, 246)', // violet-500
  ];

  const chartData = {
    labels: data.map((d) => d.type),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: backgroundColors.slice(0, data.length),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 13,
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return <div className="h-[300px] w-full"><Doughnut data={chartData} options={options} /></div>;
};
