import React, { useState, useMemo } from 'react';
import {
  BarChart2, TrendingUp, CheckCircle, Clock, Target,
  PieChart, Activity, Award, Flame, ArrowUp
} from 'lucide-react';
import { Task } from '../../types';

const AnalyticsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  const [tasks] = useState<Task[]>([
    { id: '1', title: '购买杂货', completed: true, completedDate: new Date(), listId: 'inbox', priority: 'high', tags: ['个人'] },
    { id: '2', title: '完成项目', completed: false, listId: 'work', priority: 'medium', tags: ['开发'] },
    { id: '3', title: '晨跑', completed: true, completedDate: new Date(Date.now() - 86400000), listId: 'personal', priority: 'low', tags: ['健康'] },
    { id: '4', title: '阅读', completed: true, completedDate: new Date(Date.now() - 172800000), listId: 'personal', priority: 'none', tags: ['学习'] },
    { id: '5', title: '团队会议', completed: true, completedDate: new Date(Date.now() - 259200000), listId: 'work', priority: 'high', tags: ['工作'] },
    { id: '6', title: '代码审查', completed: true, completedDate: new Date(Date.now() - 345600000), listId: 'work', priority: 'medium', tags: ['开发'] },
    { id: '7', title: '写周报', completed: false, listId: 'work', priority: 'medium', tags: ['工作'] },
    { id: '8', title: '健身', completed: true, completedDate: new Date(Date.now() - 432000000), listId: 'personal', priority: 'low', tags: ['健康'] },
    { id: '9', title: '学习TS', completed: true, completedDate: new Date(Date.now() - 518400000), listId: 'personal', priority: 'medium', tags: ['学习'] },
    { id: '10', title: '整理文档', completed: false, listId: 'work', priority: 'low', tags: ['工作'] },
  ]);

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.filter(t => !t.completed).length;
    const total = tasks.length;
    return {
      completed,
      pending,
      total,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      overdue: 2
    };
  }, [tasks]);

  const priorityData = useMemo(() => {
    const data = { high: 0, medium: 0, low: 0, none: 0 };
    tasks.forEach(t => data[t.priority]++);
    return data;
  }, [tasks]);

  const listData = useMemo(() => {
    const data: Record<string, { total: number; completed: number }> = {};
    tasks.forEach(t => {
      if (!data[t.listId]) data[t.listId] = { total: 0, completed: 0 };
      data[t.listId].total++;
      if (t.completed) data[t.listId].completed++;
    });
    return data;
  }, [tasks]);

  const tagData = useMemo(() => {
    const data: Record<string, number> = {};
    tasks.forEach(t => t.tags.forEach(tag => data[tag] = (data[tag] || 0) + 1));
    return Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [tasks]);

  const dailyData = [
    { label: '一', count: 2 },
    { label: '二', count: 1 },
    { label: '三', count: 3 },
    { label: '四', count: 2 },
    { label: '五', count: 4 },
    { label: '六', count: 1 },
    { label: '日', count: 2 },
  ];

  const listNameMap: Record<string, string> = {
    inbox: '收集箱', work: '工作', personal: '个人'
  };

  const priorityColors: Record<string, string> = {
    high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-blue-500', none: 'bg-gray-300'
  };

  const priorityNames: Record<string, string> = {
    high: '高', medium: '中', low: '低', none: '无'
  };

  const getRangeLabel = (r: string) => {
    if (r === 'week') return '本周';
    if (r === 'month') return '本月';
    return '本年';
  };

  const getTimeRangeClass = (r: string) => {
    if (timeRange === r) return 'bg-white shadow text-sage-600 font-medium';
    return 'text-gray-500 hover:text-gray-700';
  };

  const getRankClass = (i: number) => {
    if (i === 0) return 'bg-amber-100 text-amber-600';
    if (i === 1) return 'bg-gray-200 text-gray-600';
    return 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 w-full overflow-hidden">
      <div className="h-14 md:h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0 bg-white">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart2 className="text-sage-600" size={24} />
          数据分析
        </h1>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['week', 'month', 'year'] as const).map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${getTimeRangeClass(r)}`}
            >
              {getRangeLabel(r)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
                <CheckCircle className="text-sage-600" size={20} />
              </div>
              <div className="flex items-center text-xs font-medium text-green-600">
                <ArrowUp size={14} />12%
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.completed}</div>
            <div className="text-xs text-gray-500 mt-1">已完成任务</div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
              <Clock className="text-blue-600" size={20} />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.pending}</div>
            <div className="text-xs text-gray-500 mt-1">待完成任务</div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
              <Target className="text-amber-600" size={20} />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.rate}%</div>
            <div className="text-xs text-gray-500 mt-1">完成率</div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-3">
              <Flame className="text-red-500" size={20} />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.overdue}</div>
            <div className="text-xs text-gray-500 mt-1">已逾期</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp size={18} className="text-sage-500" />
                完成趋势
              </h3>
              <span className="text-xs text-gray-400">日均 2.1 个</span>
            </div>
            <div className="h-40 flex items-end justify-between gap-2">
              {dailyData.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-sage-500 rounded-t-sm transition-all hover:bg-sage-600"
                    style={{ height: `${(day.count / 5) * 100}%`, minHeight: '8px' }}
                  />
                  <span className="text-[10px] text-gray-400">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <PieChart size={18} className="text-sage-500" />
              优先级分布
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="30 70" strokeDashoffset="0" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="30 70" strokeDashoffset="-30" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="20 80" strokeDashoffset="-60" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#d1d5db" strokeWidth="3" strokeDasharray="20 80" strokeDashoffset="-80" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-800">{stats.total}</div>
                    <div className="text-[10px] text-gray-400">总任务</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {(['high', 'medium', 'low', 'none'] as const).map(key => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${priorityColors[key]}`} />
                      <span className="text-sm text-gray-600">{priorityNames[key]}优先级</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{priorityData[key]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Activity size={18} className="text-sage-500" />
              项目进度
            </h3>
            <div className="space-y-4">
              {Object.entries(listData).map(([id, data]) => {
                const percent = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                return (
                  <div key={id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{listNameMap[id] || id}</span>
                      <span className="text-xs text-gray-500">{data.completed}/{data.total} ({percent}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sage-500 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Award size={18} className="text-sage-500" />
              热门标签
            </h3>
            <div className="space-y-3">
              {tagData.map(([tag, count], i) => (
                <div key={tag} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankClass(i)}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">#{tag}</span>
                      <span className="text-xs text-gray-500">{count} 个任务</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-sage-400 rounded-full" style={{ width: `${(count / (tagData[0]?.[1] || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-sage-500 to-sage-600 rounded-2xl p-4 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">继续保持！</h3>
              <p className="text-sage-100 text-sm">
                你已完成 {stats.completed} 个任务，完成率达到 {stats.rate}%
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Award size={32} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
