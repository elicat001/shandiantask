-- ============================================
-- 修复版索引创建脚本 - 使用正确的列名
-- 根据 Supabase 实际表结构调整
-- ============================================

-- 显示当前表结构（用于验证）
SELECT
    'pomodoro_sessions 表结构：' as info,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'pomodoro_sessions'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ==================== 创建索引（使用正确的列名）====================

-- 番茄钟索引 - 使用 start_time 而不是 started_at
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_date
    ON pomodoro_sessions(user_id, start_time);

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_task
    ON pomodoro_sessions(task_id);

-- 日历索引 - 使用 start_time 而不是 start_date
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date
    ON calendar_events(user_id, start_time);

CREATE INDEX IF NOT EXISTS idx_calendar_events_type
    ON calendar_events(event_type);

-- 挑战索引（这些应该没问题，但再确认一下）
CREATE INDEX IF NOT EXISTS idx_challenges_user_active
    ON challenges(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge_day
    ON challenge_daily_progress(challenge_id, day_number);

-- 统计索引
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_date
    ON user_statistics(user_id, date);

-- ==================== 启用 RLS ====================

-- 为所有相关表启用 RLS
ALTER TABLE pomodoro_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_habit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- ==================== 创建 RLS 策略 ====================

-- 番茄钟设置策略
DROP POLICY IF EXISTS "Users can CRUD own pomodoro settings" ON pomodoro_settings;
CREATE POLICY "Users can CRUD own pomodoro settings" ON pomodoro_settings
    FOR ALL USING (auth.uid() = user_id);

-- 番茄钟会话策略
DROP POLICY IF EXISTS "Users can CRUD own pomodoro sessions" ON pomodoro_sessions;
CREATE POLICY "Users can CRUD own pomodoro sessions" ON pomodoro_sessions
    FOR ALL USING (auth.uid() = user_id);

-- 日历事件策略
DROP POLICY IF EXISTS "Users can CRUD own calendar events" ON calendar_events;
CREATE POLICY "Users can CRUD own calendar events" ON calendar_events
    FOR ALL USING (auth.uid() = user_id);

-- 挑战策略
DROP POLICY IF EXISTS "Users can CRUD own challenges" ON challenges;
CREATE POLICY "Users can CRUD own challenges" ON challenges
    FOR ALL USING (auth.uid() = user_id);

-- 挑战习惯策略
DROP POLICY IF EXISTS "Users can view own challenge habits" ON challenge_habits;
DROP POLICY IF EXISTS "Users can CRUD own challenge habits" ON challenge_habits;

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

-- 挑战进度策略
DROP POLICY IF EXISTS "Users can CRUD own challenge progress" ON challenge_daily_progress;
CREATE POLICY "Users can CRUD own challenge progress" ON challenge_daily_progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM challenges
            WHERE challenges.id = challenge_daily_progress.challenge_id
            AND challenges.user_id = auth.uid()
        )
    );

-- 习惯记录策略
DROP POLICY IF EXISTS "Users can CRUD own habit records" ON challenge_habit_records;
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
DROP POLICY IF EXISTS "Users can CRUD own preferences" ON user_preferences;
CREATE POLICY "Users can CRUD own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- 用户统计策略
DROP POLICY IF EXISTS "Users can CRUD own statistics" ON user_statistics;
CREATE POLICY "Users can CRUD own statistics" ON user_statistics
    FOR ALL USING (auth.uid() = user_id);

-- ==================== 验证 ====================

-- 显示创建的索引
SELECT
    '✅ 成功创建的索引：' as status,
    indexname,
    tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('pomodoro_sessions', 'calendar_events', 'challenges', 'challenge_daily_progress', 'user_statistics')
ORDER BY tablename, indexname;

-- 显示 RLS 状态
SELECT
    '✅ RLS 启用状态：' as status,
    tablename,
    CASE WHEN rowsecurity THEN '已启用' ELSE '未启用' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('pomodoro_settings', 'pomodoro_sessions', 'calendar_events', 'challenges',
                  'challenge_habits', 'challenge_daily_progress', 'challenge_habit_records',
                  'user_preferences', 'user_statistics');