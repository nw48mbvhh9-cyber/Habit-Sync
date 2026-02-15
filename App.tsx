
import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, Trophy } from 'lucide-react';
import Layout from './components/Layout';
import HabitItem from './components/HabitItem';
import AddHabitModal from './components/AddHabitModal';
import ConfirmationModal from './components/ConfirmationModal';
import StatsSummary from './components/StatsSummary';
import StatsView from './components/StatsView';
import PlannerView from './components/PlannerView';
import WeekCalendar from './components/WeekCalendar';
import { Habit, HabitLog, DailyStats, MonthlyStats } from './types';
import { storage } from './services/storage';
import { getMonthDateRange, getRelativeDateLabel } from './utils/dateUtils';
import { parseISO, isWithinInterval, format } from 'date-fns';

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('habits');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  
  // Date Selection State
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setHabits(storage.getHabits());
    setLogs(storage.getLogs());
  };

  const selectedDateStr = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);
  const selectedDayOfWeek = selectedDate.getDay();
  const dateLabel = getRelativeDateLabel(selectedDate);

  // Core habit filtering logic for "Selected Date" view
  const scheduledHabitsForDate = habits.filter(h => h.repeatDays.includes(selectedDayOfWeek as any));
  
  const filteredHabits = useMemo(() => {
    return scheduledHabitsForDate.filter(h => {
      const log = logs.find(l => l.habitId === h.id && l.date === selectedDateStr);
      const isCompleted = log && log.completedCount >= h.frequency;
      if (filter === 'Pending') return !isCompleted;
      if (filter === 'Completed') return isCompleted;
      return true;
    });
  }, [scheduledHabitsForDate, logs, filter, selectedDateStr]);

  const dailyStats = useMemo((): DailyStats => {
    // Filter habits that are actually scheduled for the selected date
    const activeHabits = habits.filter(h => h.repeatDays.includes(selectedDayOfWeek as any));

    let totalTarget = 0;
    let totalCompleted = 0;

    activeHabits.forEach(habit => {
      totalTarget += habit.frequency;
      
      const log = logs.find(l => l.habitId === habit.id && l.date === selectedDateStr);
      if (log) {
        totalCompleted += log.completedCount;
      }
    });

    const percentage = totalTarget === 0 ? 0 : Math.min(100, (totalCompleted / totalTarget) * 100);

    return {
      totalTarget,
      totalCompleted,
      percentage
    };
  }, [habits, logs, selectedDayOfWeek, selectedDateStr]);

  const monthlyStats = useMemo((): MonthlyStats => {
    const { start, end } = getMonthDateRange();
    const activeDaysInMonth = new Set();
    logs.forEach(log => {
      const logDate = parseISO(log.date);
      if (isWithinInterval(logDate, { start, end }) && log.completedCount > 0) {
        activeDaysInMonth.add(log.date);
      }
    });
    return { totalDaysCompleted: activeDaysInMonth.size };
  }, [logs]);

  const handleToggleHabit = (habitId: string, count: number) => {
    const newLog: HabitLog = {
      habitId,
      date: selectedDateStr, // Use selected date
      completedCount: count
    };
    storage.saveLog(newLog);
    setLogs(storage.getLogs());
  };

  const handleSaveHabit = (habit: Habit) => {
    storage.saveHabit(habit);
    refreshData();
    setIsModalOpen(false);
    setEditingHabit(undefined);
  };

  const handleDeleteClick = (id: string) => {
    setHabitToDelete(id);
  };

  const confirmDelete = () => {
    if (habitToDelete) {
      storage.deleteHabit(habitToDelete);
      refreshData();
      setHabitToDelete(null);
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleOpenNewHabitModal = () => {
    setEditingHabit(undefined);
    setIsModalOpen(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'habits':
        return (
          <div className="pb-32">
            <WeekCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

            {/* Simple Status Filter */}
            <div className="px-6 pt-2 pb-2 flex gap-4 overflow-x-auto no-scrollbar">
              <FilterTab label="All" active={filter === 'All'} onClick={() => setFilter('All')} />
              <FilterTab label="Pending" active={filter === 'Pending'} onClick={() => setFilter('Pending')} />
              <FilterTab label="Completed" active={filter === 'Completed'} onClick={() => setFilter('Completed')} />
            </div>

            <StatsSummary stats={dailyStats} monthly={monthlyStats} dateLabel={dateLabel} />

            <div className="px-6 mt-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#6264A7]" />
                  Tasks for {dateLabel}
                </h2>
                {scheduledHabitsForDate.length > 0 && (
                  <span className="text-[10px] font-bold text-[#6264A7] bg-[#6264A7]/5 px-2 py-0.5 rounded-full">
                    {scheduledHabitsForDate.length} Scheduled
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {filteredHabits.length > 0 ? (
                  filteredHabits.map((habit) => (
                    <HabitItem
                      key={habit.id}
                      habit={habit}
                      log={logs.find(l => l.habitId === habit.id && l.date === selectedDateStr)}
                      onToggle={handleToggleHabit}
                      onDelete={handleDeleteClick}
                      onEdit={handleEditHabit}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-[#FBFBFF] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="text-[#D1D1EB]" size={32} />
                    </div>
                    <h3 className="text-gray-800 font-bold mb-1">
                      {filter === 'Completed' ? 'Nothing completed yet' : 'No tasks scheduled'}
                    </h3>
                    <p className="text-gray-400 text-xs px-4">
                      {filter === 'Completed' 
                         ? `Complete some habits for ${dateLabel}!` 
                         : `No ${filter.toLowerCase()} habits for ${dateLabel}.`}
                    </p>
                    {/* Fallback button in empty state is kept for new users, but floating button is removed */}
                    {filter === 'All' && (
                       <button 
                         onClick={handleOpenNewHabitModal}
                         className="mt-6 text-[#6264A7] font-bold text-sm bg-[#6264A7]/5 px-4 py-2 rounded-lg"
                       >
                         Create New Habit
                       </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'stats':
        return <StatsView habits={habits} logs={logs} />;
      case 'calendar':
        return (
          <PlannerView 
            habits={habits} 
            onDelete={handleDeleteClick} 
            onAdd={handleOpenNewHabitModal}
            onEdit={handleEditHabit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onDataRefresh={refreshData}>
      {renderContent()}

      {isModalOpen && (
        <AddHabitModal
          onClose={() => {
            setIsModalOpen(false);
            setEditingHabit(undefined);
          }}
          onSave={handleSaveHabit}
          initialHabit={editingHabit}
        />
      )}

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={!!habitToDelete}
        onClose={() => setHabitToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Habit?"
        message="This will permanently remove this habit and all its completion history. This action cannot be undone."
      />
    </Layout>
  );
};

const FilterTab = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`pb-2 px-1 text-sm font-bold transition-all border-b-2 ${
      active 
        ? 'border-[#6264A7] text-[#6264A7]' 
        : 'border-transparent text-gray-400 hover:text-gray-600'
    }`}
  >
    {label}
  </button>
);

export default App;
