-- ============================================
-- 检查表是否存在
-- ============================================

-- 检查所有需要的表是否存在
SELECT
    table_name,
    CASE
        WHEN table_name IS NOT NULL THEN '✅ 存在'
        ELSE '❌ 不存在'
    END as status
FROM (
    VALUES
        ('tasks'),
        ('notes'),
        ('lists'),
        ('pomodoro_settings'),
        ('pomodoro_sessions'),
        ('calendar_events'),
        ('challenges'),
        ('challenge_habits'),
        ('challenge_daily_progress'),
        ('challenge_habit_records'),
        ('user_preferences'),
        ('user_statistics')
) AS required_tables(name)
LEFT JOIN information_schema.tables
    ON table_name = required_tables.name
    AND table_schema = 'public';

-- 检查 pomodoro_sessions 表的列
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'pomodoro_sessions'
ORDER BY ordinal_position;