// 全局状态管理 - 使用 Zustand
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Task, Note, CalendarEvent, List, Challenge } from '../types';
import { storageService } from '../services/storageService';
import { challengeService } from '../services/challengeService';

// ========== Store 接口定义 ==========
interface AppStore {
  // ===== Tasks 模块 =====
  tasks: Task[];
  lists: List[];
  activeListId: string;

  // Tasks actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setActiveList: (listId: string) => void;
  loadTasks: () => void;
  saveTasks: () => void;

  // ===== Calendar 模块 =====
  calendarEvents: CalendarEvent[];
  calendarView: 'day' | '3day' | 'week' | 'month';
  selectedDate: Date;

  // Calendar actions
  setCalendarEvents: (events: CalendarEvent[]) => void;
  addCalendarEvent: (event: CalendarEvent) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  setCalendarView: (view: 'day' | '3day' | 'week' | 'month') => void;
  setSelectedDate: (date: Date) => void;
  loadCalendarEvents: () => void;
  saveCalendarEvents: () => void;

  // ===== Notes 模块 =====
  notes: Note[];
  activeNoteId: string | null;

  // Notes actions
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  loadNotes: () => void;
  saveNotes: () => void;

  // ===== Pomodoro 模块 =====
  pomodoroStats: {
    todayCompleted: number;
    todayMinutes: number;
    weekCompleted: number;
    weekMinutes: number;
  };

  // Pomodoro actions
  addPomodoroSession: (minutes: number, taskId?: string) => void;
  getPomodoroStats: () => void;

  // ===== Challenge 模块 =====
  challenge: Challenge | null;

  // Challenge actions
  setChallenge: (challenge: Challenge | null) => void;
  loadChallenge: () => void;

  // ===== Settings 模块 =====
  theme: string;
  settings: any;

  // Settings actions
  setTheme: (theme: string) => void;
  setSettings: (settings: any) => void;
  loadSettings: () => void;
  saveSettings: () => void;

  // ===== 全局 actions =====
  initializeApp: () => void;
  clearAllData: () => void;
  exportData: () => string;
  importData: (jsonString: string) => boolean;
}

// ========== 创建 Store ==========
export const useStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ===== Tasks 模块状态 =====
        tasks: [],
        lists: [],
        activeListId: 'inbox',

        // Tasks actions
        setTasks: (tasks) => {
          set({ tasks });
          storageService.saveTasks(tasks);
        },

        addTask: (task) => {
          const tasks = [...get().tasks, task];
          set({ tasks });
          storageService.saveTasks(tasks);
        },

        updateTask: (id, updates) => {
          const tasks = get().tasks.map(t =>
            t.id === id ? { ...t, ...updates } : t
          );
          set({ tasks });
          storageService.saveTasks(tasks);
        },

        deleteTask: (id) => {
          const tasks = get().tasks.filter(t => t.id !== id);
          set({ tasks });
          storageService.saveTasks(tasks);
        },

        toggleTask: (id) => {
          const tasks = get().tasks.map(t => {
            if (t.id === id) {
              const isCompleting = !t.completed;
              return {
                ...t,
                completed: isCompleting,
                completedDate: isCompleting ? new Date() : undefined
              };
            }
            return t;
          });
          set({ tasks });
          storageService.saveTasks(tasks);

          // 更新 Challenge 模块的任务完成数
          const challenge = get().challenge;
          if (challenge && challenge.isActive) {
            const todayCompleted = tasks.filter(t =>
              t.completed &&
              t.completedDate &&
              new Date(t.completedDate).toDateString() === new Date().toDateString()
            ).length;

            challengeService.updateTasksCompleted(
              challenge.currentDay,
              todayCompleted
            );
          }
        },

        setActiveList: (listId) => set({ activeListId: listId }),

        loadTasks: () => {
          const tasks = storageService.getTasks();
          const lists = storageService.getLists();
          set({ tasks, lists });
        },

        saveTasks: () => {
          storageService.saveTasks(get().tasks);
          storageService.saveLists(get().lists);
        },

        // ===== Calendar 模块状态 =====
        calendarEvents: [],
        calendarView: 'month',
        selectedDate: new Date(),

        // Calendar actions
        setCalendarEvents: (events) => {
          set({ calendarEvents: events });
          storageService.saveCalendarEvents(events);
        },

        addCalendarEvent: (event) => {
          const events = [...get().calendarEvents, event];
          set({ calendarEvents: events });
          storageService.saveCalendarEvents(events);
        },

        updateCalendarEvent: (id, updates) => {
          const events = get().calendarEvents.map(e =>
            e.id === id ? { ...e, ...updates } : e
          );
          set({ calendarEvents: events });
          storageService.saveCalendarEvents(events);
        },

        deleteCalendarEvent: (id) => {
          const events = get().calendarEvents.filter(e => e.id !== id);
          set({ calendarEvents: events });
          storageService.saveCalendarEvents(events);
        },

        setCalendarView: (view) => set({ calendarView: view }),
        setSelectedDate: (date) => set({ selectedDate: date }),

        loadCalendarEvents: () => {
          const events = storageService.getCalendarEvents();
          set({ calendarEvents: events });
        },

        saveCalendarEvents: () => {
          storageService.saveCalendarEvents(get().calendarEvents);
        },

        // ===== Notes 模块状态 =====
        notes: [],
        activeNoteId: null,

        // Notes actions
        setNotes: (notes) => {
          set({ notes });
          storageService.saveNotes(notes);
        },

        addNote: (note) => {
          const notes = [...get().notes, note];
          set({ notes, activeNoteId: note.id });
          storageService.saveNotes(notes);
        },

        updateNote: (id, updates) => {
          const notes = get().notes.map(n =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n
          );
          set({ notes });
          storageService.saveNotes(notes);
        },

        deleteNote: (id) => {
          const notes = get().notes.filter(n => n.id !== id);
          const activeNoteId = get().activeNoteId === id ? null : get().activeNoteId;
          set({ notes, activeNoteId });
          storageService.saveNotes(notes);
        },

        setActiveNote: (id) => set({ activeNoteId: id }),

        loadNotes: () => {
          const notes = storageService.getNotes();
          set({ notes });
        },

        saveNotes: () => {
          storageService.saveNotes(get().notes);
        },

        // ===== Pomodoro 模块状态 =====
        pomodoroStats: {
          todayCompleted: 0,
          todayMinutes: 0,
          weekCompleted: 0,
          weekMinutes: 0,
        },

        // Pomodoro actions
        addPomodoroSession: (minutes, taskId) => {
          const stats = storageService.getPomodoroStats();
          const today = new Date().toISOString().split('T')[0];

          if (!stats.daily[today]) {
            stats.daily[today] = [];
          }

          stats.daily[today].push({
            startTime: new Date(Date.now() - minutes * 60 * 1000),
            endTime: new Date(),
            duration: minutes,
            type: 'focus',
            completed: true,
            taskId,
          });

          stats.total.sessionsCompleted++;
          stats.total.totalFocusMinutes += minutes;

          storageService.savePomodoroStats(stats);

          // 更新 Challenge 模块的番茄钟时间
          const challenge = get().challenge;
          if (challenge && challenge.isActive) {
            challengeService.updatePomodoroTime(
              challenge.currentDay,
              stats.daily[today].reduce((sum, s) => sum + s.duration, 0)
            );
          }

          get().getPomodoroStats();
        },

        getPomodoroStats: () => {
          const stats = storageService.getPomodoroStats();
          const today = new Date().toISOString().split('T')[0];
          const todayStats = stats.daily[today] || [];

          // 计算本周数据
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          let weekCompleted = 0;
          let weekMinutes = 0;

          Object.entries(stats.daily).forEach(([date, sessions]) => {
            const d = new Date(date);
            if (d >= weekStart) {
              weekCompleted += sessions.filter(s => s.completed).length;
              weekMinutes += sessions.reduce((sum, s) => sum + s.duration, 0);
            }
          });

          set({
            pomodoroStats: {
              todayCompleted: todayStats.filter(s => s.completed).length,
              todayMinutes: todayStats.reduce((sum, s) => sum + s.duration, 0),
              weekCompleted,
              weekMinutes,
            }
          });
        },

        // ===== Challenge 模块状态 =====
        challenge: null,

        // Challenge actions
        setChallenge: (challenge) => set({ challenge }),

        loadChallenge: () => {
          const challenge = challengeService.getChallenge();
          set({ challenge });
        },

        // ===== Settings 模块状态 =====
        theme: 'sage',
        settings: {},

        // Settings actions
        setTheme: (theme) => {
          set({ theme });
          storageService.saveTheme(theme);

          // 应用主题到 DOM
          document.documentElement.className = `theme-${theme}`;
        },

        setSettings: (settings) => {
          set({ settings });
          storageService.saveAppSettings(settings);
        },

        loadSettings: () => {
          const theme = storageService.getTheme();
          const settings = storageService.getAppSettings();
          set({ theme, settings });
        },

        saveSettings: () => {
          storageService.saveTheme(get().theme);
          storageService.saveAppSettings(get().settings);
        },

        // ===== 全局 actions =====
        initializeApp: () => {
          // 加载所有模块数据
          get().loadTasks();
          get().loadCalendarEvents();
          get().loadNotes();
          get().loadChallenge();
          get().loadSettings();
          get().getPomodoroStats();
        },

        clearAllData: () => {
          storageService.clearAllData();
          set({
            tasks: [],
            lists: [],
            calendarEvents: [],
            notes: [],
            challenge: null,
            theme: 'sage',
            settings: {},
          });
        },

        exportData: () => {
          return storageService.exportAllData();
        },

        importData: (jsonString) => {
          const success = storageService.importData(jsonString);
          if (success) {
            get().initializeApp();
          }
          return success;
        },
      }),
      {
        name: 'app-store', // localStorage key
        partialize: (state) => ({
          // 只持久化必要的状态
          activeListId: state.activeListId,
          calendarView: state.calendarView,
          activeNoteId: state.activeNoteId,
        }),
      }
    )
  )
);

// ========== 工具函数 ==========

// 获取按清单过滤的任务
export const getFilteredTasks = (tasks: Task[], listId: string): Task[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const next7Days = new Date(today);
  next7Days.setDate(today.getDate() + 7);

  switch (listId) {
    case 'inbox':
      return tasks;
    case 'today':
      return tasks.filter(t => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate.toDateString() === today.toDateString();
      });
    case 'next_7_days':
      return tasks.filter(t => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate >= today && dueDate <= next7Days;
      });
    default:
      return tasks.filter(t => t.listId === listId);
  }
};

// 获取任务统计
export const getTaskStats = (tasks: Task[]) => {
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const completed = tasks.filter(t => t.completed);
  const pending = tasks.filter(t => !t.completed);
  const overdue = tasks.filter(t => {
    if (!t.dueDate || t.completed) return false;
    return new Date(t.dueDate) < new Date();
  });

  const weeklyCompleted = completed.filter(t => {
    if (!t.completedDate) return false;
    return new Date(t.completedDate) >= startOfWeek;
  }).length;

  const monthlyCompleted = completed.filter(t => {
    if (!t.completedDate) return false;
    return new Date(t.completedDate) >= startOfMonth;
  }).length;

  return {
    total: tasks.length,
    completed: completed.length,
    pending: pending.length,
    overdue: overdue.length,
    weeklyCompleted,
    monthlyCompleted,
    completionRate: tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0,
  };
};

// 获取标签统计
export const getTagStats = (tasks: Task[]) => {
  const tagCount: Record<string, number> = {};

  tasks.forEach(task => {
    task.tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));
};

// 获取优先级统计
export const getPriorityStats = (tasks: Task[]) => {
  const stats = {
    high: 0,
    medium: 0,
    low: 0,
    none: 0,
  };

  tasks.forEach(task => {
    stats[task.priority]++;
  });

  return stats;
};