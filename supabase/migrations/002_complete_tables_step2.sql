-- ============================================
-- 步骤 2: 创建索引和 RLS 策略
-- 在步骤 1 成功后执行
-- ============================================

-- ==================== 索引优化 ====================

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

-- ==================== RLS (行级安全) 策略 ====================

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