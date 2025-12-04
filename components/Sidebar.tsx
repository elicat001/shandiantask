import React from 'react';
import { CheckSquare, Calendar, FileText, Timer, Clock, Settings, BarChart2 } from 'lucide-react';
import Avatar from './common/Avatar';
import { Tab } from '../types';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: Tab.TASKS, icon: CheckSquare, label: '任务' },
    { id: Tab.CALENDAR, icon: Calendar, label: '日历' },
    { id: Tab.NOTES, icon: FileText, label: '笔记' },
    { id: Tab.POMODORO, icon: Timer, label: '番茄' },
    { id: Tab.COUNTDOWN, icon: Clock, label: '倒数日' },
    { id: Tab.ANALYTICS, icon: BarChart2, label: '分析' },
  ];

  const getNavClass = (id: Tab) => {
    const base = 'w-full flex flex-col items-center justify-center gap-1 py-1 transition-colors relative group';
    return activeTab === id ? base + ' text-white' : base + ' text-sage-200 hover:text-white';
  };

  const getMobileNavClass = (id: Tab) => {
    const base = 'flex flex-col items-center justify-center gap-0.5 py-1 px-3 transition-colors';
    return activeTab === id ? base + ' text-sage-600' : base + ' text-gray-400';
  };

  return (
    <>
      <div className="hidden md:flex w-[60px] bg-sage-500 flex-col items-center py-6 h-full text-white flex-shrink-0 z-50">
        <div className="flex-1 w-full flex flex-col gap-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={getNavClass(item.id)}
              title={item.label}
            >
              <item.icon size={22} strokeWidth={1.5} />
              <span className="text-[10px] scale-0 group-hover:scale-100 absolute left-14 bg-gray-800 text-white px-2 py-1 rounded transition-transform origin-left whitespace-nowrap z-50">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-6 w-full items-center mb-4">
          <button
            onClick={() => setActiveTab(Tab.SETTINGS)}
            className={activeTab === Tab.SETTINGS ? 'text-white transition-colors' : 'text-sage-200 hover:text-white transition-colors'}
          >
            <Settings size={22} strokeWidth={1.5} />
          </button>
          <div className="cursor-pointer">
            <Avatar size="sm" />
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2 pb-safe">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={getMobileNavClass(item.id)}
            >
              <item.icon size={20} strokeWidth={1.5} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setActiveTab(Tab.SETTINGS)}
            className={getMobileNavClass(Tab.SETTINGS)}
          >
            <Settings size={20} strokeWidth={1.5} />
            <span className="text-[10px]">设置</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
