
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 is Sunday

export interface Habit {
  id: string;
  name: string;
  frequency: number; // times per day
  repeatDays: DayOfWeek[];
  color: string;
  createdAt: number;
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD
  completedCount: number;
}

export interface DailyStats {
  percentage: number;
  totalCompleted: number;
  totalTarget: number;
}

export interface MonthlyStats {
  totalDaysCompleted: number;
}
