import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TaskView from './components/tasks/TaskView';
import CalendarView from './components/calendar/CalendarView';
import NoteView from './components/notes/NoteView';
import PomodoroView from './components/pomodoro/PomodoroView';
import CountdownView from './components/countdown/CountdownView';
import SettingsView from './components/settings/SettingsView';
import { Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.TASKS);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.TASKS:
        return <TaskView />;
      case Tab.CALENDAR:
        return <CalendarView />;
      case Tab.NOTES:
        return <NoteView />;
      case Tab.POMODORO:
        return <PomodoroView />;
      case Tab.COUNTDOWN:
        return <CountdownView />;
      case Tab.SETTINGS:
        return <SettingsView />;
      default:
        return <TaskView />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-screen h-screen bg-gray-100 overflow-hidden font-sans text-gray-900 selection:bg-sage-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 h-full overflow-hidden relative md:shadow-2xl md:rounded-l-3xl bg-white md:ml-[-20px] z-10 border-t md:border-t-0 md:border-l border-gray-100/50">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
