import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, BarChart2, Settings, X, Check } from 'lucide-react';

const PomodoroView: React.FC = () => {
  const [focusDuration, setFocusDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'focus') {
          // Play sound or notification here
          setMode('break');
          setTimeLeft(5 * 60);
      } else {
          setMode('focus');
          setTimeLeft(focusDuration * 60);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, mode, focusDuration]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? focusDuration * 60 : 5 * 60);
  };

  const handleDurationChange = (minutes: number) => {
      setFocusDuration(minutes);
      if (mode === 'focus') {
          setIsActive(false);
          setTimeLeft(minutes * 60);
      }
      setIsSettingsOpen(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = mode === 'focus' ? focusDuration * 60 : 5 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="flex items-center justify-center h-full w-full bg-white relative overflow-hidden">
        <div className="absolute top-6 right-6 flex items-center gap-2">
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-400 hover:text-sage-600 transition-colors rounded-full hover:bg-gray-100"
                title="设置"
            >
                <Settings size={24} />
            </button>
            <button className="p-2 text-gray-400 hover:text-sage-600 transition-colors rounded-full hover:bg-gray-100" title="统计">
                <BarChart2 size={24} />
            </button>
        </div>

        {/* Toggle Mode */}
        <div className="absolute top-10 flex bg-gray-100 p-1 rounded-full z-10">
            <button 
                onClick={() => { setMode('focus'); setTimeLeft(focusDuration * 60); setIsActive(false); }}
                className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${mode === 'focus' ? 'bg-white text-sage-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                专注
            </button>
            <button 
                onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
                className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${mode === 'break' ? 'bg-white text-sage-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                休息
            </button>
        </div>

        <div className="flex flex-col items-center gap-12 z-10">
            <div className="relative w-80 h-80 flex items-center justify-center">
                 {/* SVG Circle Progress */}
                 <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="160"
                        cy="160"
                        r="140"
                        stroke="#f3f4f6"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    <circle
                        cx="160"
                        cy="160"
                        r="140"
                        stroke={mode === 'focus' ? '#548c7e' : '#60a5fa'}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 140}
                        strokeDashoffset={2 * Math.PI * 140 * (1 - progress / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                    />
                 </svg>
                 
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700">
                     <span className="text-7xl font-bold tracking-tight tabular-nums text-sage-700">{formatTime(timeLeft)}</span>
                     <span className="text-gray-400 mt-2 text-lg font-medium">
                        {isActive ? (mode === 'focus' ? '保持专注' : '休息一下') : '准备好了吗?'}
                     </span>
                     {mode === 'focus' && (
                         <span className="text-xs text-sage-400 mt-1 font-medium bg-sage-50 px-2 py-0.5 rounded-full">
                             {focusDuration} 分钟
                         </span>
                     )}
                 </div>
            </div>

            <div className="flex items-center gap-6">
                <button 
                    onClick={toggleTimer}
                    className="w-32 h-12 bg-sage-500 hover:bg-sage-600 text-white rounded-full font-medium text-lg shadow-lg shadow-sage-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {isActive ? <><Pause size={20} fill="currentColor" /> 暂停</> : <><Play size={20} fill="currentColor"/> 开始</>}
                </button>
                <button 
                    onClick={resetTimer}
                    className="w-12 h-12 bg-white border border-gray-200 text-gray-500 hover:text-sage-600 hover:border-sage-300 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95"
                    title="重置"
                >
                    <RefreshCw size={20} />
                </button>
            </div>
            
            <div className="text-gray-400 text-sm cursor-pointer hover:text-sage-600 transition-colors flex items-center gap-2">
                选择任务 <span className="opacity-50">▼</span>
            </div>
        </div>

        {/* Settings Modal */}
        {isSettingsOpen && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-80 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Settings size={18} className="text-sage-500" />
                            计时器设置
                        </h3>
                        <button 
                            onClick={() => setIsSettingsOpen(false)}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">专注时长</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[25, 35, 45, 50].map((mins) => (
                                <button
                                    key={mins}
                                    onClick={() => handleDurationChange(mins)}
                                    className={`relative py-3 px-2 rounded-xl text-sm font-medium transition-all border flex flex-col items-center justify-center gap-1 ${
                                        focusDuration === mins
                                        ? 'bg-sage-50 border-sage-500 text-sage-700 ring-1 ring-sage-500'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-sage-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="text-lg font-bold">{mins}</span>
                                    <span className="text-[10px] uppercase text-gray-400">分钟</span>
                                    {focusDuration === mins && (
                                        <div className="absolute top-2 right-2 text-sage-500">
                                            <Check size={14} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                         <button 
                            onClick={() => setIsSettingsOpen(false)}
                            className="text-sm text-sage-600 font-medium hover:underline"
                        >
                            完成
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default PomodoroView;