-- ============================================
-- 步骤 1: 创建基础表结构
-- 分步执行，便于调试
-- ============================================

-- ==================== 1. 番茄钟模块 ====================

-- 番茄钟设置表（每个用户的个人设置）
CREATE TABLE IF NOT EXISTS pomodoro_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  focus_duration INTEGER DEFAULT 25 NOT NULL,
  short_break_duration INTEGER DEFAULT 5 NOT NULL,
  long_break_duration INTEGER DEFAULT 15 NOT NULL,
  auto_start_break BOOLEAN DEFAULT false,
  auto_start_pomodoro BOOLEAN DEFAULT false,
  notification_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 番茄钟历史记录表
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('focus', 'short_break', 'long_break')),
  duration INTEGER NOT NULL,
  planned_duration INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  interrupted BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 2. 日历模块 ====================

-- 日历事件表
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) DEFAULT 'task' CHECK (event_type IN ('task', 'holiday', 'birthday', 'meeting', 'reminder', 'other')),
  all_day BOOLEAN DEFAULT false,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location VARCHAR(255),
  color VARCHAR(7),
  reminder_minutes INTEGER,
  recurring_type VARCHAR(20) CHECK (recurring_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly')),
  recurring_end_date DATE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 3. 挑战模块 ====================

-- 挑战主表
CREATE TABLE IF NOT EXISTS challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  total_days INTEGER DEFAULT 50 NOT NULL,
  current_day INTEGER DEFAULT 1 NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  streak_days INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_tasks_completed INTEGER DEFAULT 0,
  total_pomodoro_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 挑战习惯表
CREATE TABLE IF NOT EXISTS challenge_habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(50) CHECK (category IN ('health', 'mind', 'productivity', 'social', 'growth', 'other')),
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 挑战每日进度表
CREATE TABLE IF NOT EXISTS challenge_daily_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  reflection TEXT,
  tasks_completed INTEGER DEFAULT 0,
  pomodoro_minutes INTEGER DEFAULT 0,
  is_rest_day BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, day_number)
);

-- 习惯完成记录表
CREATE TABLE IF NOT EXISTS challenge_habit_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  progress_id UUID REFERENCES challenge_daily_progress(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES challenge_habits(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(progress_id, habit_id)
);

-- ==================== 4. 用户偏好设置 ====================

-- 用户偏好设置表
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  theme_color VARCHAR(20) DEFAULT 'sage',
  font_size INTEGER DEFAULT 14,
  font_family VARCHAR(50) DEFAULT 'system',
  language VARCHAR(10) DEFAULT 'zh-CN',
  timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
  week_starts_on INTEGER DEFAULT 1 CHECK (week_starts_on >= 0 AND week_starts_on <= 6),
  date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  time_format VARCHAR(20) DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
  smart_date_parsing BOOLEAN DEFAULT true,
  auto_save BOOLEAN DEFAULT true,
  show_completed_tasks BOOLEAN DEFAULT true,
  enable_sounds BOOLEAN DEFAULT true,
  enable_notifications BOOLEAN DEFAULT true,
  daily_reminder_time TIME,
  reminder_sound VARCHAR(50) DEFAULT 'default',
  do_not_disturb_start TIME,
  do_not_disturb_end TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ==================== 5. 统计和分析 ====================

-- 用户统计汇总表
CREATE TABLE IF NOT EXISTS user_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  tasks_created INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_overdue INTEGER DEFAULT 0,
  pomodoros_completed INTEGER DEFAULT 0,
  focus_minutes INTEGER DEFAULT 0,
  break_minutes INTEGER DEFAULT 0,
  notes_created INTEGER DEFAULT 0,
  notes_updated INTEGER DEFAULT 0,
  habits_completed INTEGER DEFAULT 0,
  habits_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);