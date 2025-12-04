import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame, Target, Calendar, CheckCircle, Trophy, Star,
  Heart, Brain, Zap, Sun, Moon, Coffee, Plus, X, Edit2, Trash2,
  Book, Dumbbell, MessageCircle, PenTool, Music, Timer, Briefcase, Home, Smile,
  RefreshCw, Settings, Award, TrendingUp, RotateCcw
} from 'lucide-react';
import { Challenge, DailyHabit, DayProgress } from '../../types';
import { challengeService, DEFAULT_HABITS } from '../../services/challengeService';

const ChallengeView: React.FC = () => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [challengeName, setChallengeName] = useState('50天重启人生');
  const [customHabits, setCustomHabits] = useState<DailyHabit[]>(DEFAULT_HABITS);
  const [todayReflection, setTodayReflection] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 加载挑战数据
  useEffect(() => {
    loadChallenge();
  }, []);

  const loadChallenge = () => {
    setIsLoading(true);
    const savedChallenge = challengeService.getChallenge();

    if (savedChallenge && savedChallenge.isActive) {
      setChallenge(savedChallenge);
      setSelectedDay(savedChallenge.currentDay);

      // 加载今日反思
      const todayProgress = challengeService.getDayProgress(savedChallenge, savedChallenge.currentDay);
      setTodayReflection(todayProgress.reflection || '');
    } else {
      setShowStartModal(true);
    }
    setIsLoading(false);
  };

  // 开始新挑战
  const startNewChallenge = () => {
    const newChallenge = challengeService.startNewChallenge(challengeName, customHabits);
    setChallenge(newChallenge);
    setSelectedDay(newChallenge.currentDay);
    setShowStartModal(false);
  };

  // 重置挑战
  const resetChallenge = () => {
    if (confirm('确定要重置挑战吗？所有进度将被清除。')) {
      challengeService.resetChallenge();
      setChallenge(null);
      setSelectedDay(1);
      setTodayReflection('');
      setShowStartModal(true);
    }
  };

  // 结束挑战
  const endChallenge = () => {
    if (confirm('确定要结束当前挑战吗？')) {
      challengeService.endChallenge();
      loadChallenge();
    }
  };

  // 获取选中日期的进度
  const selectedDayProgress = useMemo(() => {
    if (!challenge) return null;
    return challengeService.getDayProgress(challenge, selectedDay);
  }, [challenge, selectedDay]);

  // 获取选中日期的习惯完成状态
  const selectedDayHabits = useMemo(() => {
    if (!selectedDayProgress) return {};
    return selectedDayProgress.habits.reduce((acc, h) => ({
      ...acc,
      [h.habitId]: h.completed
    }), {} as Record<string, boolean>);
  }, [selectedDayProgress]);

  // 计算选中日期的完成率
  const selectedDayCompletionRate = useMemo(() => {
    if (!selectedDayProgress) return 0;
    const total = selectedDayProgress.habits.length;
    const completed = selectedDayProgress.habits.filter(h => h.completed).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [selectedDayProgress]);

  // 获取统计数据
  const stats = useMemo(() => {
    if (!challenge) return null;
    return challengeService.getCompletionStats(challenge);
  }, [challenge]);

  // 切换习惯完成状态
  const toggleHabit = (habitId: string) => {
    if (!challenge || selectedDay > challenge.currentDay) return;

    const updatedChallenge = challengeService.updateHabitStatus(selectedDay, habitId, !selectedDayHabits[habitId]);
    if (updatedChallenge) {
      setChallenge({ ...updatedChallenge });
    }
  };

  // 更新心情
  const updateMood = (mood: 1 | 2 | 3 | 4 | 5) => {
    if (!challenge || selectedDay > challenge.currentDay) return;

    const updatedChallenge = challengeService.updateDayMood(selectedDay, mood);
    if (updatedChallenge) {
      setChallenge({ ...updatedChallenge });
    }
  };

  // 保存反思
  const saveReflection = () => {
    if (!challenge || selectedDay > challenge.currentDay) return;

    const updatedChallenge = challengeService.updateDayReflection(selectedDay, todayReflection);
    if (updatedChallenge) {
      setChallenge({ ...updatedChallenge });
    }
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
      coffee: <Coffee size={size} />,
      music: <Music size={size} />,
      briefcase: <Briefcase size={size} />,
      home: <Home size={size} />,
      star: <Star size={size} />
    };
    return icons[iconName] || <Star size={size} />;
  };

  // 获取分类颜色
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      health: 'bg-red-100 text-red-600 border-red-200',
      mind: 'bg-purple-100 text-purple-600 border-purple-200',
      productivity: 'bg-blue-100 text-blue-600 border-blue-200',
      social: 'bg-green-100 text-green-600 border-green-200',
      growth: 'bg-amber-100 text-amber-600 border-amber-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // 心情表情
  const moodEmojis = ['😢', '😕', '😐', '🙂', '😄'];

  // 当选中日期改变时，更新反思内容
  useEffect(() => {
    if (selectedDayProgress) {
      setTodayReflection(selectedDayProgress.reflection || '');
    }
  }, [selectedDayProgress]);

  // 添加自定义习惯
  const addCustomHabit = () => {
    const newHabit: DailyHabit = {
      id: `custom_${Date.now()}`,
      name: '新习惯',
      icon: 'star',
      category: 'growth',
      description: '自定义习惯',
      isRequired: false
    };
    setCustomHabits([...customHabits, newHabit]);
  };

  // 删除自定义习惯
  const removeCustomHabit = (id: string) => {
    setCustomHabits(customHabits.filter(h => h.id !== id));
  };

  // 编辑自定义习惯
  const editCustomHabit = (id: string, updates: Partial<DailyHabit>) => {
    setCustomHabits(customHabits.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  // 开始挑战模态框
  if (showStartModal) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Flame size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">开始50天挑战</h2>
            <p className="text-gray-500">通过50天的坚持，养成良好习惯，重启人生</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">挑战名称</label>
            <input
              type="text"
              value={challengeName}
              onChange={(e) => setChallengeName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="给你的挑战起个名字"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-700">选择习惯</label>
              <button
                onClick={addCustomHabit}
                className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
              >
                <Plus size={16} />
                添加自定义
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {customHabits.map(habit => (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(habit.category)}`}>
                    {getHabitIcon(habit.icon)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">{habit.name}</span>
                      {habit.isRequired && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded">必做</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{habit.description}</p>
                  </div>
                  {habit.id.startsWith('custom_') && (
                    <button
                      onClick={() => removeCustomHabit(habit.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={startNewChallenge}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
            >
              开始挑战
            </button>
            {challenge && !challenge.isActive && (
              <button
                onClick={() => setShowStartModal(false)}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300"
              >
                取消
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500 mb-4">没有活跃的挑战</p>
          <button
            onClick={() => setShowStartModal(true)}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            开始新挑战
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round((challenge.currentDay / 50) * 100);

  return (
    <div className="flex flex-col h-full bg-gray-50 w-full overflow-hidden">
      {/* Header */}
      <div className="h-14 md:h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0 bg-white">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Flame className="text-orange-500" size={24} />
          {challenge.name}
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
            <Flame size={16} />
            <span>连续 {challenge.streakDays} 天</span>
          </div>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="设置"
          >
            <Settings size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* 进度总览 */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 md:p-6 text-white mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Day {challenge.currentDay} / 50</h2>
              <p className="text-orange-100 text-sm">
                {challenge.currentDay === 50 ? '恭喜完成挑战！' :
                 challenge.currentDay >= 40 ? '最后冲刺，加油！' :
                 challenge.currentDay >= 20 ? '已过半程，继续坚持！' :
                 '挑战进行中，继续加油！'}
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              {challenge.currentDay === 50 ? <Trophy size={32} /> : <Flame size={32} />}
            </div>
          </div>

          {/* 进度条 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>总进度</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-3 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            <div className="bg-white/20 backdrop-blur rounded-xl p-2 md:p-3 text-center">
              <div className="text-xl md:text-2xl font-bold">{stats?.completedDays || 0}</div>
              <div className="text-[10px] md:text-xs text-orange-100">完美天数</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-2 md:p-3 text-center">
              <div className="text-xl md:text-2xl font-bold">{challenge.bestStreak}</div>
              <div className="text-[10px] md:text-xs text-orange-100">最长连续</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-2 md:p-3 text-center">
              <div className="text-xl md:text-2xl font-bold">{challenge.totalTasksCompleted}</div>
              <div className="text-[10px] md:text-xs text-orange-100">完成任务</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-2 md:p-3 text-center">
              <div className="text-xl md:text-2xl font-bold">{Math.round(challenge.totalPomodoroMinutes / 60)}h</div>
              <div className="text-[10px] md:text-xs text-orange-100">专注时长</div>
            </div>
          </div>
        </div>

        {/* 日历进度 */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-orange-500" />
            挑战日历 - {selectedDay === challenge.currentDay ? '今天' : `第${selectedDay}天`}
          </h3>
          <div className="grid grid-cols-10 gap-1 md:gap-2">
            {Array.from({ length: 50 }, (_, i) => {
              const day = i + 1;
              const progress = challenge.progress.find(p => p.day === day);
              const isCompleted = progress && progress.habits.filter(h => {
                const habit = challenge.habits.find(hab => hab.id === h.habitId);
                return habit?.isRequired && h.completed;
              }).length === challenge.habits.filter(h => h.isRequired).length;
              const isToday = day === challenge.currentDay;
              const isSelected = day === selectedDay;
              const isPast = day < challenge.currentDay;
              const isFuture = day > challenge.currentDay;
              const hasData = !!progress;

              return (
                <button
                  key={day}
                  onClick={() => !isFuture && setSelectedDay(day)}
                  disabled={isFuture}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-xs md:text-sm font-medium transition-all
                    ${isSelected ? 'ring-2 ring-orange-400 scale-110' : ''}
                    ${isToday ? 'bg-orange-500 text-white shadow-lg' : ''}
                    ${!isToday && isPast && isCompleted ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                    ${!isToday && isPast && hasData && !isCompleted ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
                    ${!isToday && isPast && !hasData ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : ''}
                    ${isFuture ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
              <span>完成</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-100 border border-red-200" />
              <span>未完成</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-500" />
              <span>今天</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
              <span>未记录</span>
            </div>
          </div>
        </div>

        {/* 选中日期的习惯 */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Target size={18} className="text-orange-500" />
              第{selectedDay}天习惯
            </h3>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500">完成率</div>
              <div className={`px-2 py-1 rounded-full text-sm font-medium ${
                selectedDayCompletionRate >= 80 ? 'bg-green-100 text-green-600' :
                selectedDayCompletionRate >= 50 ? 'bg-amber-100 text-amber-600' :
                'bg-red-100 text-red-600'
              }`}>
                {selectedDayCompletionRate}%
              </div>
            </div>
          </div>

          {selectedDay > challenge.currentDay ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar size={48} className="mx-auto mb-2 opacity-50" />
              <p>未来的日期，请耐心等待</p>
            </div>
          ) : (
            <div className="space-y-3">
              {challenge.habits.map(habit => (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                    ${selectedDayHabits[habit.id]
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'}
                  `}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(habit.category)}`}>
                    {getHabitIcon(habit.icon)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${selectedDayHabits[habit.id] ? 'text-green-700' : 'text-gray-700'}`}>
                        {habit.name}
                      </span>
                      {habit.isRequired && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded">必做</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{habit.description}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    selectedDayHabits[habit.id] ? 'bg-green-500 text-white' : 'border-2 border-gray-300'
                  }`}>
                    {selectedDayHabits[habit.id] && <CheckCircle size={16} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 选中日期的心情和反思 */}
        {selectedDay <= challenge.currentDay && (
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Heart size={18} className="text-pink-500" />
              第{selectedDay}天心情与反思
            </h3>

            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-2 block">今日心情</label>
              <div className="flex items-center justify-around bg-gray-50 rounded-xl p-3">
                {moodEmojis.map((emoji, i) => {
                  const moodValue = (i + 1) as 1 | 2 | 3 | 4 | 5;
                  const isSelected = selectedDayProgress?.mood === moodValue;
                  return (
                    <button
                      key={i}
                      onClick={() => updateMood(moodValue)}
                      className={`text-3xl p-2 rounded-xl transition-all ${
                        isSelected ? 'bg-pink-100 scale-125 shadow-md' : 'hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">今日反思</label>
              <textarea
                value={todayReflection}
                onChange={(e) => setTodayReflection(e.target.value)}
                onBlur={saveReflection}
                placeholder="记录今天的感受和反思..."
                className="w-full p-3 bg-gray-50 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-200 border border-gray-200"
                rows={4}
              />
              <p className="text-xs text-gray-400 mt-1">失焦自动保存</p>
            </div>
          </div>
        )}
      </div>

      {/* 设置模态框 */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">挑战设置</h3>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">挑战进度</span>
                  <span className="text-sm text-gray-500">第 {challenge.currentDay} / 50 天</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">开始日期</span>
                  <span className="text-sm text-gray-500">
                    {challenge.startDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">完成率</span>
                  <span className="text-sm text-gray-500">{stats?.completionRate || 0}%</span>
                </div>
              </div>

              <button
                onClick={resetChallenge}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <RotateCcw size={18} />
                重置挑战
              </button>

              <button
                onClick={endChallenge}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
                结束挑战
              </button>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeView;