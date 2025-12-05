-- ============================================
-- 完整解决方案 - 适配 Supabase 实际列名
-- 一步到位创建所有索引和策略
-- ============================================

-- ==================== PART 1: 创建索引 ====================
-- 使用正确的列名：start_time 和 end_time

-- 番茄钟索引
DO $$
BEGIN
    -- 只在列存在时创建索引
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pomodoro_sessions'
        AND column_name = 'start_time'
        AND table_schema = 'public'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_time
            ON pomodoro_sessions(user_id, start_time);
        CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_task
            ON pomodoro_sessions(task_id);
        RAISE NOTICE '✅ 番茄钟索引创建成功';
    ELSE
        RAISE NOTICE '⚠️ pomodoro_sessions.start_time 不存在，跳过索引';
    END IF;
END $$;

-- 日历索引
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'calendar_events'
        AND column_name = 'start_time'
        AND table_schema = 'public'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_calendar_events_user_time
            ON calendar_events(user_id, start_time);
        CREATE INDEX IF NOT EXISTS idx_calendar_events_type
            ON calendar_events(event_type);
        RAISE NOTICE '✅ 日历索引创建成功';
    ELSE
        RAISE NOTICE '⚠️ calendar_events.start_time 不存在，跳过索引';
    END IF;
END $$;

-- 挑战索引（这些表的列名应该是正确的）
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'challenges') THEN
        CREATE INDEX IF NOT EXISTS idx_challenges_user_active
            ON challenges(user_id, is_active);
        RAISE NOTICE '✅ 挑战索引创建成功';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'challenge_daily_progress') THEN
        CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge_day
            ON challenge_daily_progress(challenge_id, day_number);
        RAISE NOTICE '✅ 挑战进度索引创建成功';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_statistics') THEN
        CREATE INDEX IF NOT EXISTS idx_user_statistics_user_date
            ON user_statistics(user_id, date);
        RAISE NOTICE '✅ 统计索引创建成功';
    END IF;
END $$;

-- ==================== PART 2: 启用 RLS ====================

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
        RAISE NOTICE '✅ 为 % 表启用 RLS', tbl.table_name;
    END LOOP;
END $$;

-- ==================== PART 3: 创建 RLS 策略 ====================

-- 简单策略（直接基于 user_id）
DO $$
DECLARE
    tbl_name TEXT;
    tables TEXT[] := ARRAY[
        'pomodoro_settings',
        'pomodoro_sessions',
        'calendar_events',
        'challenges',
        'user_preferences',
        'user_statistics'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY tables
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl_name) THEN
            EXECUTE format('DROP POLICY IF EXISTS "Users can CRUD own %s" ON %I', tbl_name, tbl_name);
            EXECUTE format('CREATE POLICY "Users can CRUD own %s" ON %I FOR ALL USING (auth.uid() = user_id)', tbl_name, tbl_name);
            RAISE NOTICE '✅ 创建 % 策略', tbl_name;
        END IF;
    END LOOP;
END $$;

-- 复杂策略（基于关联表的 user_id）
DO $$
BEGIN
    -- challenge_habits 策略
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'challenge_habits') THEN
        DROP POLICY IF EXISTS "Users can view own challenge habits" ON challenge_habits;
        DROP POLICY IF EXISTS "Users can CRUD own challenge habits" ON challenge_habits;

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

    -- challenge_daily_progress 策略
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

    -- challenge_habit_records 策略
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

-- ==================== PART 4: 创建触发器 ====================

-- 自动更新 updated_at 时间戳
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为有 updated_at 列的表创建触发器
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN
        SELECT DISTINCT table_name
        FROM information_schema.columns
        WHERE column_name = 'updated_at'
        AND table_schema = 'public'
        AND table_name IN (
            'pomodoro_settings',
            'calendar_events',
            'challenges',
            'challenge_daily_progress',
            'user_preferences',
            'user_statistics'
        )
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %I', tbl.table_name, tbl.table_name);
        EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', tbl.table_name, tbl.table_name);
        RAISE NOTICE '✅ 创建 % 表的 updated_at 触发器', tbl.table_name;
    END LOOP;
END $$;

-- ==================== PART 5: 验证结果 ====================

-- 显示索引
SELECT
    '索引状态' as category,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('pomodoro_sessions', 'calendar_events', 'challenges', 'challenge_daily_progress', 'user_statistics')
ORDER BY tablename;

-- 显示 RLS 状态
SELECT
    'RLS 状态' as category,
    tablename,
    CASE WHEN rowsecurity THEN '✅ 已启用' ELSE '❌ 未启用' END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'pomodoro_settings', 'pomodoro_sessions', 'calendar_events',
    'challenges', 'challenge_habits', 'challenge_daily_progress',
    'challenge_habit_records', 'user_preferences', 'user_statistics'
)
ORDER BY tablename;

-- 显示策略
SELECT
    '策略状态' as category,
    tablename,
    policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'pomodoro_settings', 'pomodoro_sessions', 'calendar_events',
    'challenges', 'challenge_habits', 'challenge_daily_progress',
    'challenge_habit_records', 'user_preferences', 'user_statistics'
)
ORDER BY tablename;

-- 最终消息
SELECT '✅ 执行完成！请检查上方的 NOTICE 消息了解详细结果。' as message;