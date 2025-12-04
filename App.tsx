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
    <div className="flex w-screen h-screen bg-gray-100 overflow-hidden font-sans text-gray-900 selection:bg-sage-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 h-full overflow-hidden relative shadow-2xl rounded-l-3xl bg-white ml-[-20px] z-10 my-0 border-l border-gray-100/50">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;