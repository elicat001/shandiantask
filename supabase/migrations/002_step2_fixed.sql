-- ============================================
-- 步骤 2 (修复版): 创建索引和 RLS 策略
-- 跳过可能有问题的索引
-- ============================================

-- ==================== 索引优化 ====================

-- 尝试创建番茄钟索引（带错误处理）
DO $$
BEGIN
    -- 只在表和列都存在时创建索引
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'pomodoro_sessions'
        AND column_name = 'started_at'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = 'pomodoro_sessions'
            AND indexname = 'idx_pomodoro_sessions_user_date'
        ) THEN
            CREATE INDEX idx_pomodoro_sessions_user_date ON pomodoro_sessions(user_id, started_at);
            RAISE NOTICE '✅ 创建索引 idx_pomodoro_sessions_user_date';
        ELSE
            RAISE NOTICE '⚠️ 索引 idx_pomodoro_sessions_user_date 已存在';
        END IF;
    ELSE
        RAISE NOTICE '❌ pomodoro_sessions.started_at 列不存在，跳过索引创建';
    END IF;

    -- 创建 task_id 索引
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'pomodoro_sessions'
        AND column_name = 'task_id'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = 'pomodoro_sessions'
            AND indexname = 'idx_pomodoro_sessions_task'
        ) THEN
            CREATE INDEX idx_pomodoro_sessions_task ON pomodoro_sessions(task_id);
            RAISE NOTICE '✅ 创建索引 idx_pomodoro_sessions_task';
        END IF;
    END IF;
END $$;

-- 日历索引（只在表存在时创建）
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'calendar_events'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON calendar_events(user_id, start_date);
        CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(event_type);
        RAISE NOTICE '✅ 日历索引创建完成';
    END IF;
END $$;

-- 挑战索引（只在表存在时创建）
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'challenges'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_challenges_user_active ON challenges(user_id, is_active);
        RAISE NOTICE '✅ 挑战索引创建完成';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'challenge_daily_progress'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge_day ON challenge_daily_progress(challenge_id, day_number);
        RAISE NOTICE '✅ 挑战进度索引创建完成';
    END IF;
END $$;

-- 统计索引（只在表存在时创建）
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'user_statistics'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_user_statistics_user_date ON user_statistics(user_id, date);
        RAISE NOTICE '✅ 统计索引创建完成';
    END IF;
END $$;

-- ==================== RLS (行级安全) 策略 ====================

-- 为每个表启用 RLS（只在表存在时）
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN (
            'pomodoro_settings',
            'pomodoro_sessions',
            'calendar_events',
            'challenges',
            'challenge_habits',
            'challenge_daily_progress',
            'challenge_habit_records',
            'user_preferences',
            'user_statistics'
        )
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl.table_name);
        RAISE NOTICE '✅ 为表 % 启用 RLS', tbl.table_name;
    END LOOP;
END $$;

-- 创建 RLS 策略（只为存在的表创建）

-- 番茄钟设置策略
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pomodoro_settings') THEN
        DROP POLICY IF EXISTS "Users can CRUD own pomodoro settings" ON pomodoro_settings;
        CREATE POLICY "Users can CRUD own pomodoro settings" ON pomodoro_settings
            FOR ALL USING (auth.uid() = user_id);
        RAISE NOTICE '✅ 创建 pomodoro_settings 策略';
    END IF;
END $$;

-- 番茄钟会话策略
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pomodoro_sessions') THEN
        DROP POLICY IF EXISTS "Users can CRUD own pomodoro sessions" ON pomodoro_sessions;
        CREATE POLICY "Users can CRUD own pomodoro sessions" ON pomodoro_sessions
            FOR ALL USING (auth.uid() = user_id);
        RAISE NOTICE '✅ 创建 pomodoro_sessions 策略';
    END IF;
END $$;

-- 日历事件策略
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calendar_events') THEN
        DROP POLICY IF EXISTS "Users can CRUD own calendar events" ON calendar_events;
        CREATE POLICY "Users can CRUD own calendar events" ON calendar_events
            FOR ALL USING (auth.uid() = user_id);
        RAISE NOTICE '✅ 创建 calendar_events 策略';
    END IF;
END $$;

-- 挑战策略
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'challenges') THEN
        DROP POLICY IF EXISTS "Users can CRUD own challenges" ON challenges;
        CREATE POLICY "Users can CRUD own challenges" ON challenges
            FOR ALL USING (auth.uid() = user_id);
        RAISE NOTICE '✅ 创建 challenges 策略';
    END IF;
END $$;

-- 挑战习惯策略
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'challenge_habits') THEN
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
        RAISE NOTICE '✅ 创建 challenge_habits 策略';
    END IF;
END $$;

-- 挑战进度策略
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'challenge_daily_progress') THEN
        DROP POLICY IF EXISTS "Users can CRUD own challenge progress" ON challenge_daily_progress;
        CREATE POLICY "Users can CRUD own challenge progress" ON challenge_daily_progress
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM challenges
                    WHERE challenges.id = challenge_daily_progress.challenge_id
                    AND challenges.user_id = auth.uid()
                )
            );
        RAISE NOTICE '✅ 创建 challenge_daily_progress 策略';
    END IF;
END $$;

-- 习惯记录策略
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'challenge_habit_records') THEN
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
        RAISE NOTICE '✅ 创建 challenge_habit_records 策略';
    END IF;
END $$;

-- 用户偏好策略
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
        DROP POLICY IF EXISTS "Users can CRUD own preferences" ON user_preferences;
        CREATE POLICY "Users can CRUD own preferences" ON user_preferences
            FOR ALL USING (auth.uid() = user_id);
        RAISE NOTICE '✅ 创建 user_preferences 策略';
    END IF;
END $$;

-- 用户统计策略
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_statistics') THEN
        DROP POLICY IF EXISTS "Users can CRUD own statistics" ON user_statistics;
        CREATE POLICY "Users can CRUD own statistics" ON user_statistics
            FOR ALL USING (auth.uid() = user_id);
        RAISE NOTICE '✅ 创建 user_statistics 策略';
    END IF;
END $$;

-- 最终报告
SELECT
    '执行完成' as status,
    '请检查上方的 NOTICE 消息了解详细执行结果' as message;