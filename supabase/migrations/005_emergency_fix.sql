-- ============================================
-- 紧急修复脚本 - 解决数据库失灵问题
-- ============================================

-- 1. 检查并修复基础表
DO $$
BEGIN
    -- 确保 users 表存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
            id UUID PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(100) UNIQUE NOT NULL,
            name VARCHAR(255),
            avatar_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE '✅ 创建 users 表';
    END IF;

    -- 确保 lists 表存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lists') THEN
        CREATE TABLE lists (
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
        RAISE NOTICE '✅ 创建 lists 表';
    END IF;

    -- 确保 tasks 表存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
        CREATE TABLE tasks (
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
        RAISE NOTICE '✅ 创建 tasks 表';
    END IF;

    -- 确保 notes 表存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes') THEN
        CREATE TABLE notes (
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
        RAISE NOTICE '✅ 创建 notes 表';
    END IF;
END $$;

-- 2. 启用 RLS（如果未启用）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 3. 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can CRUD own lists" ON lists;
DROP POLICY IF EXISTS "Users can CRUD own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can CRUD own notes" ON notes;

-- 4. 创建新的 RLS 策略
-- Users 策略
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Lists 策略
CREATE POLICY "Users can CRUD own lists" ON lists
    FOR ALL USING (auth.uid() = user_id);

-- Tasks 策略
CREATE POLICY "Users can CRUD own tasks" ON tasks
    FOR ALL USING (auth.uid() = user_id);

-- Notes 策略
CREATE POLICY "Users can CRUD own notes" ON notes
    FOR ALL USING (auth.uid() = user_id);

-- 5. 为每个用户创建默认列表（如果不存在）
INSERT INTO lists (name, is_default, order_index, user_id)
SELECT
    '收件箱' as name,
    true as is_default,
    0 as order_index,
    id as user_id
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM lists
    WHERE lists.user_id = auth.users.id
    AND lists.is_default = true
)
ON CONFLICT DO NOTHING;

-- 6. 创建或更新触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为每个表创建触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_lists_updated_at ON lists;
CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. 验证修复结果
DO $$
DECLARE
    table_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- 统计表数量
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('users', 'lists', 'tasks', 'notes');

    -- 统计策略数量
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('users', 'lists', 'tasks', 'notes');

    RAISE NOTICE '✅ 修复完成！';
    RAISE NOTICE '   - 表数量: %', table_count;
    RAISE NOTICE '   - RLS 策略数量: %', policy_count;

    IF table_count < 4 THEN
        RAISE WARNING '⚠️ 部分表可能未创建成功';
    END IF;

    IF policy_count < 5 THEN
        RAISE WARNING '⚠️ 部分 RLS 策略可能未创建成功';
    END IF;
END $$;

-- 8. 显示当前状态
SELECT
    '✅ 数据库修复完成' as status,
    COUNT(*) FILTER (WHERE table_name = 'users') as users_table,
    COUNT(*) FILTER (WHERE table_name = 'lists') as lists_table,
    COUNT(*) FILTER (WHERE table_name = 'tasks') as tasks_table,
    COUNT(*) FILTER (WHERE table_name = 'notes') as notes_table
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'lists', 'tasks', 'notes');