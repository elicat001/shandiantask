import { Challenge, DailyHabit, DayProgress } from '../types';

const STORAGE_KEY = 'challenge_data';
const HABITS_KEY = 'challenge_habits';

// 默认习惯配置
export const DEFAULT_HABITS: DailyHabit[] = [
  { id: 'h1', name: '早起 (6:00前)', icon: 'sun', category: 'health', description: '养成早起习惯，开启高效一天', isRequired: true },
  { id: 'h2', name: '运动 30分钟', icon: 'dumbbell', category: 'health', description: '每天运动，保持身体健康', isRequired: true },
  { id: 'h3', name: '阅读 30分钟', icon: 'book', category: 'mind', description: '每天阅读，持续学习成长', isRequired: true },
  { id: 'h4', name: '冥想 10分钟', icon: 'brain', category: 'mind', description: '静心冥想，提升专注力', isRequired: false },
  { id: 'h5', name: '写日记/反思', icon: 'pen', category: 'growth', description: '记录每天的收获与反思', isRequired: true },
  { id: 'h6', name: '完成3个任务', icon: 'target', category: 'productivity', description: '每天完成至少3个重要任务', isRequired: true },
  { id: 'h7', name: '番茄钟 4个', icon: 'timer', category: 'productivity', description: '专注工作，完成4个番茄钟', isRequired: false },
  { id: 'h8', name: '联系朋友/家人', icon: 'message', category: 'social', description: '保持社交联系，关心他人', isRequired: false },
];

class ChallengeService {
  // 获取当前挑战
  getChallenge(): Challenge | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
      const challenge = JSON.parse(stored);
      // 转换日期字符串为 Date 对象
      challenge.startDate = new Date(challenge.startDate);
      challenge.progress = challenge.progress.map((p: any) => ({
        ...p,
        date: new Date(p.date),
        habits: p.habits.map((h: any) => ({
          ...h,
          completedAt: h.completedAt ? new Date(h.completedAt) : undefined
        }))
      }));

      // 更新当前天数
      challenge.currentDay = this.calculateCurrentDay(challenge.startDate);

      return challenge;
    } catch (error) {
      console.error('Failed to parse challenge data:', error);
      return null;
    }
  }

  // 保存挑战
  saveChallenge(challenge: Challenge): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
  }

  // 开始新挑战
  startNewChallenge(name: string = '50天重启人生', habits?: DailyHabit[]): Challenge {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const challenge: Challenge = {
      id: `challenge_${Date.now()}`,
      name,
      startDate,
      currentDay: 1,
      isActive: true,
      habits: habits || this.getHabits(),
      progress: [],
      streakDays: 0,
      bestStreak: 0,
      totalTasksCompleted: 0,
      totalPomodoroMinutes: 0
    };

    // 初始化第一天的进度
    this.initializeDayProgress(challenge, 1);
    this.saveChallenge(challenge);

    return challenge;
  }

  // 结束挑战
  endChallenge(): void {
    const challenge = this.getChallenge();
    if (challenge) {
      challenge.isActive = false;
      this.saveChallenge(challenge);
    }
  }

  // 重置挑战
  resetChallenge(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  // 获取习惯列表
  getHabits(): DailyHabit[] {
    const stored = localStorage.getItem(HABITS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_HABITS;
      }
    }
    return DEFAULT_HABITS;
  }

  // 保存习惯列表
  saveHabits(habits: DailyHabit[]): void {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));

    // 更新当前挑战中的习惯
    const challenge = this.getChallenge();
    if (challenge) {
      challenge.habits = habits;
      this.saveChallenge(challenge);
    }
  }

  // 计算当前是第几天
  calculateCurrentDay(startDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return Math.min(Math.max(1, diffDays + 1), 50);
  }

  // 获取或初始化某天的进度
  getDayProgress(challenge: Challenge, day: number): DayProgress {
    let progress = challenge.progress.find(p => p.day === day);

    if (!progress) {
      progress = this.initializeDayProgress(challenge, day);
    }

    return progress;
  }

  // 初始化某天的进度
  private initializeDayProgress(challenge: Challenge, day: number): DayProgress {
    const date = new Date(challenge.startDate);
    date.setDate(date.getDate() + day - 1);

    const isRestDay = day % 7 === 0;

    const progress: DayProgress = {
      day,
      date,
      habits: challenge.habits.map(h => ({
        habitId: h.id,
        completed: false,
        completedAt: undefined
      })),
      tasksCompleted: 0,
      pomodoroMinutes: 0,
      reflection: '',
      mood: undefined,
      isRestDay
    };

    // 添加到挑战进度中
    const existingIndex = challenge.progress.findIndex(p => p.day === day);
    if (existingIndex >= 0) {
      challenge.progress[existingIndex] = progress;
    } else {
      challenge.progress.push(progress);
      challenge.progress.sort((a, b) => a.day - b.day);
    }

    return progress;
  }

  // 更新习惯完成状态
  updateHabitStatus(day: number, habitId: string, completed: boolean): Challenge | null {
    const challenge = this.getChallenge();
    if (!challenge) return null;

    const progress = this.getDayProgress(challenge, day);
    const habit = progress.habits.find(h => h.habitId === habitId);

    if (habit) {
      habit.completed = completed;
      habit.completedAt = completed ? new Date() : undefined;

      // 重新计算统计数据
      this.updateStatistics(challenge);
      this.saveChallenge(challenge);
    }

    return challenge;
  }

  // 更新今日心情
  updateDayMood(day: number, mood: 1 | 2 | 3 | 4 | 5): Challenge | null {
    const challenge = this.getChallenge();
    if (!challenge) return null;

    const progress = this.getDayProgress(challenge, day);
    progress.mood = mood;

    this.saveChallenge(challenge);
    return challenge;
  }

  // 更新今日反思
  updateDayReflection(day: number, reflection: string): Challenge | null {
    const challenge = this.getChallenge();
    if (!challenge) return null;

    const progress = this.getDayProgress(challenge, day);
    progress.reflection = reflection;

    this.saveChallenge(challenge);
    return challenge;
  }

  // 更新任务完成数
  updateTasksCompleted(day: number, count: number): Challenge | null {
    const challenge = this.getChallenge();
    if (!challenge) return null;

    const progress = this.getDayProgress(challenge, day);
    const previousCount = progress.tasksCompleted;
    progress.tasksCompleted = count;

    // 更新总任务数
    challenge.totalTasksCompleted += (count - previousCount);

    this.saveChallenge(challenge);
    return challenge;
  }

  // 更新番茄钟时间
  updatePomodoroTime(day: number, minutes: number): Challenge | null {
    const challenge = this.getChallenge();
    if (!challenge) return null;

    const progress = this.getDayProgress(challenge, day);
    const previousMinutes = progress.pomodoroMinutes;
    progress.pomodoroMinutes = minutes;

    // 更新总时间
    challenge.totalPomodoroMinutes += (minutes - previousMinutes);

    this.saveChallenge(challenge);
    return challenge;
  }

  // 更新统计数据
  private updateStatistics(challenge: Challenge): void {
    // 计算连续天数
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // 按天数排序
    const sortedProgress = [...challenge.progress].sort((a, b) => a.day - b.day);

    for (const progress of sortedProgress) {
      if (progress.isRestDay) continue;

      const requiredHabits = challenge.habits.filter(h => h.isRequired);
      const completedRequired = progress.habits.filter(h => {
        const habit = challenge.habits.find(hab => hab.id === h.habitId);
        return habit?.isRequired && h.completed;
      });

      if (completedRequired.length === requiredHabits.length) {
        tempStreak++;
        if (progress.day === challenge.currentDay || progress.day === challenge.currentDay - 1) {
          currentStreak = tempStreak;
        }
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 0;
        if (progress.day < challenge.currentDay) {
          currentStreak = 0;
        }
      }
    }

    maxStreak = Math.max(maxStreak, tempStreak);

    challenge.streakDays = currentStreak;
    challenge.bestStreak = Math.max(maxStreak, challenge.bestStreak || 0);
  }

  // 检查今天是否已完成所有必做习惯
  isTodayCompleted(): boolean {
    const challenge = this.getChallenge();
    if (!challenge) return false;

    const todayProgress = this.getDayProgress(challenge, challenge.currentDay);
    const requiredHabits = challenge.habits.filter(h => h.isRequired);
    const completedRequired = todayProgress.habits.filter(h => {
      const habit = challenge.habits.find(hab => hab.id === h.habitId);
      return habit?.isRequired && h.completed;
    });

    return completedRequired.length === requiredHabits.length;
  }

  // 获取完成率统计
  getCompletionStats(challenge: Challenge): {
    totalDays: number;
    completedDays: number;
    totalHabits: number;
    completedHabits: number;
    averageMood: number;
    completionRate: number;
  } {
    let completedDays = 0;
    let totalHabits = 0;
    let completedHabits = 0;
    let totalMood = 0;
    let moodCount = 0;

    for (const progress of challenge.progress) {
      if (progress.isRestDay) continue;

      const requiredHabits = challenge.habits.filter(h => h.isRequired);
      const completedRequired = progress.habits.filter(h => {
        const habit = challenge.habits.find(hab => hab.id === h.habitId);
        return habit?.isRequired && h.completed;
      });

      if (completedRequired.length === requiredHabits.length) {
        completedDays++;
      }

      totalHabits += progress.habits.length;
      completedHabits += progress.habits.filter(h => h.completed).length;

      if (progress.mood) {
        totalMood += progress.mood;
        moodCount++;
      }
    }

    return {
      totalDays: challenge.currentDay,
      completedDays,
      totalHabits,
      completedHabits,
      averageMood: moodCount > 0 ? totalMood / moodCount : 3,
      completionRate: totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0
    };
  }
}

export const challengeService = new ChallengeService();