import { ChartData, TooltipItem } from 'chart.js';
import dayjs from 'dayjs';
import { 
  RevenueData, 
  PeakHourData, 
  CourtUtilizationData, 
  BookingTypeData 
} from '@/types/dashboard.types';
import { formatVND } from '@/utils/format';

export const mapRevenueToChart = (
  data: RevenueData[],
  dateFrom?: string,
  dateTo?: string
): ChartData<'line'> => {
  if (!data || data.length === 0) {
    if (!dateFrom || !dateTo) return { labels: [], datasets: [] };
  }

  // Sort data conditionally to find min/max if dates not provided
  let start = dateFrom ? dayjs(dateFrom) : dayjs(data[0]?.date);
  let end = dateTo ? dayjs(dateTo) : dayjs(data[data.length - 1]?.date || start);

  // If no date range provided, ensure we span the min/max of data found
  if (!dateFrom || !dateTo) {
    data.forEach(d => {
      const current = dayjs(d.date);
      if (current.isBefore(start)) start = current;
      if (current.isAfter(end)) end = current;
    });
  }

  const daysDiff = end.diff(start, 'day');
  const labels: string[] = [];
  const chartData: number[] = [];

  for (let i = 0; i <= daysDiff; i++) {
    const currentDay = start.add(i, 'day');
    const dateStr = currentDay.format('YYYY-MM-DD');
    const displayLabel = currentDay.format('DD/MM');
    
    labels.push(displayLabel);
    
    const existingData = data.find((d) => d.date === dateStr);
    chartData.push(existingData ? existingData.revenue : 0);
  }

  return {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: chartData,
        borderColor: '#4f46e5', // Tailwind indigo-600
        backgroundColor: 'rgba(79, 70, 229, 0.2)', // Fill gradient primary color
        fill: true,
        tension: 0.4,
      },
    ],
  };
};

export const mapPeakHoursToChart = (data: PeakHourData[]): ChartData<'bar'> => {
  if (!data || data.length === 0) return { labels: [], datasets: [] };

  // Sort by hour ascending
  const sortedData = [...data].sort((a, b) => a.hour.localeCompare(b.hour));

  // Highlight top 3 bars
  const sortedByBookings = [...sortedData].sort((a, b) => b.bookings - a.bookings);
  const top3Hours = sortedByBookings.slice(0, 3).map(d => d.hour);

  const labels = sortedData.map(d => d.hour);
  const chartData = sortedData.map(d => d.bookings);
  const backgroundColors = sortedData.map(d => 
    top3Hours.includes(d.hour) ? '#10b981' : '#c7d2fe' // emerald-500 : indigo-200
  );

  return {
    labels,
    datasets: [
      {
        label: 'Bookings',
        data: chartData,
        backgroundColor: backgroundColors,
        borderRadius: 4,
      },
    ],
  };
};

export const mapUtilizationToChart = (data: CourtUtilizationData[]): ChartData<'bar'> => {
  if (!data || data.length === 0) return { labels: [], datasets: [] };

  const labels = data.map(d => d.courtName);
  const chartData = data.map(d => d.utilization);
  const backgroundColors = data.map(d => {
    if (d.utilization > 70) return '#10b981'; // emerald-500
    if (d.utilization >= 40) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  });

  return {
    labels,
    datasets: [
      {
        label: 'Utilization %',
        data: chartData,
        backgroundColor: backgroundColors,
        // Using indexAxis: 'y' on the ChartOptions in the component rather than here 
        // to conform to ChartJS v3/v4 types without type clash.
      },
    ],
  };
};

export const mapBookingsByTypeToChart = (data: BookingTypeData[]): ChartData<'doughnut'> => {
  if (!data || data.length === 0) return { labels: [], datasets: [] };

  const customColors: Record<string, string> = {
    'badminton': '#4f46e5', // indigo-600
    'pickleball': '#10b981', // emerald-500
    'tennis': '#f59e0b', // amber-500
    'futsal': '#ef4444', // red-500
  };

  const labels = data.map(d => d.type);
  const chartData = data.map(d => d.count);
  const backgroundColors = data.map(d => customColors[d.type.toLowerCase()] || '#94a3b8');

  return {
    labels,
    datasets: [
      {
        label: 'Bookings',
        data: chartData,
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };
};

// Custom tooltip callback for Currency (VND) formatting
export const currencyTooltipCallback = (context: TooltipItem<'line' | 'bar'>) => {
  let label = context.dataset.label || '';
  if (label) {
    label += ': ';
  }
  if (context.parsed.y !== null) {
    label += formatVND(context.parsed.y);
  }
  return label;
};
