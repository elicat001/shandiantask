# 📊 数据库迁移指南

## 🎯 目标
将所有本地存储（localStorage 和组件 state）迁移到 Supabase 数据库，实现数据的云端持久化和多设备同步。

## 📋 新增数据库表

### 1. 番茄钟模块
- **pomodoro_settings** - 用户番茄钟设置
- **pomodoro_sessions** - 番茄钟历史记录

### 2. 日历模块
- **calendar_events** - 日历事件

### 3. 挑战模块
- **challenges** - 挑战主表
- **challenge_habits** - 习惯配置
- **challenge_daily_progress** - 每日进度
- **challenge_habit_records** - 习惯完成记录

### 4. 用户设置
- **user_preferences** - 用户偏好设置
- **user_statistics** - 用户统计数据

## 🚀 部署步骤

### Step 1: 在 Supabase 执行 SQL
1. 登录你的 [Supabase 控制台](https://app.supabase.com)
2. 进入 SQL Editor
3. 复制 `supabase/migrations/002_complete_tables.sql` 的内容
4. 执行 SQL 脚本

### Step 2: 验证表创建
在 Supabase 控制台检查以下表是否创建成功：
- [ ] pomodoro_settings
- [ ] pomodoro_sessions
- [ ] calendar_events
- [ ] challenges
- [ ] challenge_habits
- [ ] challenge_daily_progress
- [ ] challenge_habit_records
- [ ] user_preferences
- [ ] user_statistics

### Step 3: 检查 RLS 策略
确保所有表的 RLS (Row Level Security) 已启用，用户只能访问自己的数据。

## 📦 数据结构说明

### 番茄钟设置 (pomodoro_settings)
```typescript
{
  user_id: UUID,          // 用户ID
  focus_duration: number, // 专注时长(分钟)
  short_break_duration: number, // 短休息时长
  long_break_duration: number,  // 长休息时长
  auto_start_break: boolean,    // 自动开始休息
  notification_enabled: boolean // 启用通知
}
```

### 日历事件 (calendar_events)
```typescript
{
  user_id: UUID,        // 用户ID
  title: string,        // 事件标题
  description: string,  // 描述
  event_type: string,   // 事件类型
  start_date: Date,     // 开始时间
  end_date: Date,       // 结束时间
  all_day: boolean,     // 是否全天
  color: string        // 颜色代码
}
```

### 挑战数据 (challenges)
```typescript
{
  user_id: UUID,              // 用户ID
  name: string,               // 挑战名称
  total_days: number,         // 总天数
  current_day: number,        // 当前天数
  start_date: Date,          // 开始日期
  is_active: boolean,        // 是否活跃
  streak_days: number,       // 连续天数
  best_streak: number        // 最佳连续
}
```

## 🔄 数据迁移策略

### 现有数据处理
1. **localStorage 数据**:
   - 挑战数据：从 `challenge_data` 键迁移到 challenges 表
   - 习惯数据：从 `challenge_habits` 键迁移到 challenge_habits 表

2. **组件 state 数据**:
   - 番茄钟：用户设置保存到 pomodoro_settings
   - 日历：事件保存到 calendar_events

### 迁移优先级
1. 🔴 **高优先级**: 挑战模块（用户数据最重要）
2. 🟡 **中优先级**: 日历模块（事件需要持久化）
3. 🟢 **低优先级**: 番茄钟模块（设置相对简单）

## 🛠 技术实现

### API 服务层更新
需要在 `src/services/supabaseApi.ts` 添加新的 API 方法：

```typescript
// 番茄钟 API
pomodoro: {
  getSettings: async (userId: string) => {...},
  updateSettings: async (userId: string, settings: any) => {...},
  saveSess: async (session: any) => {...}
},

// 日历 API
calendar: {
  getEvents: async (userId: string) => {...},
  createEvent: async (event: any) => {...},
  updateEvent: async (id: string, event: any) => {...},
  deleteEvent: async (id: string) => {...}
},

// 挑战 API
challenges: {
  getActive: async (userId: string) => {...},
  create: async (challenge: any) => {...},
  updateProgress: async (id: string, progress: any) => {...}
}
```

### Store 更新
扩展 `useSupabaseStore` 添加新模块的状态管理：

```typescript
interface SupabaseStore {
  // 番茄钟
  pomodoroSettings: PomodoroSettings | null;
  pomodoroSessions: PomodoroSession[];

  // 日历
  calendarEvents: CalendarEvent[];

  // 挑战
  activeChallenge: Challenge | null;
  challengeProgress: DailyProgress[];

  // Actions
  fetchPomodoroSettings: () => Promise<void>;
  fetchCalendarEvents: () => Promise<void>;
  fetchActiveChallenge: () => Promise<void>;
  // ...更多 actions
}
```

## 📝 测试清单

### 功能测试
- [ ] 用户注册时自动创建默认设置
- [ ] 番茄钟设置保存和读取
- [ ] 日历事件增删改查
- [ ] 挑战创建和进度更新
- [ ] 数据跨设备同步

### 性能测试
- [ ] 查询响应时间 < 500ms
- [ ] 批量数据处理正常
- [ ] 实时订阅工作正常

## ⚠️ 注意事项

1. **数据安全**: 所有表都启用了 RLS，确保用户数据隔离
2. **向后兼容**: 保留 localStorage 数据作为备份，逐步迁移
3. **错误处理**: 添加离线支持，网络故障时使用本地缓存
4. **性能优化**: 使用索引加速查询，避免 N+1 问题

## 📅 实施计划

### Phase 1 (当前)
- ✅ 创建数据库表结构
- ✅ 配置 RLS 策略
- ✅ 创建索引和触发器

### Phase 2 (下一步)
- [ ] 更新 API 服务层
- [ ] 扩展 Store 功能
- [ ] 迁移挑战模块

### Phase 3
- [ ] 迁移日历模块
- [ ] 迁移番茄钟模块
- [ ] 完整测试

### Phase 4
- [ ] 数据迁移工具
- [ ] 用户引导
- [ ] 正式发布

## 🎉 完成标志

当以下条件满足时，迁移完成：
1. 所有组件都使用 Supabase 存储
2. localStorage 仅用于缓存
3. 数据能够跨设备同步
4. 用户体验无缝切换

---

📌 **提示**: 执行 SQL 脚本前，建议先在测试环境验证！