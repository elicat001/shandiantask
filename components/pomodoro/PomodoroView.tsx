import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, BarChart2 } from 'lucide-react';

const PomodoroView: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
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
          setTimeLeft(25 * 60);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus' ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="flex items-center justify-center h-full w-full bg-white relative overflow-hidden">
        <div className="absolute top-6 right-6">
            <button className="p-2 text-gray-400 hover:text-sage-600 transition-colors"><BarChart2 size={24} /></button>
        </div>

        {/* Toggle Mode */}
        <div className="absolute top-10 flex bg-gray-100 p-1 rounded-full">
            <button 
                onClick={() => { setMode('focus'); setTimeLeft(25 * 60); setIsActive(false); }}
                className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${mode === 'focus' ? 'bg-white text-sage-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Focus
            </button>
            <button 
                onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
                className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${mode === 'break' ? 'bg-white text-sage-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Break
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
                     <span className="text-gray-400 mt-2 text-lg font-medium">{isActive ? (mode === 'focus' ? 'Stay Focused' : 'Take a Break') : 'Ready?'}</span>
                 </div>
            </div>

            <div className="flex items-center gap-6">
                <button 
                    onClick={toggleTimer}
                    className="w-32 h-12 bg-sage-500 hover:bg-sage-600 text-white rounded-full font-medium text-lg shadow-lg shadow-sage-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {isActive ? <><Pause size={20} fill="currentColor" /> Pause</> : <><Play size={20} fill="currentColor"/> Start</>}
                </button>
                <button 
                    onClick={resetTimer}
                    className="w-12 h-12 bg-white border border-gray-200 text-gray-500 hover:text-sage-600 hover:border-sage-300 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95"
                >
                    <RefreshCw size={20} />
                </button>
            </div>
            
            <div className="text-gray-400 text-sm cursor-pointer hover:text-sage-600 transition-colors flex items-center gap-2">
                Select Task <span className="opacity-50">▼</span>
            </div>
        </div>
    </div>
  );
};

export default PomodoroView;