import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TaskView from './components/tasks/TaskView';
import CalendarView from './components/calendar/CalendarView';
import NoteView from './components/notes/NoteView';
import PomodoroView from './components/pomodoro/PomodoroView';
import ChallengeView from './components/challenge/ChallengeView';
import AnalyticsView from './components/analytics/AnalyticsView';
import SettingsView from './components/settings/SettingsView';
import ErrorBoundary from './components/common/ErrorBoundary';
import { Tab } from './types';
import { useStore } from './store/useStore';
import { autoFixAgent } from './services/autoFixAgent';
import { loggerService } from './services/loggerService';
import { useLogger } from './hooks/useLogger';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.TASKS);
  const initializeApp = useStore((state) => state.initializeApp);
  const theme = useStore((state) => state.theme);

  // 使用日志Hook
  const logger = useLogger({
    component: 'App',
    trackPerformance: true,
    trackUserActions: true
  });

  // 应用初始化
  useEffect(() => {
    initializeApp();

    // 初始化日志系统
    loggerService.info('Application started', {
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }, 'App');

    // 启动自动修复智能体（每小时检查一次）
    autoFixAgent.startAutoFix(1);

    logger.info('Logger and AutoFix agent initialized');

    // 清理函数
    return () => {
      autoFixAgent.stopAutoFix();
      logger.info('Application shutting down');
    };
  }, [initializeApp]);

  // 应用主题
  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  const renderContent = () => {
    // 记录tab切换
    logger.logUserAction('Tab switched', { tab: activeTab });

    switch (activeTab) {
      case Tab.TASKS:
        return <TaskView />;
      case Tab.CALENDAR:
        return <CalendarView />;
      case Tab.NOTES:
        return <NoteView />;
      case Tab.POMODORO:
        return <PomodoroView />;
      case Tab.CHALLENGE:
        return <ChallengeView />;
      case Tab.ANALYTICS:
        return <AnalyticsView />;
      case Tab.SETTINGS:
        return <SettingsView />;
      default:
        return <TaskView />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col md:flex-row w-screen h-screen bg-gray-100 overflow-hidden font-sans text-gray-900 selection:bg-sage-200">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 h-full overflow-hidden relative md:shadow-2xl md:rounded-l-3xl bg-white md:ml-[-20px] z-10 border-t md:border-t-0 md:border-l border-gray-100/50">
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
