# 🚀 Supabase 集成指南

恭喜！我已经为你配置好了 Supabase 集成。Supabase 是一个强大的后端即服务平台，提供了数据库、认证、实时订阅等功能。

## 📊 Supabase 优势

相比传统后端，Supabase 提供：

1. **托管数据库** - PostgreSQL 云数据库，无需自己维护
2. **内置认证** - 完整的用户认证系统，支持社交登录
3. **实时功能** - 数据变化实时同步到所有客户端
4. **自动备份** - 数据安全有保障
5. **免费套餐** - 对于个人项目完全够用

## 🔧 已完成的配置

### 1. 前端集成文件

- **环境配置** (`.env`) - Supabase URL 和密钥
- **客户端配置** (`src/lib/supabase.ts`) - Supabase 客户端初始化
- **API 服务** (`src/services/supabaseApi.ts`) - 封装好的所有数据操作方法
- **数据库脚本** (`supabase/init.sql`) - 完整的数据库表结构

### 2. 功能模块

已实现的功能：

- ✅ 用户认证（注册、登录、登出）
- ✅ 任务管理（增删改查、拖拽排序）
- ✅ 列表管理（创建、编辑、删除）
- ✅ 笔记功能（创建、编辑、归档）
- ✅ 实时订阅（数据自动同步）
- ✅ Row Level Security（数据安全）

## 📋 使用步骤

### 步骤 1：初始化数据库

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard/project/bxunfpcdwldpwjbmqtoe)
2. 点击左侧的 **SQL Editor**
3. 复制 `supabase/init.sql` 文件的全部内容
4. 粘贴到 SQL Editor 中
5. 点击 **Run** 执行脚本

### 步骤 2：在应用中使用

#### 认证示例

```javascript
import { supabaseApi } from '@/services/supabaseApi';

// 注册新用户
const { success, data, error } = await supabaseApi.auth.signUp(
  'user@example.com',
  'password123',
  'username',
  '用户名称'
);

// 登录
const result = await supabaseApi.auth.signIn(
  'user@example.com',
  'password123'
);

// 获取当前用户
const user = await supabaseApi.auth.getCurrentUser();

// 登出
await supabaseApi.auth.signOut();
```

#### 任务操作示例

```javascript
// 获取所有任务
const tasks = await supabaseApi.tasks.getAll();

// 创建新任务
const newTask = await supabaseApi.tasks.create({
  title: '完成项目文档',
  description: '编写项目的使用说明',
  priority: 'high'
});

// 更新任务
await supabaseApi.tasks.update(taskId, {
  completed: true
});

// 删除任务
await supabaseApi.tasks.delete(taskId);
```

#### 实时订阅示例

```javascript
// 订阅任务变化
const subscription = supabaseApi.realtime.subscribeToTasks((payload) => {
  console.log('任务变化:', payload);
  // 更新本地状态
});

// 取消订阅
supabaseApi.realtime.unsubscribe(subscription);
```

### 步骤 3：在 Zustand Store 中集成

修改 `src/store/useStore.ts`，使用 Supabase API：

```javascript
import { supabaseApi } from '@/services/supabaseApi';

const useStore = create((set, get) => ({
  // 登录
  login: async (email: string, password: string) => {
    const result = await supabaseApi.auth.signIn(email, password);
    if (result.success) {
      set({ user: result.data.user });
    }
    return result;
  },

  // 获取任务
  fetchTasks: async () => {
    const result = await supabaseApi.tasks.getAll();
    if (result.success) {
      set({ tasks: result.data });
    }
  },

  // 添加任务
  addTask: async (task: TaskInput) => {
    const result = await supabaseApi.tasks.create(task);
    if (result.success) {
      get().fetchTasks(); // 刷新列表
    }
  },
}));
```

## 🌟 高级功能

### 1. 社交登录

Supabase 支持多种社交登录：

```javascript
// Google 登录
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
});

// GitHub 登录
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
});
```

### 2. 文件存储

上传用户头像或附件：

```javascript
// 上传文件
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file);

// 获取文件URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.png`);
```

### 3. 实时协作

多用户实时协作：

```javascript
// 订阅特定列表的任务变化
const subscription = supabase
  .channel('list-tasks')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'tasks',
      filter: `list_id=eq.${listId}`
    },
    (payload) => {
      // 实时更新UI
    }
  )
  .subscribe();
```

## 🔒 安全说明

1. **Row Level Security (RLS)** - 已配置，用户只能访问自己的数据
2. **认证保护** - 所有 API 调用都需要认证
3. **环境变量** - 敏感信息都在环境变量中
4. **HTTPS** - Supabase 自动使用 HTTPS

## 🐛 常见问题

### 问题 1：登录后页面没有更新

**解决方案**：检查认证状态监听

```javascript
// 监听认证状态变化
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // 刷新页面或更新状态
  }
});
```

### 问题 2：数据没有实时更新

**解决方案**：确保启用了实时订阅

1. 在 Supabase Dashboard 中检查 Replication 设置
2. 确保表已添加到 publication

### 问题 3：上传文件失败

**解决方案**：检查 Storage 配置

1. 在 Dashboard 创建 storage bucket
2. 设置正确的权限策略

## 📚 资源链接

- [Supabase 文档](https://supabase.com/docs)
- [你的项目 Dashboard](https://supabase.com/dashboard/project/bxunfpcdwldpwjbmqtoe)
- [SQL Editor](https://supabase.com/dashboard/project/bxunfpcdwldpwjbmqtoe/sql)
- [Table Editor](https://supabase.com/dashboard/project/bxunfpcdwldpwjbmqtoe/editor)
- [Authentication](https://supabase.com/dashboard/project/bxunfpcdwldpwjbmqtoe/auth/users)

## ✨ 下一步建议

1. **运行 SQL 脚本** - 在 SQL Editor 中执行 `init.sql`
2. **测试认证** - 创建测试用户并登录
3. **集成到 Store** - 修改 Zustand store 使用 Supabase API
4. **添加社交登录** - 配置 Google/GitHub 登录
5. **启用邮件验证** - 在 Auth 设置中配置

## 🎉 总结

你现在拥有了：

- ✅ 完整的 Supabase 集成
- ✅ 云端 PostgreSQL 数据库
- ✅ 用户认证系统
- ✅ 实时数据同步
- ✅ 安全的数据访问控制

**重要**：记得先在 Supabase SQL Editor 中运行 `init.sql` 脚本来创建所有必要的表！

有任何问题随时告诉我，我会帮你解决！