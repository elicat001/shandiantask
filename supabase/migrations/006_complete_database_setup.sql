-- ============================================
-- 完整数据库设置脚本
-- 这个脚本会创建所有必要的表和策略
-- ============================================

-- 1. 创建 users 表（如果不存在）
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建 lists 表（如果不存在）
CREATE TABLE IF NOT EXISTS lists (
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

-- 3. 创建 tasks 表（如果不存在）
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    priority VARCHAR(20) DEFAULT 'none' CHECK (priority IN ('none', 'low', 'medium', 'high')),
    order_index INTEGER DEFAULT 0,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    list_id UUID REFERENCES lists(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 创建 notes 表（如果不存在）
CREATE TABLE IF NOT EXISTS notes (
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

-- 5. 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 6. 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can CRUD own lists" ON lists;
DROP POLICY IF EXISTS "Users can CRUD own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can CRUD own notes" ON notes;

-- 7. 创建 RLS 策略

-- Users 策略
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Lists 策略
CREATE POLICY "Users can CRUD own lists" ON lists
    FOR ALL USING (auth.uid() = user_id);

-- Tasks 策略
CREATE POLICY "Users can CRUD own tasks" ON tasks
    FOR ALL USING (auth.uid() = user_id);

-- Notes 策略
CREATE POLICY "Users can CRUD own notes" ON notes
    FOR ALL USING (auth.uid() = user_id);

-- 8. 创建索引（提高性能）
CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_order_index ON lists(order_index);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON tasks(list_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_order_index ON tasks(order_index);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned);
CREATE INDEX IF NOT EXISTS idx_notes_archived ON notes(archived);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);

-- 9. 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. 为每个表创建更新时间触发器
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

-- 11. 为每个用户创建默认列表（如果不存在）
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

-- 12. 同步用户数据到 users 表
INSERT INTO users (id, email, username, name)
SELECT
    id,
    email,
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)) as username,
    raw_user_meta_data->>'name' as name
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.users.id
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(users.username, EXCLUDED.username),
    name = COALESCE(users.name, EXCLUDED.name);

-- 13. 验证设置
DO $$
DECLARE
    table_count INTEGER;
    policy_count INTEGER;
    user_count INTEGER;
    list_count INTEGER;
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

    -- 统计用户数量
    SELECT COUNT(*) INTO user_count FROM users;

    -- 统计列表数量
    SELECT COUNT(*) INTO list_count FROM lists;

    RAISE NOTICE '✅ 数据库设置完成！';
    RAISE NOTICE '   - 表数量: %', table_count;
    RAISE NOTICE '   - RLS 策略数量: %', policy_count;
    RAISE NOTICE '   - 用户数量: %', user_count;
    RAISE NOTICE '   - 列表数量: %', list_count;

    IF table_count < 4 THEN
        RAISE WARNING '⚠️ 部分表可能未创建成功';
    END IF;

    IF policy_count < 7 THEN
        RAISE WARNING '⚠️ 部分 RLS 策略可能未创建成功';
    END IF;
END $$;

-- 14. 显示最终状态
SELECT
    '数据库状态' as "状态",
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') as "users表",
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lists') as "lists表",
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks') as "tasks表",
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notes') as "notes表",
    (SELECT COUNT(*) FROM users) as "用户数",
    (SELECT COUNT(*) FROM lists) as "列表数";