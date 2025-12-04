export enum Tab {
  TASKS = 'TASKS',
  CALENDAR = 'CALENDAR',
  NOTES = 'NOTES',
  POMODORO = 'POMODORO',
  COUNTDOWN = 'COUNTDOWN',
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