-- ============================================
-- 验证和修复表结构
-- 确保列名与 Supabase 实际结构一致
-- ============================================

-- 1. 检查现有表和列
SELECT
    t.table_name,
    array_agg(c.column_name ORDER BY c.ordinal_position) as columns
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
AND t.table_name IN (
    'pomodoro_sessions',
    'pomodoro_settings',
    'calendar_events',
    'challenges',
    'challenge_habits',
    'challenge_daily_progress',
    'challenge_habit_records',
    'user_preferences',
    'user_statistics'
)
GROUP BY t.table_name
ORDER BY t.table_name;

-- 2. 如果 pomodoro_sessions 表存在但列名不对，修复它
DO $$
BEGIN
    -- 检查表是否存在
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'pomodoro_sessions'
        AND table_schema = 'public'
    ) THEN
        -- 检查是否有 start_time 列
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'pomodoro_sessions'
            AND column_name = 'start_time'
            AND table_schema = 'public'
        ) THEN
            -- 检查是否有 started_at 列需要重命名
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'pomodoro_sessions'
                AND column_name = 'started_at'
                AND table_schema = 'public'
            ) THEN
                ALTER TABLE pomodoro_sessions RENAME COLUMN started_at TO start_time;
                RAISE NOTICE '✅ 重命名 started_at 为 start_time';
            END IF;
        ELSE
            RAISE NOTICE '✅ start_time 列已存在';
        END IF;

        -- 检查 end_time 列
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'pomodoro_sessions'
            AND column_name = 'end_time'
            AND table_schema = 'public'
        ) THEN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'pomodoro_sessions'
                AND column_name = 'ended_at'
                AND table_schema = 'public'
            ) THEN
                ALTER TABLE pomodoro_sessions RENAME COLUMN ended_at TO end_time;
                RAISE NOTICE '✅ 重命名 ended_at 为 end_time';
            END IF;
        ELSE
            RAISE NOTICE '✅ end_time 列已存在';
        END IF;
    ELSE
        -- 如果表不存在，创建它（使用正确的列名）
        CREATE TABLE pomodoro_sessions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
            session_type VARCHAR(20) NOT NULL,
            duration INTEGER NOT NULL,
            planned_duration INTEGER NOT NULL,
            completed BOOLEAN DEFAULT false,
            interrupted BOOLEAN DEFAULT false,
            start_time TIMESTAMPTZ NOT NULL,  -- 正确的列名
            end_time TIMESTAMPTZ,              -- 正确的列名
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE '✅ 创建 pomodoro_sessions 表（使用正确的列名）';
    END IF;
END $$;

-- 3. 类似地检查 calendar_events
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'calendar_events'
        AND table_schema = 'public'
    ) THEN
        -- 检查是否有 start_time 列
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'calendar_events'
            AND column_name = 'start_time'
            AND table_schema = 'public'
        ) THEN
            -- 检查是否有 start_date 列需要重命名
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'calendar_events'
                AND column_name = 'start_date'
                AND table_schema = 'public'
            ) THEN
                ALTER TABLE calendar_events RENAME COLUMN start_date TO start_time;
                RAISE NOTICE '✅ 重命名 start_date 为 start_time';
            END IF;
        ELSE
            RAISE NOTICE '✅ calendar_events.start_time 列已存在';
        END IF;

        -- 检查 end_time 列
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'calendar_events'
            AND column_name = 'end_time'
            AND table_schema = 'public'
        ) THEN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'calendar_events'
                AND column_name = 'end_date'
                AND table_schema = 'public'
            ) THEN
                ALTER TABLE calendar_events RENAME COLUMN end_date TO end_time;
                RAISE NOTICE '✅ 重命名 end_date 为 end_time';
            END IF;
        ELSE
            RAISE NOTICE '✅ calendar_events.end_time 列已存在';
        END IF;
    ELSE
        -- 创建表（使用正确的列名）
        CREATE TABLE calendar_events (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            event_type VARCHAR(50) DEFAULT 'task',
            all_day BOOLEAN DEFAULT false,
            start_time TIMESTAMPTZ NOT NULL,  -- 正确的列名
            end_time TIMESTAMPTZ,              -- 正确的列名
            location VARCHAR(255),
            color VARCHAR(7),
            reminder_minutes INTEGER,
            recurring_type VARCHAR(20) DEFAULT 'none',
            recurring_end_date DATE,
            task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE '✅ 创建 calendar_events 表（使用正确的列名）';
    END IF;
END $$;

-- 4. 最终验证
SELECT
    '验证完成' as status,
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('pomodoro_sessions', 'calendar_events')
AND column_name IN ('start_time', 'end_time', 'started_at', 'ended_at', 'start_date', 'end_date')
ORDER BY table_name, column_name;