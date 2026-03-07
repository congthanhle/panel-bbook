import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { RevenueData } from '@/types/dashboard.types';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface RevenueLineChartProps {
  data: RevenueData[];
}

export const RevenueLineChart: React.FC<RevenueLineChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map((d) => dayjs(d.date).format('MMM D')),
    datasets: [
      {
        fill: true,
        label: 'Revenue',
        data: data.map((d) => d.revenue),
        borderColor: 'rgb(79, 70, 229)', // indigo-600
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9', // slate-100
        },
        border: {
          display: false,
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value;
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return <div className="h-[300px] w-full"><Line options={options} data={chartData} /></div>;
};
