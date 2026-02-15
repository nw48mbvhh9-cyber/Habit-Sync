
import React from 'react';
import { Habit, DayOfWeek } from '../types';
import { Plus, Trash2, CalendarDays, Repeat, Clock, ChevronRight } from 'lucide-react';

interface PlannerViewProps {
  habits: Habit[];
  onDelete: (id: string) => void;
  onAdd: () => void;
  onEdit: (habit: Habit) => void;
}

const PlannerView: React.FC<PlannerViewProps> = ({ habits, onDelete, onAdd, onEdit }) => {
  const getScheduleText = (days: DayOfWeek[]) => {
    if (days.length === 7) return 'Daily';
    if (days.length === 0) return 'Not scheduled';
    if (days.length === 1) return 'Weekly';
    return `${days.length} times / week`;
  };

  return (
    <div className="px-6 py-6 pb-32">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Planner</h2>
           <p className="text-gray-400 text-xs mt-1">Manage your weekly schedule</p>
        </div>
        <button 
          onClick={onAdd}
          className="bg-[#6264A7] hover:bg-[#505290] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-md"
        >
          <Plus size={16} />
          Add Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
           <CalendarDays className="mx-auto text-gray-300 mb-3" size={32} />
           <p className="text-gray-500 font-medium text-sm">Your schedule is empty.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <div 
              key={habit.id} 
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-[#6264A7]/30 transition-all active:scale-[0.99] relative"
            >
              {/* Clickable area for Editing */}
              <div 
                onClick={() => onEdit(habit)}
                className="flex items-center gap-4 overflow-hidden flex-1 cursor-pointer"
              >
                <div 
                   className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0" 
                   style={{ backgroundColor: habit.color }}
                >
                   {habit.name[0].toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-bold text-gray-900 truncate text-[15px]">{habit.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                     <span className="flex items-center gap-1 text-[#6264A7] bg-[#6264A7]/5 px-2 py-0.5 rounded-md">
                        <Repeat size={10} />
                        {getScheduleText(habit.repeatDays)}
                     </span>
                     <span className="flex items-center gap-1 text-gray-400">
                        <Clock size={10} />
                        {habit.frequency}x / day
                     </span>
                  </div>
                </div>
              </div>
              
              {/* Actions Area */}
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(habit.id);
                  }}
                  className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  aria-label="Delete habit"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  type="button"
                  onClick={() => onEdit(habit)}
                  className="w-8 h-10 flex items-center justify-center text-gray-300 hover:text-[#6264A7] transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlannerView;
