import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
// 以后可以添加更多路由
// import noteRoutes from './note.routes';
// import eventRoutes from './event.routes';
// import pomodoroRoutes from './pomodoro.routes';

const router = Router();

// API健康检查
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API运行正常',
    timestamp: new Date().toISOString()
  });
});

// 路由模块
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
// router.use('/notes', noteRoutes);
// router.use('/events', eventRoutes);
// router.use('/pomodoros', pomodoroRoutes);

export default router;