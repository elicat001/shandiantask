import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, LogIn, UserPlus, CheckCircle2, Loader2 } from 'lucide-react';
import { supabaseApi } from '../services/supabaseApi';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);

  // 表单数据
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  // 表单验证错误
  const [errors, setErrors] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  // 验证邮箱格式
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // 验证表单
  const validateForm = () => {
    const newErrors = {
      email: '',
      username: '',
      password: '',
      confirmPassword: ''
    };
    let isValid = true;

    // 邮箱验证
    if (!formData.email) {
      newErrors.email = '请输入邮箱';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
      isValid = false;
    }

    // 用户名验证（仅注册时）
    if (!isLogin) {
      if (!formData.username) {
        newErrors.username = '请输入用户名';
        isValid = false;
      } else if (formData.username.length < 3) {
        newErrors.username = '用户名至少3个字符';
        isValid = false;
      }
    }

    // 密码验证
    if (!formData.password) {
      newErrors.password = '请输入密码';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少6个字符';
      isValid = false;
    }

    // 确认密码验证（仅注册时）
    if (!isLogin) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '请确认密码';
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次密码输入不一致';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除该字段的错误
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    setError('');
  };

  // 处理登录
  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const result = await supabaseApi.auth.signIn(formData.email, formData.password);

      if (result.success) {
        setSuccess('登录成功！');

        // 设置用户信息到全局状态
        if (result.data?.user) {
          setUser({
            id: result.data.user.id,
            email: result.data.user.email || '',
            username: result.data.user.user_metadata?.username || '',
            name: result.data.user.user_metadata?.name || '',
            avatar: null
          });
        }

        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setError(result.error?.message || '登录失败，请检查邮箱和密码');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理注册
  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const result = await supabaseApi.auth.signUp(
        formData.email,
        formData.password,
        formData.username,
        formData.name
      );

      if (result.success) {
        setSuccess('注册成功！请查看邮箱验证账号');

        // 如果直接登录成功
        if (result.data?.user) {
          setUser({
            id: result.data.user.id,
            email: result.data.user.email || '',
            username: formData.username,
            name: formData.name,
            avatar: null
          });

          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          // 需要邮箱验证，切换到登录模式
          setTimeout(() => {
            setIsLogin(true);
            setFormData(prev => ({
              ...prev,
              confirmPassword: '',
              username: '',
              name: ''
            }));
          }, 2000);
        }
      } else {
        if (result.error?.message?.includes('already registered')) {
          setError('该邮箱已被注册');
        } else {
          setError(result.error?.message || '注册失败，请稍后重试');
        }
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* 头部 */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white text-center">
            <div className="mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
                {isLogin ? (
                  <LogIn className="w-10 h-10 text-white" />
                ) : (
                  <UserPlus className="w-10 h-10 text-white" />
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {isLogin ? '欢迎回来' : '创建账号'}
            </h1>
            <p className="text-blue-100">
              {isLogin ? '登录您的账号继续使用' : '注册新账号开始使用'}
            </p>
          </div>

          {/* 表单区域 */}
          <div className="p-8">
            {/* 成功消息 */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                <span>{success}</span>
              </div>
            )}

            {/* 错误消息 */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* 邮箱输入 */}
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  邮箱地址
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* 用户名输入（仅注册时） */}
              {!isLogin && (
                <div className="mb-5">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    用户名
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.username ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="输入用户名"
                      autoComplete="username"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                  )}
                </div>
              )}

              {/* 姓名输入（仅注册时，可选） */}
              {!isLogin && (
                <div className="mb-5">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    姓名（可选）
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入您的姓名"
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              {/* 密码输入 */}
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={isLogin ? '输入密码' : '设置密码（至少6位）'}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* 确认密码（仅注册时） */}
              {!isLogin && (
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    确认密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="再次输入密码"
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>处理中...</span>
                  </>
                ) : (
                  <span>{isLogin ? '登录' : '注册'}</span>
                )}
              </button>
            </form>

            {/* 切换登录/注册 */}
            <div className="mt-6 text-center">
              <span className="text-gray-600">
                {isLogin ? '还没有账号？' : '已有账号？'}
              </span>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                  setErrors({
                    email: '',
                    username: '',
                    password: '',
                    confirmPassword: ''
                  });
                }}
                className="ml-2 text-blue-600 font-semibold hover:text-blue-700"
              >
                {isLogin ? '立即注册' : '立即登录'}
              </button>
            </div>

            {/* 分隔线 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或</span>
              </div>
            </div>

            {/* 快速登录提示 */}
            <div className="text-center text-gray-500 text-sm">
              <p>快速体验：使用测试账号登录</p>
              <p className="mt-1">
                邮箱: demo@example.com | 密码: demo123
              </p>
            </div>
          </div>
        </div>

        {/* 底部链接 */}
        <div className="mt-4 text-center text-gray-600 text-sm">
          <a href="#" className="hover:text-blue-600">忘记密码？</a>
          <span className="mx-2">·</span>
          <a href="#" className="hover:text-blue-600">使用条款</a>
          <span className="mx-2">·</span>
          <a href="#" className="hover:text-blue-600">隐私政策</a>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;