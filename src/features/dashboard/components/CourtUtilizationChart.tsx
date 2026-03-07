import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CourtUtilizationData } from '@/types/dashboard.types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CourtUtilizationChartProps {
  data: CourtUtilizationData[];
}

export const CourtUtilizationChart: React.FC<CourtUtilizationChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map((d) => d.courtName),
    datasets: [
      {
        label: 'Utilization %',
        data: data.map((d) => d.utilization),
        backgroundColor: 'rgb(16, 185, 129)', // emerald-500
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
             return `${context.parsed.x}%`;
          }
        }
      }
    },
    scales: {
      x: {
        min: 0,
        max: 100,
        grid: {
          color: '#f1f5f9', // slate-100
        },
        border: { display: false },
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        }
      },
      y: {
        grid: {
          display: false,
        },
        border: { display: false }
      }
    },
  };

  return <div className="h-[250px] w-full"><Bar options={options} data={chartData} /></div>;
};
