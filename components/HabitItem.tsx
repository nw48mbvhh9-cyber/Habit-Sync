
import React from 'react';
import { Check, Trash2, Clock } from 'lucide-react';
import { Habit, HabitLog } from '../types';

interface HabitItemProps {
  habit: Habit;
  log?: HabitLog;
  onToggle: (habitId: string, count: number) => void;
  onDelete: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, log, onToggle, onDelete, onEdit }) => {
  const completedCount = log?.completedCount || 0;
  const isFullyCompleted = completedCount >= habit.frequency;

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-between transition-all ${isFullyCompleted ? 'bg-gray-50/50' : ''}`}>
      {/* Clickable area for editing */}
      <div 
        onClick={() => onEdit(habit)}
        className="flex items-center gap-4 flex-1 overflow-hidden cursor-pointer"
      >
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white shadow-sm shrink-0"
          style={{ backgroundColor: habit.color }}
        >
          {habit.name[0].toUpperCase()}
        </div>
        <div className="flex flex-col gap-0.5 overflow-hidden min-w-0">
          <h3 className={`font-bold text-gray-800 text-[15px] leading-tight truncate ${isFullyCompleted ? 'line-through text-gray-400' : ''}`}>
            {habit.name}
          </h3>
          <div className="flex items-center gap-1.5 text-[#6264A7] font-bold uppercase text-[9px] tracking-widest">
            <Clock size={10} />
            <span>{habit.frequency === 1 ? 'Daily' : `${habit.frequency} Slots Today`}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-2 shrink-0">
        {/* Progress slots */}
        <div className="flex gap-1.5 sm:gap-2">
          {Array.from({ length: habit.frequency }).map((_, idx) => {
            const isCompleted = idx < completedCount;

            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCompleted) {
                    onToggle(habit.id, idx);
                  } else {
                    onToggle(habit.id, idx + 1);
                  }
                }}
                className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                  isCompleted 
                    ? 'bg-[#4B53BC] border-[#4B53BC] text-white shadow-sm' 
                    : 'bg-white border-gray-200 text-transparent hover:border-[#4B53BC]/30'
                }`}
              >
                <Check size={18} strokeWidth={3} className={isCompleted ? 'scale-100 opacity-100' : 'scale-50 opacity-0'} />
              </button>
            );
          })}
        </div>
        
        {/* Delete Button */}
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation(); 
            onDelete(habit.id);
          }}
          className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors relative z-10"
          aria-label="Delete habit"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default HabitItem;
