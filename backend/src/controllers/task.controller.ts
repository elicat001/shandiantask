import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/error.middleware';
import { AppError } from '../middleware/error.middleware';

// 获取所有任务
export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { listId, completed, search, priority, dueDate } = req.query;

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      ...(listId && { listId: listId as string }),
      ...(completed !== undefined && { completed: completed === 'true' }),
      ...(priority && { priority: priority as string }),
      ...(dueDate && {
        dueDate: {
          lte: new Date(dueDate as string)
        }
      }),
      ...(search && {
        OR: [
          { title: { contains: search as string } },
          { description: { contains: search as string } }
        ]
      })
    },
    include: {
      list: {
        select: {
          id: true,
          name: true,
          color: true
        }
      },
      tags: true,
      subtasks: {
        orderBy: { order: 'asc' }
      }
    },
    orderBy: [
      { order: 'asc' },
      { createdAt: 'desc' }
    ]
  });

  res.json({
    success: true,
    data: tasks
  });
});

// 获取单个任务
export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const task = await prisma.task.findFirst({
    where: {
      id,
      userId
    },
    include: {
      list: true,
      tags: true,
      subtasks: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!task) {
    throw new AppError('任务不存在', 404);
  }

  res.json({
    success: true,
    data: task
  });
});

// 创建任务
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    title,
    description,
    listId,
    dueDate,
    priority = 'none',
    tags,
    subtasks
  } = req.body;

  if (!title) {
    throw new AppError('任务标题不能为空', 400);
  }

  // 获取或创建默认列表
  let finalListId = listId;
  if (!finalListId) {
    const defaultList = await prisma.list.findFirst({
      where: {
        userId,
        isDefault: true
      }
    });

    if (!defaultList) {
      const newList = await prisma.list.create({
        data: {
          name: '收件箱',
          isDefault: true,
          userId
        }
      });
      finalListId = newList.id;
    } else {
      finalListId = defaultList.id;
    }
  }

  // 获取最大order值
  const maxOrder = await prisma.task.aggregate({
    where: { userId, listId: finalListId },
    _max: { order: true }
  });

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority,
      order: (maxOrder._max.order || 0) + 1,
      userId,
      listId: finalListId,
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(tags && {
        tags: {
          connectOrCreate: tags.map((tagName: string) => ({
            where: { name: tagName },
            create: { name: tagName }
          }))
        }
      }),
      ...(subtasks && {
        subtasks: {
          create: subtasks.map((subtask: any, index: number) => ({
            title: subtask.title,
            order: index
          }))
        }
      })
    },
    include: {
      list: true,
      tags: true,
      subtasks: true
    }
  });

  res.status(201).json({
    success: true,
    message: '任务创建成功',
    data: task
  });
});

// 更新任务
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const updates = req.body;

  // 验证任务存在且属于当前用户
  const existingTask = await prisma.task.findFirst({
    where: { id, userId }
  });

  if (!existingTask) {
    throw new AppError('任务不存在', 404);
  }

  // 处理完成状态
  if (updates.completed !== undefined && updates.completed !== existingTask.completed) {
    updates.completedAt = updates.completed ? new Date() : null;
  }

  // 更新任务
  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.completed !== undefined && {
        completed: updates.completed,
        completedAt: updates.completedAt
      }),
      ...(updates.priority !== undefined && { priority: updates.priority }),
      ...(updates.order !== undefined && { order: updates.order }),
      ...(updates.listId !== undefined && { listId: updates.listId }),
      ...(updates.dueDate !== undefined && {
        dueDate: updates.dueDate ? new Date(updates.dueDate) : null
      }),
      ...(updates.tags && {
        tags: {
          set: [],
          connectOrCreate: updates.tags.map((tagName: string) => ({
            where: { name: tagName },
            create: { name: tagName }
          }))
        }
      })
    },
    include: {
      list: true,
      tags: true,
      subtasks: true
    }
  });

  res.json({
    success: true,
    message: '任务更新成功',
    data: task
  });
});

// 删除任务
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  // 验证任务存在且属于当前用户
  const task = await prisma.task.findFirst({
    where: { id, userId }
  });

  if (!task) {
    throw new AppError('任务不存在', 404);
  }

  await prisma.task.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: '任务删除成功'
  });
});

// 批量更新任务顺序
export const reorderTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { tasks } = req.body; // [{ id, order }]

  if (!Array.isArray(tasks)) {
    throw new AppError('请提供任务列表', 400);
  }

  // 批量更新
  await Promise.all(
    tasks.map(({ id, order }: { id: string; order: number }) =>
      prisma.task.updateMany({
        where: { id, userId },
        data: { order }
      })
    )
  );

  res.json({
    success: true,
    message: '任务顺序更新成功'
  });
});

// 切换任务完成状态
export const toggleTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const task = await prisma.task.findFirst({
    where: { id, userId }
  });

  if (!task) {
    throw new AppError('任务不存在', 404);
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      completed: !task.completed,
      completedAt: !task.completed ? new Date() : null
    },
    include: {
      list: true,
      tags: true,
      subtasks: true
    }
  });

  res.json({
    success: true,
    message: task.completed ? '任务标记为未完成' : '任务已完成',
    data: updatedTask
  });
});