# ShandianTask - 闪电任务

一个功能丰富的任务管理应用，灵感来源于 TickTick，使用 React + TypeScript + Vite 构建。

## 功能特性

- **任务管理** - 创建、编辑、删除任务，支持拖拽排序
- **日历视图** - 以日历形式查看和管理任务
- **笔记功能** - 随时记录灵感和想法
- **番茄钟** - 专注工作，提高效率
- **50天挑战** - 养成良好习惯
- **数据分析** - 可视化任务统计

## 技术栈

- React 19
- TypeScript
- Vite
- Lucide React (图标库)
- Google GenAI

## 快速开始

### 前置要求

- Node.js (推荐 18+)

### 安装

```bash
# 克隆仓库
git clone https://github.com/elicat001/shandiantask.git

# 进入项目目录
cd shandiantask

# 安装依赖
npm install
```

### 配置

在项目根目录创建 `.env.local` 文件，设置你的 Gemini API Key：

```
GEMINI_API_KEY=your_api_key_here
```

### 运行

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 项目结构

```
shandiantask/
├── components/          # React 组件
│   ├── tasks/          # 任务相关组件
│   ├── calendar/       # 日历组件
│   ├── notes/          # 笔记组件
│   ├── pomodoro/       # 番茄钟组件
│   ├── challenge/      # 50天挑战组件
│   ├── analytics/      # 数据分析组件
│   └── settings/       # 设置组件
├── services/           # 服务层
├── App.tsx             # 主应用组件
├── types.ts            # TypeScript 类型定义
└── index.tsx           # 入口文件
```

## 许可证

MIT License
