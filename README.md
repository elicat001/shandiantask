# 📋 Shandian Task - 现代化任务管理系统

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg)
![Supabase](https://img.shields.io/badge/Supabase-Ready-3ecf8e.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)

一个功能强大、界面优雅的全栈任务管理应用，支持任务管理、笔记记录、日历规划、番茄钟等多种生产力工具。

[演示](#演示) • [功能特性](#功能特性) • [快速开始](#快速开始) • [技术栈](#技术栈) • [项目结构](#项目结构) • [部署](#部署)

</div>

---

## ✨ 功能特性

### 📝 核心功能

- **任务管理** - 创建、编辑、删除任务，支持优先级和截止日期
- **拖拽排序** - 直观的拖放界面，轻松调整任务顺序
- **任务列表** - 自定义列表分类，更好地组织任务
- **子任务** - 将复杂任务分解为可管理的步骤
- **标签系统** - 灵活的标签分类，快速筛选任务
- **全局搜索** - 快速查找任何任务或笔记

### 📚 生产力工具

- **笔记系统** - 支持 Markdown 的强大笔记功能
- **日历视图** - 可视化任务安排和事件规划
- **番茄钟** - 内置番茄工作法计时器
- **挑战模式** - 21天/100天习惯养成追踪
- **数据分析** - 任务完成统计和生产力分析
- **AI 助手** - 集成 Google Gemini AI，智能任务建议

### 🎨 用户体验

- **深色模式** - 保护眼睛的暗色主题
- **响应式设计** - 完美适配桌面和移动设备
- **实时同步** - 数据实时保存，多设备同步
- **键盘快捷键** - 提高操作效率
- **多语言支持** - 中文/英文界面

### 🔧 技术特性

- **类型安全** - 完整的 TypeScript 支持
- **性能优化** - 代码分割、懒加载、虚拟滚动
- **离线支持** - PWA 支持，离线可用
- **数据持久化** - 本地存储 + 云端备份
- **错误监控** - 智能日志系统和自动修复

## 🚀 快速开始

### 前置要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器
- Git

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/elicat001/shandiantask.git
cd shandiantask
```

2. **安装依赖**

```bash
# 安装前端依赖
npm install

# 如果需要使用本地后端（可选）
cd backend && npm install
```

3. **环境配置**

创建 `.env` 文件（可以复制 `.env.example`）：

```bash
cp .env.example .env
```

编辑 `.env` 文件，添加你的配置：

```env
# Supabase 配置（推荐）
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 或使用本地后端
VITE_API_URL=http://localhost:5000/api
```

4. **初始化数据库**

**方案一：使用 Supabase（推荐）**
- 登录 [Supabase Dashboard](https://supabase.com)
- 创建新项目或使用现有项目
- 在 SQL Editor 中运行 `supabase/init.sql`

**方案二：使用本地后端**
```bash
cd backend
npx prisma migrate dev
npm run dev
```

5. **启动应用**

```bash
npm run dev
```

访问 http://localhost:3000 查看应用

## 🛠 技术栈

### 前端

- **框架**: React 18.3 + TypeScript 5.6
- **状态管理**: Zustand
- **路由**: React Router v6
- **样式**: Tailwind CSS + Framer Motion
- **UI 组件**: Radix UI + Lucide Icons
- **构建工具**: Vite 5
- **AI 集成**: Google Gemini AI
- **代码质量**: ESLint + Prettier

### 后端（两种方案）

#### 方案一：Supabase BaaS（推荐）
- **数据库**: PostgreSQL
- **认证**: Supabase Auth
- **实时订阅**: Supabase Realtime
- **文件存储**: Supabase Storage

#### 方案二：Node.js 后端
- **框架**: Express.js + TypeScript
- **数据库**: SQLite/PostgreSQL
- **ORM**: Prisma
- **认证**: JWT + bcrypt
- **安全**: Helmet + CORS

## 📁 项目结构

```
shandiantask/
├── src/                    # 前端源代码
│   ├── components/        # React 组件
│   │   ├── common/       # 通用组件
│   │   ├── features/     # 功能组件
│   │   └── layout/       # 布局组件
│   ├── pages/            # 页面组件
│   ├── services/         # API 服务
│   │   ├── api.ts       # 本地后端 API
│   │   └── supabaseApi.ts # Supabase API
│   ├── store/            # Zustand 状态管理
│   ├── lib/              # 工具库
│   ├── hooks/            # 自定义 Hooks
│   ├── types/            # TypeScript 类型
│   └── styles/           # 全局样式
│
├── backend/               # Node.js 后端（可选）
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── routes/       # 路由
│   │   ├── middleware/   # 中间件
│   │   ├── utils/        # 工具函数
│   │   └── config/       # 配置文件
│   └── prisma/           # 数据库模型
│
├── supabase/             # Supabase 配置
│   └── init.sql         # 数据库初始化脚本
│
├── public/               # 静态资源
├── docs/                 # 文档
└── tests/               # 测试文件
```

## 🔧 配置说明

### Supabase 配置

1. 在 [Supabase](https://supabase.com) 创建项目
2. 获取项目 URL 和 Anon Key
3. 配置环境变量
4. 运行数据库初始化脚本

### 本地开发

```bash
# 前端开发服务器
npm run dev

# 后端服务器（如果使用本地后端）
cd backend && npm run dev

# 运行测试
npm test

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 📊 数据模型

### 核心数据表

- **users** - 用户信息和认证
- **tasks** - 任务数据
- **lists** - 任务列表分类
- **subtasks** - 子任务
- **tags** - 标签系统
- **notes** - 笔记内容
- **calendar_events** - 日历事件
- **pomodoro_sessions** - 番茄钟记录
- **challenges** - 习惯挑战记录

详细数据模型请查看：
- Supabase: `supabase/init.sql`
- 本地后端: `backend/prisma/schema.prisma`

## 🚢 部署

### Vercel 部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/elicat001/shandiantask)

1. 点击上方按钮
2. 配置环境变量
3. 部署

### Netlify 部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/elicat001/shandiantask)

### Docker 部署

```bash
# 构建镜像
docker build -t shandiantask .

# 运行容器
docker run -p 3000:3000 -e VITE_SUPABASE_URL=xxx -e VITE_SUPABASE_ANON_KEY=xxx shandiantask
```

### 手动部署

```bash
# 构建
npm run build

# 部署 dist 目录到任何静态托管服务
# 如: GitHub Pages, Cloudflare Pages, AWS S3 等
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 开发规范

- 遵循 ESLint 配置
- 使用 Prettier 格式化代码
- 编写清晰的提交信息
- 为新功能添加测试
- 更新相关文档

## 📸 截图

<div align="center">
  <img src="docs/images/dashboard.png" width="45%" alt="Dashboard" />
  <img src="docs/images/calendar.png" width="45%" alt="Calendar View" />
  <img src="docs/images/notes.png" width="45%" alt="Notes" />
  <img src="docs/images/pomodoro.png" width="45%" alt="Pomodoro Timer" />
</div>

## 🔗 相关链接

- [在线演示](https://shandiantask.vercel.app)
- [API 文档](docs/API.md)
- [贡献指南](docs/CONTRIBUTING.md)
- [更新日志](CHANGELOG.md)

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [React](https://react.dev) - UI 框架
- [Supabase](https://supabase.com) - 后端服务
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [Prisma](https://www.prisma.io) - 数据库 ORM
- [Vite](https://vitejs.dev) - 构建工具
- [Google Gemini](https://ai.google.dev) - AI 服务

## 📧 联系方式

- 作者：Shandian Team
- Email：support@shandiantask.com
- GitHub：[@elicat001](https://github.com/elicat001)
- Issues：[GitHub Issues](https://github.com/elicat001/shandiantask/issues)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=elicat001/shandiantask&type=Date)](https://star-history.com/#elicat001/shandiantask&Date)

---

<div align="center">
Made with ❤️ by the Shandian Task Team

[⬆ 回到顶部](#-shandian-task---现代化任务管理系统)
</div>