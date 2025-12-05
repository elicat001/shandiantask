import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { prisma } from '../config/database';

// 扩展Request类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
      };
    }
  }
}

// 认证中间件
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // 从cookie或header获取token
    const token = req.cookies?.auth_token ||
                  req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: '未授权：请先登录' });
    }

    // 验证token
    const decoded = verifyToken(token);

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
      }
    });

    if (!user) {
      return res.status(401).json({ error: '未授权：用户不存在' });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: '未授权：token无效或已过期' });
  }
};

// 可选的认证中间件（不强制要求登录）
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.auth_token ||
                  req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
        }
      });

      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // 忽略错误，继续执行
    next();
  }
};