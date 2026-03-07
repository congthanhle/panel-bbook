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
import { PeakHourData } from '@/types/dashboard.types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PeakHoursBarChartProps {
  data: PeakHourData[];
}

export const PeakHoursBarChart: React.FC<PeakHoursBarChartProps> = ({ data }) => {
  // Find top 3
  const sortedData = [...data].sort((a, b) => b.bookings - a.bookings);
  const top3Threshold = sortedData.length >= 3 ? sortedData[2].bookings : 0;

  const chartData = {
    labels: data.map((d) => d.hour),
    datasets: [
      {
        label: 'Bookings',
        data: data.map((d) => d.bookings),
        backgroundColor: data.map((d) => 
          d.bookings >= top3Threshold ? 'rgb(59, 130, 246)' : 'rgba(59, 130, 246, 0.2)'
        ),
        borderRadius: 4,
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
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9', // slate-100
        },
        border: { display: false }
      },
      x: {
        grid: {
          display: false,
        },
        border: { display: false }
      }
    },
  };

  return <div className="h-[250px] w-full"><Bar options={options} data={chartData} /></div>;
};
