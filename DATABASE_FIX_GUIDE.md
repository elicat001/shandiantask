# 数据库修复指南

## 问题描述
数据库连接出现严重问题，需要重新创建表结构和设置权限。

## 快速修复步骤

### 步骤 1: 登录 Supabase 控制台
1. 访问你的 Supabase 项目：https://app.supabase.com
2. 选择你的项目
3. 点击左侧菜单的 "SQL Editor"

### 步骤 2: 执行数据库修复脚本
1. 在 SQL Editor 中，复制并粘贴以下文件的全部内容：
   ```
   supabase/migrations/006_complete_database_setup.sql
   ```

2. 点击 "Run" 执行脚本

3. 查看执行结果，确保显示：
   - ✅ 数据库设置完成！
   - 表数量: 4
   - RLS 策略数量: 7 或更多

### 步骤 3: 验证修复结果
1. 刷新浏览器中的应用程序
2. 打开浏览器控制台（F12）
3. 查看诊断输出，应该显示：
   ```
   ✅ Supabase 连接正常
   ✅ 用户已认证
   ✅ 表 users 存在
   ✅ 表 lists 存在
   ✅ 表 tasks 存在
   ✅ 表 notes 存在
   ```

### 步骤 4: 如果还有问题
在浏览器控制台运行：
```javascript
// 运行完整诊断
dbDiag.runFullDiagnosis()

// 尝试自动修复
dbFix.runCompleteFix()
```

## 常见问题解决

### 问题 1: 表已存在错误
如果看到 "relation already exists" 错误，这是正常的，表示表已经创建过了。

### 问题 2: 权限错误
如果看到权限相关错误：
1. 确保你以项目所有者身份登录 Supabase
2. 检查 Authentication > Policies 确保 RLS 已启用

### 问题 3: 用户数据不同步
在 SQL Editor 运行：
```sql
-- 同步当前用户数据
INSERT INTO users (id, email, username, name)
SELECT
    id,
    email,
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)) as username,
    raw_user_meta_data->>'name' as name
FROM auth.users
WHERE email = '你的邮箱'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(users.username, EXCLUDED.username),
    name = COALESCE(users.name, EXCLUDED.name);
```

### 问题 4: 列表不存在
为当前用户创建默认列表：
```sql
INSERT INTO lists (name, is_default, order_index, user_id)
SELECT
    '收件箱',
    true,
    0,
    id
FROM auth.users
WHERE email = '你的邮箱';
```

## 数据库结构说明

### users 表
- 存储用户基本信息
- 与 auth.users 关联

### lists 表
- 存储任务列表
- 每个用户至少有一个默认列表（收件箱）

### tasks 表
- 存储任务信息
- 必须关联到一个列表

### notes 表
- 存储笔记信息
- 支持分类、置顶、归档

## 自动化工具

应用内置了两个诊断工具：

1. **dbDiag** - 数据库诊断工具
   - 检查连接状态
   - 验证表结构
   - 检测权限问题

2. **dbFix** - 数据库修复工具
   - 自动创建缺失的表
   - 设置正确的权限
   - 创建默认数据

这些工具会在开发模式下自动运行。

## 需要手动操作的部分

由于 Supabase 的安全限制，以下操作必须在 Supabase 控制台手动执行：

1. 创建新表
2. 修改 RLS 策略
3. 创建触发器和函数

## 联系支持

如果问题仍然存在，请提供以下信息：
1. 浏览器控制台的完整错误信息
2. dbDiag.runFullDiagnosis() 的输出
3. Supabase 项目 URL