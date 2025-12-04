import React, { useState } from 'react';
import { Plus, Calendar, Trash2, Clock, Timer } from 'lucide-react';

interface Countdown {
  id: string;
  title: string;
  targetDate: Date;
  bgFrom: string;
  bgTo: string;
}

const gradients = [
  { from: 'from-pink-400', to: 'to-rose-500' },
  { from: 'from-blue-400', to: 'to-cyan-400' },
  { from: 'from-emerald-400', to: 'to-teal-500' },
  { from: 'from-amber-400', to: 'to-orange-500' },
  { from: 'from-indigo-400', to: 'to-purple-500' },
  { from: 'from-violet-400', to: 'to-fuchsia-500' },
];

const CountdownView: React.FC = () => {
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [titleInput, setTitleInput] = useState('');
  const [dateInput, setDateInput] = useState('');

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!titleInput.trim() || !dateInput) return;

    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

    const newCountdown: Countdown = {
      id: Date.now().toString(),
      title: titleInput,
      targetDate: new Date(dateInput),
      bgFrom: randomGradient.from,
      bgTo: randomGradient.to,
    };

    setCountdowns([...countdowns, newCountdown]);
    setTitleInput('');
    setDateInput('');
  };

  const getDaysLeft = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="h-full w-full bg-white flex flex-col">
       {/* Header with Form */}
       <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0 gap-4 bg-white z-10">
          <h1 className="text-xl font-semibold text-gray-800 hidden sm:block flex-shrink-0">倒数日</h1>
          
          <form onSubmit={handleAdd} className="flex-1 max-w-2xl flex items-center gap-2">
              <div className="relative flex-1">
                  <input 
                      type="text" 
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      placeholder="事件标题 (例如：生日、纪念日)" 
                      className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sage-400 rounded-lg py-2 pl-4 pr-4 text-sm focus:outline-none transition-all placeholder-gray-400" 
                  />
              </div>
              <div className="relative w-36 sm:w-40 flex-shrink-0">
                   <input 
                      type="date" 
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sage-400 rounded-lg py-2 pl-3 pr-2 text-sm focus:outline-none transition-all text-gray-600"
                  />
              </div>
              <button 
                  type="submit"
                  disabled={!titleInput || !dateInput}
                  className="bg-sage-500 hover:bg-sage-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
              >
                  <Plus size={20} />
              </button>
          </form>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {countdowns.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="grid grid-cols-2 gap-3 mb-8 opacity-20">
                      <div className="w-16 h-16 bg-sage-400 rounded-2xl animate-pulse"></div>
                      <div className="w-16 h-16 bg-sage-300 rounded-2xl transform rotate-12"></div>
                      <div className="w-16 h-16 bg-sage-300 rounded-2xl transform -rotate-12"></div>
                      <div className="w-16 h-16 bg-sage-400 rounded-2xl animate-pulse delay-75"></div>
                  </div>
                  <p className="text-gray-500 font-medium mb-2 text-lg">暂无倒数日</p>
                  <p className="text-sm text-gray-400 text-center max-w-xs leading-relaxed">
                      在上方添加重要的日期，开始记录时间。
                  </p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {countdowns.map(item => {
                      const daysLeft = getDaysLeft(item.targetDate);
                      const isPast = daysLeft < 0;
                      
                      return (
                          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group relative flex flex-col h-48 animate-in fade-in zoom-in duration-300">
                              <div className={`h-20 bg-gradient-to-r ${item.bgFrom} ${item.bgTo} p-4 flex items-start justify-between text-white`}>
                                  <span className="font-semibold text-lg drop-shadow-sm truncate max-w-[85%]">{item.title}</span>
                                  <Timer className="opacity-60" size={18} />
                              </div>
                              
                              <div className="p-4 pt-0 flex-1 flex flex-col justify-end relative">
                                  {/* Floating Number Card */}
                                  <div className="absolute -top-8 left-4 w-20 h-20 bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center border border-gray-50">
                                       <span className={`text-3xl font-bold tracking-tight ${isPast ? 'text-gray-400' : 'text-sage-600'}`}>
                                          {Math.abs(daysLeft)}
                                       </span>
                                       <span className="text-[9px] text-gray-400 uppercase tracking-wider font-bold mt-0.5">
                                          {isPast ? '天前' : daysLeft === 0 ? '今天' : '天后'}
                                       </span>
                                  </div>
                                  
                                  <div className="flex flex-col items-end gap-1">
                                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">目标日期</span>
                                      <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                          <Calendar size={14} className="text-sage-500" />
                                          {item.targetDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                      </span>
                                  </div>

                                  <button 
                                      onClick={() => setCountdowns(countdowns.filter(c => c.id !== item.id))}
                                      className="absolute bottom-4 left-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                      title="删除"
                                  >
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          </div>
                      );
                  })}
              </div>
          )}
      </div>
    </div>
  );
};

export default CountdownView;