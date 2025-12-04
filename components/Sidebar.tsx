import React from 'react';
import { CheckSquare, Calendar, FileText, Grid, Timer, Clock, Settings, User } from 'lucide-react';
import { Tab } from '../types';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: Tab.TASKS, icon: CheckSquare, label: 'Tasks' },
    { id: Tab.CALENDAR, icon: Calendar, label: 'Calendar' },
    { id: Tab.NOTES, icon: FileText, label: 'Notes' },
    { id: Tab.QUADRANTS, icon: Grid, label: 'Quadrants' },
    { id: Tab.POMODORO, icon: Timer, label: 'Pomodoro' },
    { id: Tab.COUNTDOWN, icon: Clock, label: 'Countdown' },
  ];

  return (
    <div className="w-[60px] bg-sage-500 flex flex-col items-center py-6 h-full text-white flex-shrink-0 z-50">
      <div className="flex-1 w-full flex flex-col gap-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex flex-col items-center justify-center gap-1 py-1 transition-colors relative group ${
              activeTab === item.id ? 'text-white' : 'text-sage-200 hover:text-white'
            }`}
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
          className={`text-sage-200 hover:text-white transition-colors ${activeTab === Tab.SETTINGS ? 'text-white' : ''}`}
        >
          <Settings size={22} strokeWidth={1.5} />
        </button>
        <div className="w-8 h-8 rounded-full bg-sage-300 overflow-hidden cursor-pointer border-2 border-transparent hover:border-white transition-all">
           <img src="https://picsum.photos/100/100" alt="User" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;