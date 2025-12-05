import { Request, Response } from 'express';
import { prisma } from '../config/database';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  setAuthCookie,
  clearAuthCookie
} from '../utils/auth';
import { asyncHandler } from '../middleware/error.middleware';
import { AppError } from '../middleware/error.middleware';

// 注册
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password, name } = req.body;

  // 验证输入
  if (!email || !username || !password) {
    throw new AppError('请提供完整信息', 400);
  }

  if (password.length < 6) {
    throw new AppError('密码至少需要6个字符', 400);
  }

  // 检查用户是否已存在
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ]
    }
  });

  if (existingUser) {
    throw new AppError(
      existingUser.email === email ? '邮箱已被使用' : '用户名已被使用',
      400
    );
  }

  // 创建用户
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      name,
      // 创建默认列表
      lists: {
        create: [
          { name: '收件箱', isDefault: true, order: 0 },
          { name: '工作', order: 1 },
          { name: '个人', order: 2 }
        ]
      }
    },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      avatar: true,
      createdAt: true
    }
  });

  // 生成token
  const token = generateToken(user.id);
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: '注册成功',
    data: {
      user,
      token
    }
  });
});

// 登录
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { emailOrUsername, password } = req.body;

  // 验证输入
  if (!emailOrUsername || !password) {
    throw new AppError('请提供登录凭证', 400);
  }

  // 查找用户
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    }
  });

  if (!user) {
    throw new AppError('用户名或密码错误', 401);
  }

  // 验证密码
  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('用户名或密码错误', 401);
  }

  // 更新最后登录时间
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  // 生成token
  const token = generateToken(user.id);
  setAuthCookie(res, token);

  // 返回用户信息（不包含密码）
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: '登录成功',
    data: {
      user: userWithoutPassword,
      token
    }
  });
});

// 登出
export const logout = asyncHandler(async (req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({
    success: true,
    message: '登出成功'
  });
});

// 获取当前用户信息
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      avatar: true,
      emailVerified: true,
      createdAt: true,
      lastLogin: true,
      _count: {
        select: {
          tasks: true,
          notes: true,
          events: true
        }
      }
    }
  });

  if (!user) {
    throw new AppError('用户不存在', 404);
  }

  res.json({
    success: true,
    data: user
  });
});

// 更新用户信息
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, avatar } = req.body;
  const userId = req.user!.id;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name !== undefined && { name }),
      ...(avatar !== undefined && { avatar })
    },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      avatar: true
    }
  });

  res.json({
    success: true,
    message: '个人信息更新成功',
    data: updatedUser
  });
});

// 修改密码
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  // 验证输入
  if (!currentPassword || !newPassword) {
    throw new AppError('请提供当前密码和新密码', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('新密码至少需要6个字符', 400);
  }

  // 获取用户
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError('用户不存在', 404);
  }

  // 验证当前密码
  const isPasswordValid = await verifyPassword(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new AppError('当前密码错误', 401);
  }

  // 更新密码
  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  res.json({
    success: true,
    message: '密码修改成功'
  });
});