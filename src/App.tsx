import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AuthPage from './pages/AuthPage';
import MainApp from '../App'; // 引入原有的完整功能App
import { databaseDiagnostics } from './utils/databaseDiagnostics';
import { databaseFix } from './utils/databaseFix';

function App() {
  useEffect(() => {
    // 开发环境下自动运行诊断和修复
    if (import.meta.env.DEV) {
      console.log('🔧 开发模式：数据库诊断工具已启用');
      // 延迟运行诊断和修复，等待认证加载
      setTimeout(async () => {
        // 先运行诊断
        const diagResults = await databaseDiagnostics.runFullDiagnosis();

        // 检查是否需要修复
        const needsFix = diagResults.connection?.status !== 'connected' ||
                        diagResults.auth?.status !== 'authenticated' ||
                        Object.values(diagResults.tables || {}).some((table: any) => !table.exists);

        if (needsFix && diagResults.auth?.status === 'authenticated') {
          console.log('🔧 检测到数据库问题，尝试自动修复...');
          await databaseFix.runCompleteFix();
        }
      }, 2000);
    }
  }, []);

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