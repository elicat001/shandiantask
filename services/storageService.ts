// 统一的数据持久化服务
// 管理所有模块的本地存储

import { Task, Note, CalendarEvent, List } from '../types';

// 存储键定义
const STORAGE_KEYS = {
  // 任务模块
  TASKS: 'tasks_data',
  LISTS: 'lists_data',

  // 日历模块
  CALENDAR_EVENTS: 'calendar_events',

  // 笔记模块
  NOTES: 'notes_data',

  // 番茄钟模块
  POMODORO_SETTINGS: 'pomodoro_settings',
  POMODORO_STATS: 'pomodoro_stats',

  // 设置模块
  APP_SETTINGS: 'app_settings',
  USER_PROFILE: 'user_profile',
  THEME: 'theme_settings',

  // 分析模块
  ANALYTICS_CACHE: 'analytics_cache',
} as const;

class StorageService {
  // 通用方法
  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      // 处理日期字符串转换
      return this.reviveDates(parsed);
    } catch (error) {
      console.error(`Failed to get ${key} from storage:`, error);
      return null;
    }
  }

  private setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set ${key} in storage:`, error);
    }
  }

  private removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from storage:`, error);
    }
  }

  // 日期处理
  private reviveDates(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string' && this.isISODateString(obj)) {
      return new Date(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.reviveDates(item));
    }
    if (typeof obj === 'object') {
      const revived: any = {};
      for (const key in obj) {
        revived[key] = this.reviveDates(obj[key]);
      }
      return revived;
    }
    return obj;
  }

  private isISODateString(str: string): boolean {
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str)) return false;
    const date = new Date(str);
    return date instanceof Date && !isNaN(date.getTime());
  }

  // ========== 任务模块 ==========
  getTasks(): Task[] {
    return this.getItem<Task[]>(STORAGE_KEYS.TASKS) || [];
  }

  saveTasks(tasks: Task[]): void {
    this.setItem(STORAGE_KEYS.TASKS, tasks);
  }

  getLists(): List[] {
    const defaultLists: List[] = [
      { id: 'inbox', name: '收集箱', type: 'smart', icon: 'inbox', count: 0 },
      { id: 'today', name: '今天', type: 'smart', icon: 'calendar', count: 0 },
      { id: 'next_7_days', name: '最近7天', type: 'smart', icon: 'grid', count: 0 },
      { id: 'work', name: '工作', type: 'user', icon: 'briefcase', count: 0 },
      { id: 'personal', name: '个人', type: 'user', icon: 'user', count: 0 },
    ];

    return this.getItem<List[]>(STORAGE_KEYS.LISTS) || defaultLists;
  }

  saveLists(lists: List[]): void {
    this.setItem(STORAGE_KEYS.LISTS, lists);
  }

  // ========== 日历模块 ==========
  getCalendarEvents(): CalendarEvent[] {
    return this.getItem<CalendarEvent[]>(STORAGE_KEYS.CALENDAR_EVENTS) || [];
  }

  saveCalendarEvents(events: CalendarEvent[]): void {
    this.setItem(STORAGE_KEYS.CALENDAR_EVENTS, events);
  }

  // ========== 笔记模块 ==========
  getNotes(): Note[] {
    return this.getItem<Note[]>(STORAGE_KEYS.NOTES) || [];
  }

  saveNotes(notes: Note[]): void {
    this.setItem(STORAGE_KEYS.NOTES, notes);
  }

  // ========== 番茄钟模块 ==========
  getPomodoroSettings(): PomodoroSettings {
    const defaults: PomodoroSettings = {
      focusDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      soundEnabled: true,
    };

    return this.getItem<PomodoroSettings>(STORAGE_KEYS.POMODORO_SETTINGS) || defaults;
  }

  savePomodoroSettings(settings: PomodoroSettings): void {
    this.setItem(STORAGE_KEYS.POMODORO_SETTINGS, settings);
  }

  getPomodoroStats(): PomodoroStats {
    const defaults: PomodoroStats = {
      daily: {},
      weekly: {},
      monthly: {},
      total: {
        sessionsCompleted: 0,
        totalFocusMinutes: 0,
        totalBreakMinutes: 0,
        longestStreak: 0,
        currentStreak: 0,
      },
    };

    return this.getItem<PomodoroStats>(STORAGE_KEYS.POMODORO_STATS) || defaults;
  }

  savePomodoroStats(stats: PomodoroStats): void {
    this.setItem(STORAGE_KEYS.POMODORO_STATS, stats);
  }

  // ========== 设置模块 ==========
  getAppSettings(): AppSettings {
    const defaults: AppSettings = {
      language: 'zh-CN',
      weekStartsOn: 1, // 1 = Monday
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      smartDateParsing: true,
      notifications: {
        enabled: true,
        dailyReminder: '09:00',
        sound: 'default',
        doNotDisturbEnabled: false,
        doNotDisturbStart: '22:00',
        doNotDisturbEnd: '08:00',
      },
      theme: {
        colorScheme: 'sage',
        fontSize: 'medium',
        floatingBallSize: 'medium',
      },
    };

    return this.getItem<AppSettings>(STORAGE_KEYS.APP_SETTINGS) || defaults;
  }

  saveAppSettings(settings: AppSettings): void {
    this.setItem(STORAGE_KEYS.APP_SETTINGS, settings);
  }

  getUserProfile(): UserProfile {
    const defaults: UserProfile = {
      nickname: '用户',
      avatar: '',
      email: '',
      phone: '',
      wechatBound: false,
      isPremium: false,
      premiumExpiresAt: undefined,
    };

    return this.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE) || defaults;
  }

  saveUserProfile(profile: UserProfile): void {
    this.setItem(STORAGE_KEYS.USER_PROFILE, profile);
  }

  // ========== 主题 ==========
  getTheme(): string {
    return this.getItem<string>(STORAGE_KEYS.THEME) || 'sage';
  }

  saveTheme(theme: string): void {
    this.setItem(STORAGE_KEYS.THEME, theme);
  }

  // ========== 分析模块 ==========
  getAnalyticsCache(): AnalyticsCache | null {
    const cache = this.getItem<AnalyticsCache>(STORAGE_KEYS.ANALYTICS_CACHE);

    // 检查缓存是否过期（1小时）
    if (cache && cache.timestamp) {
      const now = new Date().getTime();
      const cacheTime = new Date(cache.timestamp).getTime();
      const oneHour = 60 * 60 * 1000;

      if (now - cacheTime > oneHour) {
        this.removeItem(STORAGE_KEYS.ANALYTICS_CACHE);
        return null;
      }
    }

    return cache;
  }

  saveAnalyticsCache(data: any): void {
    const cache: AnalyticsCache = {
      data,
      timestamp: new Date(),
    };
    this.setItem(STORAGE_KEYS.ANALYTICS_CACHE, cache);
  }

  // ========== 数据导出/导入 ==========
  exportAllData(): string {
    const data = {
      version: '1.0.0',
      exportDate: new Date(),
      tasks: this.getTasks(),
      lists: this.getLists(),
      calendarEvents: this.getCalendarEvents(),
      notes: this.getNotes(),
      pomodoroSettings: this.getPomodoroSettings(),
      pomodoroStats: this.getPomodoroStats(),
      appSettings: this.getAppSettings(),
      userProfile: this.getUserProfile(),
      theme: this.getTheme(),
    };

    return JSON.stringify(data, null, 2);
  }

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);

      // 验证数据结构
      if (!data.version || !data.exportDate) {
        throw new Error('Invalid data format');
      }

      // 导入各模块数据
      if (data.tasks) this.saveTasks(data.tasks);
      if (data.lists) this.saveLists(data.lists);
      if (data.calendarEvents) this.saveCalendarEvents(data.calendarEvents);
      if (data.notes) this.saveNotes(data.notes);
      if (data.pomodoroSettings) this.savePomodoroSettings(data.pomodoroSettings);
      if (data.pomodoroStats) this.savePomodoroStats(data.pomodoroStats);
      if (data.appSettings) this.saveAppSettings(data.appSettings);
      if (data.userProfile) this.saveUserProfile(data.userProfile);
      if (data.theme) this.saveTheme(data.theme);

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // ========== 清理方法 ==========
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.removeItem(key);
    });
  }

  clearModuleData(module: 'tasks' | 'calendar' | 'notes' | 'pomodoro' | 'settings'): void {
    switch (module) {
      case 'tasks':
        this.removeItem(STORAGE_KEYS.TASKS);
        this.removeItem(STORAGE_KEYS.LISTS);
        break;
      case 'calendar':
        this.removeItem(STORAGE_KEYS.CALENDAR_EVENTS);
        break;
      case 'notes':
        this.removeItem(STORAGE_KEYS.NOTES);
        break;
      case 'pomodoro':
        this.removeItem(STORAGE_KEYS.POMODORO_SETTINGS);
        this.removeItem(STORAGE_KEYS.POMODORO_STATS);
        break;
      case 'settings':
        this.removeItem(STORAGE_KEYS.APP_SETTINGS);
        this.removeItem(STORAGE_KEYS.USER_PROFILE);
        this.removeItem(STORAGE_KEYS.THEME);
        break;
    }
  }

  // ========== 存储空间管理 ==========
  getStorageInfo(): StorageInfo {
    let totalSize = 0;
    const details: Record<string, number> = {};

    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const item = localStorage.getItem(key);
      if (item) {
        const size = new Blob([item]).size;
        totalSize += size;
        details[name] = size;
      }
    });

    return {
      totalSize,
      details,
      available: 5 * 1024 * 1024, // 5MB (localStorage limit)
      used: totalSize,
      percentage: (totalSize / (5 * 1024 * 1024)) * 100,
    };
  }
}

// 类型定义
interface PomodoroSettings {
  focusDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
}

interface PomodoroStats {
  daily: Record<string, PomodoroSession[]>;
  weekly: Record<string, number>;
  monthly: Record<string, number>;
  total: {
    sessionsCompleted: number;
    totalFocusMinutes: number;
    totalBreakMinutes: number;
    longestStreak: number;
    currentStreak: number;
  };
}

interface PomodoroSession {
  startTime: Date;
  endTime: Date;
  duration: number;
  type: 'focus' | 'break' | 'longBreak';
  completed: boolean;
  taskId?: string;
}

interface AppSettings {
  language: string;
  weekStartsOn: number;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  smartDateParsing: boolean;
  notifications: {
    enabled: boolean;
    dailyReminder: string;
    sound: string;
    doNotDisturbEnabled: boolean;
    doNotDisturbStart: string;
    doNotDisturbEnd: string;
  };
  theme: {
    colorScheme: string;
    fontSize: 'small' | 'medium' | 'large';
    floatingBallSize: 'small' | 'medium' | 'large';
  };
}

interface UserProfile {
  nickname: string;
  avatar: string;
  email: string;
  phone: string;
  wechatBound: boolean;
  isPremium: boolean;
  premiumExpiresAt?: Date;
}

interface AnalyticsCache {
  data: any;
  timestamp: Date;
}

interface StorageInfo {
  totalSize: number;
  details: Record<string, number>;
  available: number;
  used: number;
  percentage: number;
}

// 导出单例
export const storageService = new StorageService();

// 导出类型
export type {
  PomodoroSettings,
  PomodoroStats,
  PomodoroSession,
  AppSettings,
  UserProfile,
  AnalyticsCache,
  StorageInfo,
};