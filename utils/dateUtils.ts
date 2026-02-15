
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, startOfMonth, endOfMonth, isToday, isYesterday } from 'date-fns';

export const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');

export const getWeekDays = (date: Date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const getMonthDateRange = () => {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now)
  };
};

export const getDayName = (date: Date) => format(date, 'EEE');
export const getDayNumber = (date: Date) => format(date, 'd');

export const getRelativeDateLabel = (date: Date) => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d');
};
