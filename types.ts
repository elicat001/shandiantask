export enum Tab {
  TASKS = 'TASKS',
  CALENDAR = 'CALENDAR',
  NOTES = 'NOTES',
  POMODORO = 'POMODORO',
  CHALLENGE = 'CHALLENGE',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS'
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedDate?: Date;
  dueDate?: Date;
  tags: string[];
  priority: 'none' | 'low' | 'medium' | 'high';
  listId: string;
  subtasks?: SubTask[];
  order?: number; // 用于任务排序
}

export interface List {
  id: string;
  name: string;
  type: 'smart' | 'user';
  icon?: string;
  count: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
  summary?: string; // AI generated summary
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'task' | 'holiday';
}
// 50天挑战相关类型
export interface DailyHabit {
  id: string;
  name: string;
  icon: string;
  category: 'health' | 'mind' | 'productivity' | 'social' | 'growth';
  description: string;
  isRequired: boolean;
}

export interface DayProgress {
  day: number;
  date: Date;
  habits: {
    habitId: string;
    completed: boolean;
    completedAt?: Date;
    note?: string;
  }[];
  tasksCompleted: number;
  pomodoroMinutes: number;
  reflection?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  isRestDay: boolean;
}

export interface Challenge {
  id: string;
  name: string;
  startDate: Date;
  currentDay: number;
  isActive: boolean;
  habits: DailyHabit[];
  progress: DayProgress[];
  streakDays: number;
  bestStreak: number;
  totalTasksCompleted: number;
  totalPomodoroMinutes: number;
}
