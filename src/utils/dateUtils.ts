import { format } from 'date-fns';

export const formatDate = (date: string | Date, formatString: string = 'dd/MM/yyyy'): string => {
  return format(new Date(date), formatString);
};

export const calculateDaysDifference = (startDate: string | Date, endDate: string | Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

export const formatDateRange = (startDate: string | Date, endDate: string | Date): string => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  const days = calculateDaysDifference(startDate, endDate);
  return `${start} - ${end} (${days} day${days === 1 ? '' : 's'})`;
};