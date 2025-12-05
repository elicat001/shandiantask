import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useStore } from '../store/useStore';

interface AuthContextType {
  user: SupabaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, username: string, name?: string) => Promise<any>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const setStoreUser = useStore((state) => state.setUser);
  const clearStoreUser = useStore((state) => state.clearUser);

  // 监听认证状态变化
  useEffect(() => {
    // 获取当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        // 更新全局状态
        setStoreUser({
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.username || '',
          name: session.user.user_metadata?.name || '',
          avatar: session.user.user_metadata?.avatar_url || null
        });
      }
      setLoading(false);
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        // 更新全局状态
        setStoreUser({
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.username || '',
          name: session.user.user_metadata?.name || '',
          avatar: session.user.user_metadata?.avatar_url || null
        });
      } else {
        setUser(null);
        clearStoreUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [setStoreUser, clearStoreUser]);

  // 登录
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // 获取用户详细信息（如果需要从数据库获取）
      if (data.user) {
        // 尝试从 users 表获取更多信息
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userData) {
          // 更新用户元数据
          await supabase.auth.updateUser({
            data: {
              username: userData.username,
              name: userData.name
            }
          });
        }
      }

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error };
    }
  };

  // 注册
  const signUp = async (email: string, password: string, username: string, name?: string) => {
    try {
      // 1. 使用 Supabase Auth 注册
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            name
          }
        }
      });

      if (error) throw error;

      // 2. 在 users 表中创建记录
      if (data.user) {
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            username,
            name: name || null
          });

        if (dbError) {
          console.error('创建用户记录失败:', dbError);
        }

        // 3. 创建默认列表
        const defaultLists = [
          { name: '收件箱', is_default: true, order_index: 0, user_id: data.user.id },
          { name: '工作', is_default: false, order_index: 1, user_id: data.user.id },
          { name: '个人', is_default: false, order_index: 2, user_id: data.user.id }
        ];

        await supabase.from('lists').insert(defaultLists);
      }

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error };
    }
  };

  // 登出
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      clearStoreUser();

      // 清除本地存储
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;