-- ============================================
-- 诊断 pomodoro_sessions 表问题
-- ============================================

-- 1. 检查 pomodoro_sessions 表是否存在
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'pomodoro_sessions'
        ) THEN '✅ pomodoro_sessions 表存在'
        ELSE '❌ pomodoro_sessions 表不存在'
    END as table_status;

-- 2. 如果表存在，显示其列信息
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'pomodoro_sessions'
ORDER BY ordinal_position;

-- 3. 检查是否有任何索引已存在
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename = 'pomodoro_sessions';

-- 4. 尝试只创建 pomodoro_sessions 表（如果不存在）
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    session_type VARCHAR(20) NOT NULL,
    duration INTEGER NOT NULL,
    planned_duration INTEGER NOT NULL,
    completed BOOLEAN DEFAULT false,
    interrupted BOOLEAN DEFAULT false,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 再次检查表结构
SELECT
    '表创建后的列：' as description,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'pomodoro_sessions'
ORDER BY ordinal_position;