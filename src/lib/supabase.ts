import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 调试：打印环境变量状态（仅在生产环境）
if (import.meta.env.MODE === 'production') {
  console.log('Environment check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl.length,
    keyLength: supabaseAnonKey.length
  });
}

// 如果缺少环境变量，使用占位符避免应用崩溃
let finalUrl = supabaseUrl;
let finalKey = supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables');

  if (!supabaseUrl) {
    console.error('VITE_SUPABASE_URL is not set');
    finalUrl = 'https://placeholder.supabase.co';
  }

  if (!supabaseAnonKey) {
    console.error('VITE_SUPABASE_ANON_KEY is not set');
    finalKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MjQsImV4cCI6MTk2MDc2ODgyNH0.placeholder';
  }

  // 在页面上显示错误提示
  if (typeof window !== 'undefined' && import.meta.env.MODE === 'production') {
    setTimeout(() => {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 16px;
        border-radius: 8px;
        z-index: 9999;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      `;
      errorDiv.innerHTML = `
        <strong>⚠️ 配置错误</strong><br>
        缺少 Supabase 环境变量。<br>
        请在 Vercel 中配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。
      `;
      document.body.appendChild(errorDiv);
    }, 1000);
  }
}

// 创建 Supabase 客户端
export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          completed: boolean;
          completed_at: string | null;
          due_date: string | null;
          priority: 'none' | 'low' | 'medium' | 'high';
          order_index: number;
          user_id: string;
          list_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          due_date?: string | null;
          priority?: 'none' | 'low' | 'medium' | 'high';
          order_index?: number;
          user_id: string;
          list_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          due_date?: string | null;
          priority?: 'none' | 'low' | 'medium' | 'high';
          order_index?: number;
          list_id?: string;
          updated_at?: string;
        };
      };
      lists: {
        Row: {
          id: string;
          name: string;
          color: string | null;
          icon: string | null;
          is_default: boolean;
          order_index: number;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string | null;
          icon?: string | null;
          is_default?: boolean;
          order_index?: number;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string | null;
          icon?: string | null;
          is_default?: boolean;
          order_index?: number;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: string | null;
          pinned: boolean;
          archived: boolean;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category?: string | null;
          pinned?: boolean;
          archived?: boolean;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category?: string | null;
          pinned?: boolean;
          archived?: boolean;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

export default supabase;