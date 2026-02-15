
import React from 'react';
import { Target, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { DailyStats, MonthlyStats } from '../types';

interface StatsSummaryProps {
  stats: DailyStats;
  monthly: MonthlyStats;
  dateLabel: string;
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ stats, monthly, dateLabel }) => {
  return (
    <div className="px-4 mb-6 space-y-3">
      {/* Daily Progress Card */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-[#4B53BC]">
              <TrendingUp size={20} />
              <span className="font-bold text-sm uppercase tracking-wide">Daily Progress</span>
            </div>
            <span className="text-2xl font-black text-gray-900">{Math.round(stats.percentage)}%</span>
          </div>
          
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-[#4B53BC] to-[#6264A7] transition-all duration-1000 ease-out"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
          
          <p className="text-xs text-gray-500">
            Completed <span className="font-bold text-[#4B53BC]">{stats.totalCompleted}</span> of {stats.totalTarget} goals <span className="lowercase">{dateLabel}</span>
          </p>
        </div>
        
        {/* Subtle background decoration */}
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#6264A7]/5 rounded-full blur-2xl"></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Monthly Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <CalendarIcon size={16} />
            <span className="text-[10px] font-bold uppercase">Monthly Active</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{monthly.totalDaysCompleted}</span>
            <span className="text-xs text-gray-400 font-medium">days</span>
          </div>
        </div>

        {/* Total Target */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Target size={16} />
            <span className="text-[10px] font-bold uppercase">Goal ({dateLabel})</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{stats.totalTarget}</span>
            <span className="text-xs text-gray-400 font-medium">tasks</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSummary;
