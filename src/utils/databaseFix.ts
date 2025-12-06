import { supabase } from '../lib/supabase';

// 数据库修复工具 - 自动创建和修复所有必要的表结构
export const databaseFix = {
  // 执行完整的数据库修复
  async runCompleteFix() {
    console.log('🔧 开始执行数据库修复...');

    try {
      // 1. 首先检查并创建 users 表
      await this.ensureUsersTable();

      // 2. 创建 lists 表
      await this.ensureListsTable();

      // 3. 创建 tasks 表
      await this.ensureTasksTable();

      // 4. 创建 notes 表
      await this.ensureNotesTable();

      // 5. 为当前用户创建默认数据
      await this.ensureDefaultData();

      console.log('✅ 数据库修复完成！');

      // 运行诊断确认修复结果
      const { databaseDiagnostics } = await import('./databaseDiagnostics');
      await databaseDiagnostics.runFullDiagnosis();

      return { success: true };
    } catch (error) {
      console.error('❌ 数据库修复失败:', error);
      return { success: false, error };
    }
  },

  // 确保 users 表存在
  async ensureUsersTable() {
    try {
      // 首先尝试查询表
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') {
        console.log('📝 创建 users 表...');
        // 表不存在，需要在 Supabase 控制台创建
        console.log('⚠️ users 表不存在，请在 Supabase 控制台执行以下 SQL：');
        console.log(`
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
        `);
        return false;
      }

      console.log('✅ users 表已存在');
      return true;
    } catch (error) {
      console.error('检查 users 表失败:', error);
      return false;
    }
  },

  // 确保 lists 表存在
  async ensureListsTable() {
    try {
      const { error } = await supabase
        .from('lists')
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') {
        console.log('📝 创建 lists 表...');
        console.log('⚠️ lists 表不存在，请在 Supabase 控制台执行以下 SQL：');
        console.log(`
CREATE TABLE IF NOT EXISTS lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7),
  icon VARCHAR(50),
  is_default BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can CRUD own lists" ON lists
  FOR ALL USING (auth.uid() = user_id);

-- 创建索引
CREATE INDEX idx_lists_user_id ON lists(user_id);
CREATE INDEX idx_lists_order_index ON lists(order_index);
        `);
        return false;
      }

      console.log('✅ lists 表已存在');
      return true;
    } catch (error) {
      console.error('检查 lists 表失败:', error);
      return false;
    }
  },

  // 确保 tasks 表存在
  async ensureTasksTable() {
    try {
      const { error } = await supabase
        .from('tasks')
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') {
        console.log('📝 创建 tasks 表...');
        console.log('⚠️ tasks 表不存在，请在 Supabase 控制台执行以下 SQL：');
        console.log(`
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  priority VARCHAR(20) DEFAULT 'none',
  order_index INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can CRUD own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- 创建索引
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_order_index ON tasks(order_index);
        `);
        return false;
      }

      console.log('✅ tasks 表已存在');
      return true;
    } catch (error) {
      console.error('检查 tasks 表失败:', error);
      return false;
    }
  },

  // 确保 notes 表存在
  async ensureNotesTable() {
    try {
      const { error } = await supabase
        .from('notes')
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') {
        console.log('📝 创建 notes 表...');
        console.log('⚠️ notes 表不存在，请在 Supabase 控制台执行以下 SQL：');
        console.log(`
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT DEFAULT '',
  summary TEXT,
  category VARCHAR(50),
  pinned BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can CRUD own notes" ON notes
  FOR ALL USING (auth.uid() = user_id);

-- 创建索引
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_pinned ON notes(pinned);
CREATE INDEX idx_notes_archived ON notes(archived);
CREATE INDEX idx_notes_category ON notes(category);
        `);
        return false;
      }

      console.log('✅ notes 表已存在');
      return true;
    } catch (error) {
      console.error('检查 notes 表失败:', error);
      return false;
    }
  },

  // 确保当前用户有默认数据
  async ensureDefaultData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log('⚠️ 用户未登录，跳过默认数据创建');
        return;
      }

      console.log('👤 当前用户:', user.email);

      // 1. 确保用户记录存在
      const { data: userRecord } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!userRecord) {
        console.log('📝 创建用户记录...');
        await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            username: user.user_metadata?.username || user.email!.split('@')[0],
            name: user.user_metadata?.name || null,
          });
      }

      // 2. 确保默认列表存在
      const { data: lists } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', user.id);

      if (!lists || lists.length === 0) {
        console.log('📝 创建默认列表...');
        await supabase
          .from('lists')
          .insert([
            { name: '收件箱', is_default: true, order_index: 0, user_id: user.id },
            { name: '工作', is_default: false, order_index: 1, user_id: user.id },
            { name: '个人', is_default: false, order_index: 2, user_id: user.id },
          ]);
      }

      console.log('✅ 默认数据已就绪');
    } catch (error) {
      console.error('创建默认数据失败:', error);
    }
  },

  // 清理无效数据
  async cleanupInvalidData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 清理没有 list_id 的任务
      const { data: orphanTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', user.id)
        .is('list_id', null);

      if (orphanTasks && orphanTasks.length > 0) {
        console.log(`🧹 发现 ${orphanTasks.length} 个无效任务，正在清理...`);

        // 获取默认列表
        const { data: defaultList } = await supabase
          .from('lists')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();

        if (defaultList) {
          // 将无效任务分配到默认列表
          await supabase
            .from('tasks')
            .update({ list_id: defaultList.id })
            .in('id', orphanTasks.map(t => t.id));

          console.log('✅ 已将无效任务移至默认列表');
        }
      }
    } catch (error) {
      console.error('清理无效数据失败:', error);
    }
  }
};

// 导出到全局以便在控制台调用
if (typeof window !== 'undefined') {
  (window as any).dbFix = databaseFix;
  console.log('💡 数据库修复工具已加载！');
  console.log('   在控制台输入 dbFix.runCompleteFix() 执行完整修复');
}