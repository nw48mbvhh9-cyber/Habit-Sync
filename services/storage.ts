
import { Habit, HabitLog } from '../types';

const HABITS_KEY = 'habitsync_habits';
const LOGS_KEY = 'habitsync_logs';
const SETTINGS_KEY = 'habitsync_settings';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserSettings {
  userName: string;
  theme: ThemeMode;
  startOfWeek: 0 | 1; // 0 for Sunday, 1 for Monday
}

const DEFAULT_SETTINGS: UserSettings = {
  userName: 'User',
  theme: 'system',
  startOfWeek: 1
};

export const storage = {
  getHabits: (): Habit[] => {
    const data = localStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveHabit: (habit: Habit) => {
    const habits = storage.getHabits();
    const existingIndex = habits.findIndex(h => h.id === habit.id);
    
    if (existingIndex >= 0) {
      habits[existingIndex] = habit;
    } else {
      habits.push(habit);
    }
    
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  },
  deleteHabit: (id: string) => {
    const habits = storage.getHabits().filter(h => h.id !== id);
    const logs = storage.getLogs().filter(l => l.habitId !== id);
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  },
  getLogs: (): HabitLog[] => {
    const data = localStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveLog: (log: HabitLog) => {
    const logs = storage.getLogs();
    const existingIndex = logs.findIndex(l => l.habitId === log.habitId && l.date === log.date);
    
    if (existingIndex > -1) {
      logs[existingIndex] = log;
    } else {
      logs.push(log);
    }
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  },
  // Settings Logic
  getSettings: (): UserSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  },
  saveSettings: (settings: UserSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },
  // Data Management
  exportData: () => {
    const data = {
      habits: storage.getHabits(),
      logs: storage.getLogs(),
      settings: storage.getSettings(),
      version: '1.2',
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitsync_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
  importData: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.habits) localStorage.setItem(HABITS_KEY, JSON.stringify(data.habits));
      if (data.logs) localStorage.setItem(LOGS_KEY, JSON.stringify(data.logs));
      if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },
  clearAllData: () => {
    // Specifically clear only habits and logs as requested
    localStorage.removeItem(HABITS_KEY);
    localStorage.removeItem(LOGS_KEY);
  }
};
