
import React from 'react';
import { format, isSameDay, isToday, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { storage } from '../services/storage';

interface WeekCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({ selectedDate, onSelectDate }) => {
  const settings = storage.getSettings();
  
  const weekDays = React.useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: settings.startOfWeek as any });
    const end = endOfWeek(selectedDate, { weekStartsOn: settings.startOfWeek as any });
    return eachDayOfInterval({ start, end });
  }, [selectedDate, settings.startOfWeek]);

  const handlePrevWeek = () => {
    onSelectDate(subWeeks(selectedDate, 1));
  };

  const handleNextWeek = () => {
    onSelectDate(addWeeks(selectedDate, 1));
  };

  return (
    <div className="px-6 pt-4 pb-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {format(selectedDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-1">
          <button 
            onClick={handlePrevWeek}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={handleNextWeek}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white dark:bg-[#252525] p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`flex flex-col items-center justify-center w-10 h-14 rounded-xl transition-all ${
                isSelected
                  ? 'bg-[#6264A7] text-white shadow-md scale-105'
                  : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase mb-1 ${isSelected ? 'text-indigo-100' : ''}`}>
                {format(day, 'EEE')}
              </span>
              <span className={`text-base font-bold ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {format(day, 'd')}
              </span>
              {isTodayDate && !isSelected && (
                <div className="w-1.5 h-1.5 bg-[#6264A7] rounded-full mt-1"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeekCalendar;
