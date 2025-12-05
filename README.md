# 📋 Shandian Task - 现代化任务管理系统

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)
![Supabase](https://img.shields.io/badge/Supabase-Ready-3ecf8e.svg)
![Vite](https://img.shields.io/badge/Vite-6.4-646cff.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Deploy](https://img.shields.io/badge/deploy-Vercel-000000.svg)

一个功能强大、界面优雅的全栈任务管理应用，集成了用户认证、任务管理、笔记记录、日历规划等多种生产力工具。

[在线演示](https://shandiantask.vercel.app) • [功能特性](#-功能特性) • [快速开始](#-快速开始) • [技术栈](#-技术栈) • [项目结构](#-项目结构) • [部署](#-部署)

</div>

---

## ✨ 功能特性

### 🔐 用户认证系统 (已完成 ✅)

- **用户注册/登录** - 邮箱、用户名、密码认证
- **会话管理** - 自动保持登录状态
- **路由保护** - 未登录用户自动重定向
- **用户信息展示** - 个人资料和头像显示
- **安全登出** - 清除本地会话和缓存

### 📝 核心功能 (已完成 ✅)

- **任务管理** - 创建、编辑、删除任务，支持优先级和截止日期
- **任务列表** - 收件箱、工作、个人等自定义分类
- **实时搜索** - 快速查找任务
- **任务状态** - 完成/未完成状态切换
- **任务计数** - 显示各列表任务数量
- **拖拽排序** - 直观的任务顺序调整 (开发中)

### 💾 数据存储 (已完成 ✅)

- **Supabase集成** - 云端数据库存储
- **Zustand状态管理** - 本地状态管理
- **数据持久化** - localStorage + 云端同步
- **实时同步** - 多设备数据同步
- **自动备份** - 防止数据丢失

### 🎨 用户界面 (已完成 ✅)

- **响应式设计** - 完美适配桌面和移动设备
- **侧边栏导航** - 可折叠的导航菜单
- **优雅动画** - 流畅的界面过渡效果
- **Tailwind CSS** - 现代化的样式系统
- **图标系统** - Lucide React图标库

### 🚀 开发特性 (已完成 ✅)

- **TypeScript** - 完整的类型安全
- **Vite构建** - 极速的开发体验
- **热更新** - 实时预览代码修改
- **Git集成** - 自动推送脚本
- **环境配置** - 开发/生产环境分离

### 📚 即将推出的功能

- **笔记系统** - Markdown编辑器
- **日历视图** - 任务时间轴
- **番茄钟** - 专注时间管理
- **数据统计** - 任务完成分析
- **AI助手** - 智能任务建议
- **深色模式** - 护眼主题切换
- **多语言** - 国际化支持

## 🚀 快速开始

### 前置要求

- Node.js 18.0 或更高版本
- npm 9.0 或更高版本
- Git
- Supabase 账号 (免费)

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/elicat001/shandiantask.git
cd shandiantask
```

2. **安装依赖**

```bash
npm install
```

3. **环境配置**

创建 `.env` 文件（可以复制 `.env.example`）：

```bash
cp .env.example .env
```

编辑 `.env` 文件，添加你的 Supabase 配置：

```env
# Supabase 配置（必需）
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **初始化 Supabase 数据库**

- 登录 [Supabase Dashboard](https://supabase.com)
- 创建新项目（免费）
- 在 SQL Editor 中运行 `supabase/init.sql`
- 复制项目的 URL 和 Anon Key 到 `.env` 文件

5. **启动应用**

```bash
npm run dev
```

访问 http://localhost:5173 查看应用

## 🛠 技术栈

### 前端技术栈

- **框架**: React 19.2 + TypeScript 5.8
- **状态管理**: Zustand 5.0
- **路由**: React Router DOM 7.10
- **样式**: Tailwind CSS 3.4
- **UI 图标**: Lucide React
- **构建工具**: Vite 6.4
- **包管理**: npm 9+

### 后端技术栈

- **BaaS平台**: Supabase
- **数据库**: PostgreSQL (Supabase)
- **认证**: Supabase Auth
- **实时同步**: Supabase Realtime
- **文件存储**: Supabase Storage
- **API**: RESTful API
- **安全**: Row Level Security (RLS)

## 📁 项目结构

```
shandiantask/
├── src/                   # 源代码目录
│   ├── components/       # React 组件
│   │   └── PrivateRoute.tsx    # 路由保护组件
│   ├── contexts/         # React Context
│   │   └── AuthContext.tsx     # 认证上下文
│   ├── pages/           # 页面组件
│   │   ├── AuthPage.tsx       # 登录/注册页
│   │   └── HomePage.tsx       # 主页
│   ├── services/        # API 服务
│   │   └── supabaseApi.ts    # Supabase API 封装
│   ├── store/           # 状态管理
│   │   └── useStore.ts       # Zustand store
│   ├── lib/             # 工具库
│   │   └── supabase.ts       # Supabase 客户端
│   ├── styles/          # 样式文件
│   │   └── index.css         # 全局样式
│   ├── App.tsx          # 应用主组件
│   └── main.tsx         # 应用入口
│
├── backend/              # 后端代码（可选）
│   ├── src/             # 源代码
│   └── prisma/          # 数据库模型
│
├── supabase/            # Supabase 配置
│   └── init.sql        # 数据库初始化脚本
│
├── public/              # 静态资源
├── .env.example         # 环境变量示例
├── package.json         # 项目配置
├── vite.config.ts       # Vite 配置
├── tailwind.config.js   # Tailwind 配置
└── tsconfig.json        # TypeScript 配置
```

## 🔧 配置说明

### Supabase 配置

1. 在 [Supabase](https://supabase.com) 创建项目
2. 获取项目 URL 和 Anon Key
3. 配置环境变量
4. 运行数据库初始化脚本

### 可用脚本

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 自动推送到 GitHub（交互式）
npm run push

# 快速推送到 GitHub
npm run quick-push
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

详细数据模型请查看：`supabase/init.sql`

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

## 📸 应用截图

### 登录/注册页面
- 优雅的渐变背景设计
- 表单验证和错误提示
- 支持邮箱、用户名注册

### 主页面
- 侧边栏任务列表导航
- 实时搜索功能
- 任务创建、编辑、删除
- 任务完成状态切换

## 🔗 相关链接

- [在线演示](https://shandiantask.vercel.app)
- [GitHub 仓库](https://github.com/elicat001/shandiantask)
- [Supabase Dashboard](https://supabase.com)
- [问题反馈](https://github.com/elicat001/shandiantask/issues)

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [React](https://react.dev) - UI 框架
- [Supabase](https://supabase.com) - 后端服务平台
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [Vite](https://vitejs.dev) - 构建工具
- [Vercel](https://vercel.com) - 部署平台
- [Lucide](https://lucide.dev) - 图标库

## 📧 联系方式

- GitHub：[@elicat001](https://github.com/elicat001)
- Issues：[GitHub Issues](https://github.com/elicat001/shandiantask/issues)

## 🌟 支持项目

如果这个项目对你有帮助，请给一个 ⭐️ Star 支持！

---

<div align="center">

**Made with ❤️ by Shandian Team**

基于 React + TypeScript + Supabase 构建

[⬆ 回到顶部](#-shandian-task---现代化任务管理系统)

</div>