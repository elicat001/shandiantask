import React, { useState, useMemo } from 'react';
import {
  Flame, Target, Calendar, CheckCircle, Circle, Trophy, Star,
  TrendingUp, Heart, Brain, Zap, Users, Sparkles, Play, Pause,
  RotateCcw, ChevronLeft, ChevronRight, Sun, Moon, Coffee,
  Book, Dumbbell, MessageCircle, PenTool, Music, Timer
} from 'lucide-react';
import { Challenge, DailyHabit, DayProgress } from '../../types';

const ChallengeView: React.FC = () => {
  // 默认的50天挑战习惯
  const defaultHabits: DailyHabit[] = [
    { id: 'h1', name: '早起 (6:00前)', icon: 'sun', category: 'health', description: '养成早起习惯，开启高效一天', isRequired: true },
    { id: 'h2', name: '运动 30分钟', icon: 'dumbbell', category: 'health', description: '每天运动，保持身体健康', isRequired: true },
    { id: 'h3', name: '阅读 30分钟', icon: 'book', category: 'mind', description: '每天阅读，持续学习成长', isRequired: true },
    { id: 'h4', name: '冥想 10分钟', icon: 'brain', category: 'mind', description: '静心冥想，提升专注力', isRequired: false },
    { id: 'h5', name: '写日记/反思', icon: 'pen', category: 'growth', description: '记录每天的收获与反思', isRequired: true },
    { id: 'h6', name: '完成3个任务', icon: 'target', category: 'productivity', description: '每天完成至少3个重要任务', isRequired: true },
    { id: 'h7', name: '番茄钟 4个', icon: 'timer', category: 'productivity', description: '专注工作，完成4个番茄钟', isRequired: false },
    { id: 'h8', name: '联系朋友/家人', icon: 'message', category: 'social', description: '保持社交联系，关心他人', isRequired: false },
  ];

  // 生成模拟进度数据
  const generateMockProgress = (startDate: Date, currentDay: number): DayProgress[] => {
    const progress: DayProgress[] = [];
    for (let i = 1; i <= currentDay; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i - 1);
      const isRestDay = i % 7 === 0;
      progress.push({
        day: i,
        date,
        habits: defaultHabits.map(h => ({
          habitId: h.id,
          completed: isRestDay ? false : Math.random() > 0.2,
          completedAt: new Date(),
        })),
        tasksCompleted: isRestDay ? 0 : Math.floor(Math.random() * 5) + 1,
        pomodoroMinutes: isRestDay ? 0 : Math.floor(Math.random() * 120) + 30,
        mood: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
        isRestDay,
      });
    }
    return progress;
  };

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 12);

  const [challenge, setChallenge] = useState<Challenge>({
    id: 'c1',
    name: '50天重启人生',
    startDate,
    currentDay: 13,
    isActive: true,
    habits: defaultHabits,
    progress: generateMockProgress(startDate, 12),
    streakDays: 8,
    bestStreak: 10,
    totalTasksCompleted: 42,
    totalPomodoroMinutes: 840,
  });

  const [selectedDay, setSelectedDay] = useState<number>(challenge.currentDay);
  const [showStartModal, setShowStartModal] = useState(!challenge.isActive);

  // 今日习惯完成状态
  const [todayHabits, setTodayHabits] = useState<Record<string, boolean>>(() => {
    const today = challenge.progress.find(p => p.day === challenge.currentDay);
    if (today) {
      return today.habits.reduce((acc, h) => ({ ...acc, [h.habitId]: h.completed }), {});
    }
    return defaultHabits.reduce((acc, h) => ({ ...acc, [h.id]: false }), {});
  });

  // 计算统计数据
  const stats = useMemo(() => {
    const completedDays = challenge.progress.filter(p => {
      const requiredHabits = challenge.habits.filter(h => h.isRequired);
      const completedRequired = p.habits.filter(h => {
        const habit = challenge.habits.find(hab => hab.id === h.habitId);
        return habit?.isRequired && h.completed;
      });
      return completedRequired.length === requiredHabits.length;
    }).length;

    const totalHabitsCompleted = challenge.progress.reduce((sum, p) =>
      sum + p.habits.filter(h => h.completed).length, 0);

    const avgMood = challenge.progress.length > 0
      ? challenge.progress.reduce((sum, p) => sum + (p.mood || 3), 0) / challenge.progress.length
      : 3;

    return {
      completedDays,
      totalHabitsCompleted,
      avgMood: Math.round(avgMood * 10) / 10,
      progressPercent: Math.round((challenge.currentDay / 50) * 100),
    };
  }, [challenge]);

  // 今日完成率
  const todayCompletionRate = useMemo(() => {
    const total = Object.keys(todayHabits).length;
    const completed = Object.values(todayHabits).filter(Boolean).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [todayHabits]);

  // 切换习惯完成状态
  const toggleHabit = (habitId: string) => {
    setTodayHabits(prev => ({ ...prev, [habitId]: !prev[habitId] }));
  };

  // 获取习惯图标
  const getHabitIcon = (iconName: string, size: number = 18) => {
    const icons: Record<string, React.ReactNode> = {
      sun: <Sun size={size} />,
      dumbbell: <Dumbbell size={size} />,
      book: <Book size={size} />,
      brain: <Brain size={size} />,
      pen: <PenTool size={size} />,
      target: <Target size={size} />,
      timer: <Timer size={size} />,
      message: <MessageCircle size={size} />,
    };
    return icons[iconName] || <Star size={size} />;
  };

  // 获取分类颜色
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      health: 'bg-red-100 text-red-600',
      mind: 'bg-purple-100 text-purple-600',
      productivity: 'bg-blue-100 text-blue-600',
      social: 'bg-green-100 text-green-600',
      growth: 'bg-amber-100 text-amber-600',
    };
    return colors[category] || 'bg-gray-100 text-gray-600';
  };

  // 心情表情
  const moodEmojis = ['😢', '😕', '😐', '🙂', '😄'];

  return (
    <div className="flex flex-col h-full bg-gray-50 w-full overflow-hidden">
      {/* Header */}
      <div className="h-14 md:h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0 bg-white">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Flame className="text-orange-500" size={24} />
          50天挑战
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
            <Flame size={16} />
            <span>连续 {challenge.streakDays} 天</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* 进度总览 */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 md:p-6 text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Day {challenge.currentDay} / 50</h2>
              <p className="text-orange-100 text-sm">
                {challenge.isActive ? '挑战进行中，继续加油！' : '开始你的50天重启之旅'}
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Trophy size={32} />
            </div>
          </div>

          {/* 进度条 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>总进度</span>
              <span>{stats.progressPercent}%</span>
            </div>
            <div className="h-3 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            <div className="bg-white/20 rounded-xl p-2 md:p-3 text-center">
              <div className="text-xl md:text-2xl font-bold">{stats.completedDays}</div>
              <div className="text-[10px] md:text-xs text-orange-100">完美天数</div>
            </div>
            <div className="bg-white/20 rounded-xl p-2 md:p-3 text-center">
              <div className="text-xl md:text-2xl font-bold">{challenge.bestStreak}</div>
              <div className="text-[10px] md:text-xs text-orange-100">最长连续</div>
            </div>
            <div className="bg-white/20 rounded-xl p-2 md:p-3 text-center">
              <div className="text-xl md:text-2xl font-bold">{challenge.totalTasksCompleted}</div>
              <div className="text-[10px] md:text-xs text-orange-100">完成任务</div>
            </div>
            <div className="bg-white/20 rounded-xl p-2 md:p-3 text-center">
              <div className="text-xl md:text-2xl font-bold">{Math.round(challenge.totalPomodoroMinutes / 60)}h</div>
              <div className="text-[10px] md:text-xs text-orange-100">专注时长</div>
            </div>
          </div>
        </div>

        {/* 日历进度 */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-orange-500" />
            挑战日历
          </h3>
          <div className="grid grid-cols-10 gap-1 md:gap-2">
            {Array.from({ length: 50 }, (_, i) => {
              const day = i + 1;
              const progress = challenge.progress.find(p => p.day === day);
              const isCompleted = progress && progress.habits.filter(h => h.completed).length >= 5;
              const isToday = day === challenge.currentDay;
              const isPast = day < challenge.currentDay;
              const isFuture = day > challenge.currentDay;

              return (
                <button
                  key={day}
                  onClick={() => !isFuture && setSelectedDay(day)}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-xs md:text-sm font-medium transition-all
                    ${isToday ? 'bg-orange-500 text-white ring-2 ring-orange-300' : ''}
                    ${isPast && isCompleted ? 'bg-green-100 text-green-700' : ''}
                    ${isPast && !isCompleted ? 'bg-red-100 text-red-700' : ''}
                    ${isFuture ? 'bg-gray-100 text-gray-400' : ''}
                    ${!isToday && !isFuture ? 'hover:ring-2 hover:ring-orange-200 cursor-pointer' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100" />
              <span>完成</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-100" />
              <span>未完成</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-500" />
              <span>今天</span>
            </div>
          </div>
        </div>

        {/* 今日习惯 */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Target size={18} className="text-orange-500" />
              今日习惯
            </h3>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500">完成率</div>
              <div className={`px-2 py-1 rounded-full text-sm font-medium ${
                todayCompletionRate >= 80 ? 'bg-green-100 text-green-600' :
                todayCompletionRate >= 50 ? 'bg-amber-100 text-amber-600' :
                'bg-red-100 text-red-600'
              }`}>
                {todayCompletionRate}%
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {challenge.habits.map(habit => (
              <div
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`
                  flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                  ${todayHabits[habit.id]
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'}
                `}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(habit.category)}`}>
                  {getHabitIcon(habit.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${todayHabits[habit.id] ? 'text-green-700' : 'text-gray-700'}`}>
                      {habit.name}
                    </span>
                    {habit.isRequired && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded">必做</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{habit.description}</p>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  todayHabits[habit.id] ? 'bg-green-500 text-white' : 'border-2 border-gray-300'
                }`}>
                  {todayHabits[habit.id] && <CheckCircle size={16} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 今日关联数据 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 任务完成 */}
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <CheckCircle size={18} className="text-blue-500" />
              今日任务
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-800">3</div>
                <div className="text-sm text-gray-500">已完成任务</div>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                    strokeDasharray={`${(3/5) * 100} 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">3/5</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">目标：每日完成3个任务 ✓</p>
          </div>

          {/* 番茄钟 */}
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Timer size={18} className="text-red-500" />
              今日专注
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-800">85</div>
                <div className="text-sm text-gray-500">专注分钟</div>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ef4444" strokeWidth="3"
                    strokeDasharray={`${(85/100) * 100} 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-red-600">3个</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">目标：每日4个番茄钟 (还差1个)</p>
          </div>
        </div>

        {/* 今日心情 */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Heart size={18} className="text-pink-500" />
            今日心情
          </h3>
          <div className="flex items-center justify-around">
            {moodEmojis.map((emoji, i) => (
              <button
                key={i}
                className={`text-3xl p-2 rounded-xl transition-all ${
                  i === 3 ? 'bg-pink-100 scale-125' : 'hover:bg-gray-100'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <textarea
            placeholder="记录今天的感受和反思..."
            className="w-full mt-4 p-3 bg-gray-50 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-200"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default ChallengeView;
