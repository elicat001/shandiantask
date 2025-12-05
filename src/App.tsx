import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AuthPage from './pages/AuthPage';
import MainApp from '../App'; // 引入原有的完整功能App

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* 公开路由 - 认证页面 */}
          <Route path="/auth" element={<AuthPage />} />

          {/* 受保护的路由 - 使用原有的完整功能界面 */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <MainApp />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;