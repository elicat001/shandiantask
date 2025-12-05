import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config();

// 导入路由和中间件
import routes from './routes';
import { errorHandler, notFound } from './middleware/error.middleware';

// 创建Express应用
const app: Application = express();

// 信任代理（用于部署）
app.set('trust proxy', 1);

// 中间件
app.use(helmet()); // 安全头部
app.use(compression()); // 压缩响应
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined')); // 日志

// CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // 允许携带cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Auth-Token']
}));

// 解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 静态文件服务（如果有上传的文件）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API路由
app.use('/api', routes);

// 根路由
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Shandian Task API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      tasks: '/api/tasks',
      docs: '/api-docs (即将推出)'
    }
  });
});

// 404处理
app.use(notFound);

// 错误处理（必须放在最后）
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 服务器启动成功！
📡 API地址: http://localhost:${PORT}
🌍 前端地址: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
🔧 环境: ${process.env.NODE_ENV || 'development'}
📊 数据库: SQLite (${process.env.DATABASE_URL})

可用的API端点：
- GET    /api/health          健康检查
- POST   /api/auth/register   注册
- POST   /api/auth/login      登录
- GET    /api/auth/me         获取当前用户
- GET    /api/tasks           获取任务列表
- POST   /api/tasks           创建任务
- PATCH  /api/tasks/:id       更新任务
- DELETE /api/tasks/:id       删除任务

按 Ctrl+C 停止服务器
  `);
});

// 保持进程活跃
setInterval(() => {
  // Keep-alive
}, 1000);

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，准备关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n收到SIGINT信号，准备关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

// 未捕获的错误处理
process.on('unhandledRejection', (err: any, _promise) => {
  console.error('未处理的Promise拒绝:', err);
  // 在生产环境中，你可能想要发送错误到日志服务
  // server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  // 在生产环境中，你可能想要发送错误到日志服务
  // server.close(() => process.exit(1));
});

export default app;