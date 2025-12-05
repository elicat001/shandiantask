import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* 公开路由 - 认证页面 */}
          <Route path="/auth" element={<AuthPage />} />

          {/* 受保护的路由 - 需要登录才能访问 */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />

          {/* 其他受保护的路由可以在这里添加 */}
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/notes"
            element={
              <PrivateRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">笔记功能</h1>
                    <p className="text-gray-600">即将推出...</p>
                  </div>
                </div>
              </PrivateRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">日历功能</h1>
                    <p className="text-gray-600">即将推出...</p>
                  </div>
                </div>
              </PrivateRoute>
            }
          />

          <Route
            path="/pomodoro"
            element={
              <PrivateRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">番茄钟</h1>
                    <p className="text-gray-600">即将推出...</p>
                  </div>
                </div>
              </PrivateRoute>
            }
          />

          {/* 捕获所有未匹配的路由，重定向到首页 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;