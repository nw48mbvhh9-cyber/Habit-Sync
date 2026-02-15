
import React, { useMemo } from 'react';
import { Habit, HabitLog, DayOfWeek } from '../types';
import { TrendingUp, PieChart, BarChart3, Activity, CheckCircle2 } from 'lucide-react';
import { format, startOfWeek, isSameDay, eachDayOfInterval } from 'date-fns';
import { storage } from '../services/storage';

interface StatsViewProps {
  habits: Habit[];
  logs: HabitLog[];
}

const StatsView: React.FC<StatsViewProps> = ({ habits, logs }) => {
  const settings = storage.getSettings();

  // 1. Calculate Weekly Activity Data
  const weeklyStats = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: settings.startOfWeek as any });
    const end = new Date(start);
    end.setDate(end.getDate() + 6); // End of the 7-day view

    const days = eachDayOfInterval({ start, end });

    let totalWeekTarget = 0;
    let totalWeekCompleted = 0;

    const data = days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayOfWeek = day.getDay() as DayOfWeek;

      // Calculate Target for this day based on habits scheduled
      const scheduledHabits = habits.filter(h => h.repeatDays.includes(dayOfWeek));
      const target = scheduledHabits.reduce((acc, h) => acc + h.frequency, 0);

      // Calculate Completed count from logs
      const dayLogs = logs.filter(l => l.date === dateStr);
      const completed = dayLogs.reduce((acc, log) => acc + log.completedCount, 0);

      totalWeekTarget += target;
      totalWeekCompleted += completed;

      return { 
        day: format(day, 'EEE'), 
        fullDate: dateStr, 
        completed, 
        target,
        dayNum: day.getDay()
      };
    });

    const maxDayValue = Math.max(...data.map(d => Math.max(d.target, d.completed)), 1);
    const weekPercentage = totalWeekTarget > 0 ? (totalWeekCompleted / totalWeekTarget) * 100 : 0;
    
    return { data, maxDayValue, weekPercentage, totalWeekCompleted, totalWeekTarget };
  }, [habits, logs, settings.startOfWeek]);

  // 2. Calculate Habit Distribution (Pie Chart)
  const distributionData = useMemo(() => {
    const totalCompletions = logs.reduce((acc, l) => acc + l.completedCount, 0);
    
    if (totalCompletions === 0) return [];

    const data = habits.map(habit => {
      const count = logs.filter(l => l.habitId === habit.id)
                        .reduce((acc, l) => acc + l.completedCount, 0);
      return {
        id: habit.id,
        name: habit.name,
        color: habit.color,
        count,
        percentage: (count / totalCompletions) * 100
      };
    })
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count);

    return data;
  }, [habits, logs]);

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full pb-20 px-6 text-center">
        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="text-gray-300 dark:text-gray-600" size={32} />
        </div>
        <h3 className="text-gray-900 dark:text-white font-bold text-lg">No habits found</h3>
        <p className="text-gray-500 text-sm mt-2 max-w-xs">Create some habits in the Planner to start seeing your progress analytics.</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-6 pb-28">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h2>

      {/* Weekly Activity Bar Chart */}
      <div className="bg-white dark:bg-[#252525] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#6264A7]/10 rounded-md text-[#6264A7]">
               <Activity size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Weekly Progress</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase">{Math.round(weeklyStats.weekPercentage)}% COMPLETED</p>
            </div>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md uppercase tracking-wider">Active</span>
          </div>
        </div>
        
        <div className="flex items-end justify-between h-48 gap-3 px-1">
          {weeklyStats.data.map((item, index) => {
            const targetHeightPerc = (item.target / weeklyStats.maxDayValue) * 100;
            const completedHeightPerc = (item.completed / weeklyStats.maxDayValue) * 100;
            const isToday = isSameDay(new Date(item.fullDate), new Date());
            
            return (
              <div key={index} className="flex flex-col items-center gap-3 flex-1 group h-full">
                 <div className="relative w-full flex items-end justify-center flex-1">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                       <span className="text-[9px] font-black text-white bg-gray-800 dark:bg-gray-700 px-1.5 py-0.5 rounded shadow-lg">
                          {item.completed}/{item.target}
                       </span>
                    </div>

                    {item.target > 0 && (
                      <div 
                        className="absolute bottom-0 w-full max-w-[24px] rounded-t-lg bg-gray-100 dark:bg-gray-800 transition-all duration-700 ease-out"
                        style={{ height: `${targetHeightPerc}%` }}
                      />
                    )}
                    
                    {item.completed > 0 && (
                      <div 
                        className={`absolute bottom-0 w-full max-w-[24px] rounded-t-lg transition-all duration-1000 ease-out z-10 shadow-sm ${
                          isToday ? 'bg-[#6264A7]' : 'bg-[#9396D1] opacity-90'
                        }`}
                        style={{ height: `${completedHeightPerc}%` }}
                      >
                         {item.completed > item.target && (
                           <div className="w-full h-1.5 bg-white/20 absolute top-0 rounded-t-lg animate-pulse"></div>
                         )}
                      </div>
                    )}
                    {item.target === 0 && item.completed === 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 mb-2"></div>
                    )}
                 </div>

                 <div className="flex flex-col items-center gap-1">
                    <span className={`text-[11px] font-bold uppercase tracking-tighter ${isToday ? 'text-[#6264A7]' : 'text-gray-400 dark:text-gray-500'}`}>
                        {item.day[0]}
                    </span>
                    {isToday && <div className="w-1.5 h-1.5 rounded-full bg-[#6264A7] shadow-[0_0_8px_rgba(98,100,167,0.5)]"></div>}
                 </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-center gap-6">
           <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded bg-[#6264A7]"></div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Done</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded bg-gray-100 dark:bg-gray-800"></div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Goal</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="bg-white dark:bg-[#252525] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm transition-colors">
             <div className="flex items-center gap-2 text-gray-400 mb-2">
               <CheckCircle2 size={16} className="text-[#6264A7]" />
               <span className="text-[10px] font-bold uppercase tracking-wider">Weekly Score</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
               {weeklyStats.totalWeekCompleted}
            </div>
            <div className="text-[10px] text-gray-400 mt-1 font-medium">Tasks finished this week</div>
         </div>

         <div className="bg-gradient-to-br from-[#6264A7] to-[#4B53BC] rounded-2xl p-5 text-white shadow-lg shadow-[#6264A7]/20">
            <div className="flex items-center gap-2 opacity-80 mb-2">
               <TrendingUp size={16} />
               <span className="text-[10px] font-bold uppercase tracking-wider">Success Rate</span>
            </div>
            <div className="text-3xl font-bold">
               {Math.round(weeklyStats.weekPercentage)}%
            </div>
            <div className="text-[10px] opacity-80 mt-1">Goal completion rate</div>
         </div>
      </div>

      <div className="bg-white dark:bg-[#252525] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
         <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-500/10 rounded-md text-orange-500">
               <PieChart size={18} />
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Task Distribution</h3>
         </div>

         {distributionData.length > 0 ? (
           <div className="flex flex-col items-center gap-8">
              <div className="relative w-44 h-44 shrink-0">
                 <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-gray-50 dark:text-gray-800" />
                    {distributionData.map((item, i) => {
                       const circumference = 2 * Math.PI * 40;
                       const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                       const previousPercentage = distributionData.slice(0, i).reduce((acc, curr) => acc + curr.percentage, 0);
                       const strokeDashoffset = -1 * (previousPercentage / 100) * circumference;

                       return (
                          <circle
                             key={item.id}
                             cx="50"
                             cy="50"
                             r="40"
                             fill="transparent"
                             stroke={item.color}
                             strokeWidth="12"
                             strokeDasharray={strokeDasharray}
                             strokeDashoffset={strokeDashoffset}
                             strokeLinecap="round"
                             className="transition-all duration-1000 ease-out"
                          />
                       );
                    })}
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{logs.reduce((a,b)=>a+b.completedCount,0)}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Done</span>
                 </div>
              </div>

              <div className="w-full grid grid-cols-1 gap-3">
                 {distributionData.slice(0, 6).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                       <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{item.name}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-gray-400">{item.count} tasks</span>
                          <span className="text-xs font-black text-gray-900 dark:text-white min-w-[35px] text-right">{Math.round(item.percentage)}%</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
         ) : (
           <div className="py-12 text-center text-gray-400 dark:text-gray-600 text-sm italic">
             No completed tasks yet.
           </div>
         )}
      </div>
    </div>
  );
};

export default StatsView;
