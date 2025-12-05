-- ============================================
-- 完整的数据库表结构迁移脚本
-- 包含：番茄钟、日历、挑战等所有功能模块
-- ============================================

-- ==================== 1. 番茄钟模块 ====================

-- 番茄钟设置表（每个用户的个人设置）
CREATE TABLE IF NOT EXISTS pomodoro_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  focus_duration INTEGER DEFAULT 25 NOT NULL, -- 专注时长（分钟）
  short_break_duration INTEGER DEFAULT 5 NOT NULL, -- 短休息时长
  long_break_duration INTEGER DEFAULT 15 NOT NULL, -- 长休息时长
  auto_start_break BOOLEAN DEFAULT false, -- 自动开始休息
  auto_start_pomodoro BOOLEAN DEFAULT false, -- 自动开始下一个番茄钟
  notification_enabled BOOLEAN DEFAULT true, -- 启用通知
  sound_enabled BOOLEAN DEFAULT true, -- 启用声音
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 番茄钟历史记录表
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL, -- 关联的任务（可选）
  session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('focus', 'short_break', 'long_break')),
  duration INTEGER NOT NULL, -- 实际持续时间（秒）
  planned_duration INTEGER NOT NULL, -- 计划持续时间（秒）
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
  color VARCHAR(7), -- 十六进制颜色代码
  reminder_minutes INTEGER, -- 提前多少分钟提醒
  recurring_type VARCHAR(20) CHECK (recurring_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly')),
  recurring_end_date DATE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL, -- 关联的任务（可选）
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
  streak_days INTEGER DEFAULT 0, -- 连续完成天数
  best_streak INTEGER DEFAULT 0, -- 最长连续天数
  total_tasks_completed INTEGER DEFAULT 0,
  total_pomodoro_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 挑战习惯表（每个挑战的习惯配置）
CREATE TABLE IF NOT EXISTS challenge_habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- 图标名称
  category VARCHAR(50) CHECK (category IN ('health', 'mind', 'productivity', 'social', 'growth', 'other')),
  is_required BOOLEAN DEFAULT false, -- 是否必须完成
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 挑战每日进度表
CREATE TABLE IF NOT EXISTS challenge_daily_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5), -- 1-5 心情评分
  reflection TEXT, -- 每日反思
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

-- 用户偏好设置表（扩展）
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- 主题设置
  theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  theme_color VARCHAR(20) DEFAULT 'sage', -- 主题颜色
  font_size INTEGER DEFAULT 14,
  font_family VARCHAR(50) DEFAULT 'system',

  -- 通用设置
  language VARCHAR(10) DEFAULT 'zh-CN',
  timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
  week_starts_on INTEGER DEFAULT 1 CHECK (week_starts_on >= 0 AND week_starts_on <= 6), -- 0=周日, 1=周一
  date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  time_format VARCHAR(20) DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),

  -- 功能开关
  smart_date_parsing BOOLEAN DEFAULT true,
  auto_save BOOLEAN DEFAULT true,
  show_completed_tasks BOOLEAN DEFAULT true,
  enable_sounds BOOLEAN DEFAULT true,
  enable_notifications BOOLEAN DEFAULT true,

  -- 提醒设置
  daily_reminder_time TIME,
  reminder_sound VARCHAR(50) DEFAULT 'default',
  do_not_disturb_start TIME,
  do_not_disturb_end TIME,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ==================== 5. 统计和分析 ====================

-- 用户统计汇总表（用于快速查询）
CREATE TABLE IF NOT EXISTS user_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,

  -- 任务统计
  tasks_created INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_overdue INTEGER DEFAULT 0,

  -- 番茄钟统计
  pomodoros_completed INTEGER DEFAULT 0,
  focus_minutes INTEGER DEFAULT 0,
  break_minutes INTEGER DEFAULT 0,

  -- 笔记统计
  notes_created INTEGER DEFAULT 0,
  notes_updated INTEGER DEFAULT 0,

  -- 习惯统计
  habits_completed INTEGER DEFAULT 0,
  habits_streak INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ==================== 6. 索引优化 ====================

-- 番茄钟索引
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_date ON pomodoro_sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_task ON pomodoro_sessions(task_id);

-- 日历索引
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON calendar_events(user_id, start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(event_type);

-- 挑战索引
CREATE INDEX IF NOT EXISTS idx_challenges_user_active ON challenges(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge_day ON challenge_daily_progress(challenge_id, day_number);

-- 统计索引
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_date ON user_statistics(user_id, date);

-- ==================== 7. RLS (行级安全) 策略 ====================

-- 启用 RLS
ALTER TABLE pomodoro_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_habit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- 番茄钟设置策略
CREATE POLICY "Users can CRUD own pomodoro settings" ON pomodoro_settings
  FOR ALL USING (auth.uid() = user_id);

-- 番茄钟会话策略
CREATE POLICY "Users can CRUD own pomodoro sessions" ON pomodoro_sessions
  FOR ALL USING (auth.uid() = user_id);

-- 日历事件策略
CREATE POLICY "Users can CRUD own calendar events" ON calendar_events
  FOR ALL USING (auth.uid() = user_id);

-- 挑战策略
CREATE POLICY "Users can CRUD own challenges" ON challenges
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own challenge habits" ON challenge_habits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = challenge_habits.challenge_id
      AND challenges.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can CRUD own challenge habits" ON challenge_habits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = challenge_habits.challenge_id
      AND challenges.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can CRUD own challenge progress" ON challenge_daily_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = challenge_daily_progress.challenge_id
      AND challenges.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can CRUD own habit records" ON challenge_habit_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM challenge_daily_progress
      JOIN challenges ON challenges.id = challenge_daily_progress.challenge_id
      WHERE challenge_daily_progress.id = challenge_habit_records.progress_id
      AND challenges.user_id = auth.uid()
    )
  );

-- 用户偏好策略
CREATE POLICY "Users can CRUD own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- 用户统计策略
CREATE POLICY "Users can CRUD own statistics" ON user_statistics
  FOR ALL USING (auth.uid() = user_id);

-- ==================== 8. 触发器 ====================

-- 自动更新 updated_at 时间戳
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER update_pomodoro_settings_updated_at BEFORE UPDATE ON pomodoro_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_challenge_daily_progress_updated_at BEFORE UPDATE ON challenge_daily_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_statistics_updated_at BEFORE UPDATE ON user_statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================== 9. 初始化函数 ====================

-- 创建用户初始化函数（当新用户注册时自动调用）
CREATE OR REPLACE FUNCTION initialize_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- 创建默认番茄钟设置
  INSERT INTO pomodoro_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- 创建默认用户偏好
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建用户注册触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_data();

-- ==================== 10. 实用函数 ====================

-- 获取用户当天统计（简化版，仅统计已创建的表）
CREATE OR REPLACE FUNCTION get_user_daily_stats(p_user_id UUID, p_date DATE)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  -- 简化版本：只统计已存在的表
  SELECT json_build_object(
    'tasks_completed', (
      SELECT COUNT(*) FROM tasks
      WHERE user_id = p_user_id
      AND completed = true
      AND DATE(completed_at) = p_date
    ),
    'pomodoros_completed', (
      SELECT COUNT(*) FROM pomodoro_sessions
      WHERE user_id = p_user_id
      AND completed = true
      AND DATE(started_at) = p_date
    ),
    'focus_minutes', (
      SELECT COALESCE(SUM(duration) / 60, 0) FROM pomodoro_sessions
      WHERE user_id = p_user_id
      AND session_type = 'focus'
      AND DATE(started_at) = p_date
    ),
    'notes_created', (
      SELECT COUNT(*) FROM notes
      WHERE user_id = p_user_id
      AND DATE(created_at) = p_date
    )
  ) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- 计算挑战连续天数
CREATE OR REPLACE FUNCTION calculate_challenge_streak(p_challenge_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  current_date DATE;
  last_date DATE;
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT date,
           COUNT(chr.id) FILTER (WHERE chr.completed = true) as completed,
           COUNT(ch.id) FILTER (WHERE ch.is_required = true) as required
    FROM challenge_daily_progress cdp
    JOIN challenge_habit_records chr ON chr.progress_id = cdp.id
    JOIN challenge_habits ch ON ch.id = chr.habit_id
    WHERE cdp.challenge_id = p_challenge_id
    GROUP BY date
    ORDER BY date DESC
  LOOP
    -- 检查必做习惯是否全部完成
    IF rec.completed >= rec.required THEN
      IF last_date IS NULL OR rec.date = last_date - INTERVAL '1 day' THEN
        streak := streak + 1;
        last_date := rec.date;
      ELSE
        EXIT; -- 连续性断了
      END IF;
    ELSE
      EXIT; -- 有未完成的必做习惯
    END IF;
  END LOOP;

  RETURN streak;
END;
$$ LANGUAGE plpgsql;

-- ==================== END ====================

-- 提交消息
COMMENT ON SCHEMA public IS '完整的数据库表结构，包含番茄钟、日历、挑战等所有功能模块';