import dayjs from '@/lib/dayjs';

export const formatDate = (date: string | Date, format = 'MMM D, YYYY') => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date, format = 'MMM D, YYYY h:mm A') => {
  return dayjs(date).format(format);
};

export const formatTime = (time: string | Date, format = 'h:mm A') => {
  return dayjs(time, 'HH:mm').format(format);
};
