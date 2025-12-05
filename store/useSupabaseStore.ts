// Supabase 数据库连接的状态管理
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Task, Note, CalendarEvent, List, Challenge } from '../types';
import { supabaseApi } from '../src/services/supabaseApi';
import { supabase } from '../src/lib/supabase';

// ========== Store 接口定义 ==========
interface SupabaseStore {
  // ===== 用户状态 =====
  userId: string | null;
  isLoading: boolean;
  error: string | null;

  // ===== Tasks 模块 =====
  tasks: Task[];
  lists: List[];
  activeListId: string;

  // Tasks actions
  fetchTasks: () => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  reorderTasks: (draggedId: string, targetId: string, position: 'before' | 'after') => Promise<void>;

  // Lists actions
  fetchLists: () => Promise<void>;
  addList: (list: Partial<List>) => Promise<void>;
  updateList: (id: string, updates: Partial<List>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  setActiveList: (listId: string) => void;

  // ===== Notes 模块 =====
  notes: Note[];
  activeNoteId: string | null;

  // Notes actions
  fetchNotes: () => Promise<void>;
  addNote: (note: Partial<Note>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setActiveNote: (id: string | null) => void;

  // ===== 全局 actions =====
  initializeUserData: (userId: string) => Promise<void>;
  clearUserData: () => void;
  subscribeToChanges: () => void;
  unsubscribeFromChanges: () => void;
}

// 实时订阅管理
let tasksSubscription: any = null;
let listsSubscription: any = null;
let notesSubscription: any = null;

// ========== 创建 Store ==========
export const useSupabaseStore = create<SupabaseStore>()(
  devtools(
    (set, get) => ({
      // ===== 用户状态 =====
      userId: null,
      isLoading: false,
      error: null,

      // ===== Tasks 模块状态 =====
      tasks: [],
      lists: [],
      activeListId: '',

      // Fetch tasks from Supabase
      fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await supabaseApi.tasks.getAll();
          if (result.success && result.data) {
            // 转换任务格式以匹配前端 Task 类型
            const tasks = result.data.map((task: any) => ({
              id: task.id,
              title: task.title,
              description: task.description || '',
              completed: task.completed,
              completedDate: task.completedAt ? new Date(task.completedAt) : undefined,
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
              priority: task.priority || 'none',
              tags: task.tags || [],
              subtasks: task.subtasks || [],
              listId: task.listId,
              order: task.orderIndex || 0,
            }));
            set({ tasks, isLoading: false });
          } else {
            set({ error: result.error?.message || '获取任务失败', isLoading: false });
          }
        } catch (error) {
          set({ error: '网络错误', isLoading: false });
        }
      },

      // Add task to Supabase
      addTask: async (taskData) => {
        set({ isLoading: true, error: null });
        try {
          const result = await supabaseApi.tasks.create({
            title: taskData.title || '',
            description: taskData.description,
            listId: taskData.listId || get().activeListId || get().lists[0]?.id,
            dueDate: taskData.dueDate,
            priority: taskData.priority || 'none',
          });

          if (result.success && result.data) {
            // 添加任务到本地状态
            const newTask: Task = {
              id: result.data.id,
              title: result.data.title,
              description: result.data.description || '',
              completed: result.data.completed,
              completedDate: result.data.completedAt ? new Date(result.data.completedAt) : undefined,
              dueDate: result.data.dueDate ? new Date(result.data.dueDate) : undefined,
              priority: result.data.priority || 'none',
              tags: result.data.tags || [],
              subtasks: result.data.subtasks || [],
              listId: result.data.listId,
              order: result.data.orderIndex || 0,
            };
            set({ tasks: [...get().tasks, newTask], isLoading: false });
          } else {
            set({ error: result.error?.message || '添加任务失败', isLoading: false });
          }
        } catch (error) {
          set({ error: '网络错误', isLoading: false });
        }
      },

      // Update task in Supabase
      updateTask: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const result = await supabaseApi.tasks.update(id, {
            title: updates.title,
            description: updates.description,
            completed: updates.completed,
            due_date: updates.dueDate,
            priority: updates.priority,
            list_id: updates.listId,
          });

          if (result.success) {
            const tasks = get().tasks.map(t =>
              t.id === id ? { ...t, ...updates } : t
            );
            set({ tasks, isLoading: false });
          } else {
            set({ error: result.error?.message || '更新任务失败', isLoading: false });
          }
        } catch (error) {
          set({ error: '网络错误', isLoading: false });
        }
      },

      // Delete task from Supabase
      deleteTask: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const result = await supabaseApi.tasks.delete(id);

          if (result.success) {
            const tasks = get().tasks.filter(t => t.id !== id);
            set({ tasks, isLoading: false });
          } else {
            set({ error: result.error?.message || '删除任务失败', isLoading: false });
          }
        } catch (error) {
          set({ error: '网络错误', isLoading: false });
        }
      },

      // Toggle task completion
      toggleTask: async (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;

        await get().updateTask(id, {
          completed: !task.completed,
          completedDate: !task.completed ? new Date() : undefined,
        });
      },

      // Reorder tasks
      reorderTasks: async (draggedId, targetId, position) => {
        // 实现任务重排序
        const tasks = get().tasks;
        const draggedTask = tasks.find(t => t.id === draggedId);
        const targetTask = tasks.find(t => t.id === targetId);

        if (!draggedTask || !targetTask || draggedId === targetId) return;

        // 本地重排序逻辑
        const listTasks = tasks
          .filter(t => t.listId === draggedTask.listId)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        const draggedIndex = listTasks.findIndex(t => t.id === draggedId);
        const targetIndex = listTasks.findIndex(t => t.id === targetId);

        const reorderedTasks = [...listTasks];
        const [removed] = reorderedTasks.splice(draggedIndex, 1);

        let insertIndex: number;
        if (draggedIndex < targetIndex) {
          insertIndex = position === 'after' ? targetIndex : targetIndex - 1;
        } else {
          insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
        }

        insertIndex = Math.max(0, Math.min(insertIndex, reorderedTasks.length));
        reorderedTasks.splice(insertIndex, 0, removed);

        // 更新 order 值
        const updates = reorderedTasks.map((task, index) => ({
          id: task.id,
          order: index,
        }));

        // 批量更新到数据库
        await supabaseApi.tasks.reorder(
          updates.map(u => u.id),
          updates.map(u => u.order)
        );

        // 更新本地状态
        const updatedTasks = tasks.map(t => {
          const update = updates.find(u => u.id === t.id);
          return update ? { ...t, order: update.order } : t;
        });

        set({ tasks: updatedTasks });
      },

      // ===== Lists 模块 =====
      fetchLists: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await supabaseApi.lists.getAll();
          if (result.success && result.data) {
            const lists = result.data.map((list: any) => ({
              id: list.id,
              name: list.name,
              color: list.color,
              icon: list.icon,
              isDefault: list.isDefault,
              order: list.orderIndex || 0,
            }));

            // 设置默认活动列表
            const defaultList = lists.find((l: List) => l.isDefault) || lists[0];
            set({
              lists,
              activeListId: defaultList?.id || '',
              isLoading: false
            });
          } else {
            set({ error: result.error?.message || '获取列表失败', isLoading: false });
          }
        } catch (error) {
          set({ error: '网络错误', isLoading: false });
        }
      },

      addList: async (listData) => {
        set({ isLoading: true, error: null });
        try {
          const result = await supabaseApi.lists.create({
            name: listData.name || '新列表',
            color: listData.color,
            icon: listData.icon,
          });

          if (result.success && result.data) {
            const newList: List = {
              id: result.data.id,
              name: result.data.name,
              color: result.data.color,
              icon: result.data.icon,
              isDefault: result.data.isDefault,
              order: result.data.orderIndex || 0,
            };
            set({ lists: [...get().lists, newList], isLoading: false });
          } else {
            set({ error: result.error?.message || '添加列表失败', isLoading: false });
          }
        } catch (error) {
          set({ error: '网络错误', isLoading: false });
        }
      },

      updateList: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const result = await supabaseApi.lists.update(id, updates);

          if (result.success) {
            const lists = get().lists.map(l =>
              l.id === id ? { ...l, ...updates } : l
            );
            set({ lists, isLoading: false });
          } else {
            set({ error: result.error?.message || '更新列表失败', isLoading: false });
          }
        } catch (error) {
          set({ error: '网络错误', isLoading: false });
        }
      },

      deleteList: async (id) => {
        // 不允许删除默认列表
        const list = get().lists.find(l => l.id === id);
        if (list?.isDefault) {
          set({ error: '不能删除默认列表' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const result = await supabaseApi.lists.delete(id);

          if (result.success) {
            const lists = get().lists.filter(l => l.id !== id);
            set({ lists, isLoading: false });
          } else {
            set({ error: result.error?.message || '删除列表失败', isLoading: false });
          }
        } catch (error) {
          set({ error: '网络错误', isLoading: false });
        }
      },

      setActiveList: (listId) => set({ activeListId: listId }),

      // ===== Notes 模块 =====
      notes: [],
      activeNoteId: null,

      fetchNotes: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await supabaseApi.notes.getAll();
          if (result.success && result.data) {
            const notes = result.data.map((note: any) => ({
              id: note.id,
              title: note.title,
              content: note.content,
              category: note.category,
              pinned: note.pinned,
              archived: note.archived,
              createdAt: new Date(note.createdAt),
              updatedAt: new Date(note.updatedAt),
            }));
            set({ notes, isLoading: false });
          } else {
            set({ error: result.error?.message || '获取笔记失败', isLoading: false });
          }
        } catch (error) {
          set({ error: '网络错误', isLoading: false });
        }
      },

      addNote: async (noteData) => {
        set({ isLoading: true, error: null });
        try {
          const result = await supabaseApi.notes.create({
            title: noteData.title || '新笔记',
            content: noteData.content || '',
            category: noteData.category,
          });

          if (result.success && result.data) {
            const newNote: Note = {
              id: result.data.id,
              title: result.data.title,
              content: result.data.content,
              category: result.data.category,
              pinned: result.data.pinned,
              archived: result.data.archived,
              createdAt: new Date(result.data.createdAt),
              updatedAt: new Date(result.data.updatedAt),
            };
            set({
              notes: [...get().notes, newNote],
              activeNoteId: newNote.id,
              isLoading: false
            });
          } else {
            set({ error: result.error?.message || '添加笔记失败', isLoading: false });
          }
        } catch (error) {
          set({ error: '网络错误', isLoading: false });
        }
      },

      updateNote: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const result = await supabaseApi.notes.update(id, updates);

          if (result.success) {
            const notes = get().notes.map(n =>
              n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n
            );
            set({ notes, isLoading: false });
          } else {
            set({ error: result.error?.message || '更新笔记失败', isLoading: false });
          }
        } catch (error) {
          set({ error: '网络错误', isLoading: false });
        }
      },

      deleteNote: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const result = await supabaseApi.notes.delete(id);

          if (result.success) {
            const notes = get().notes.filter(n => n.id !== id);
            const activeNoteId = get().activeNoteId === id ? null : get().activeNoteId;
            set({ notes, activeNoteId, isLoading: false });
          } else {
            set({ error: result.error?.message || '删除笔记失败', isLoading: false });
          }
        } catch (error) {
          set({ error: '网络错误', isLoading: false });
        }
      },

      setActiveNote: (id) => set({ activeNoteId: id }),

      // ===== 全局 actions =====
      initializeUserData: async (userId) => {
        set({ userId, isLoading: true });

        // 加载用户数据
        await Promise.all([
          get().fetchLists(),
          get().fetchTasks(),
          get().fetchNotes(),
        ]);

        // 订阅实时更新
        get().subscribeToChanges();

        set({ isLoading: false });
      },

      clearUserData: () => {
        // 取消订阅
        get().unsubscribeFromChanges();

        // 清除数据
        set({
          userId: null,
          tasks: [],
          lists: [],
          notes: [],
          activeListId: '',
          activeNoteId: null,
          error: null,
        });
      },

      // 订阅实时数据变化
      subscribeToChanges: () => {
        const userId = get().userId;
        if (!userId) return;

        // 订阅任务变化
        tasksSubscription = supabaseApi.realtime.subscribeToTasks((payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            get().fetchTasks();
          } else if (payload.eventType === 'DELETE') {
            set({ tasks: get().tasks.filter(t => t.id !== payload.old.id) });
          }
        });

        // 订阅列表变化
        listsSubscription = supabaseApi.realtime.subscribeToLists((payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            get().fetchLists();
          } else if (payload.eventType === 'DELETE') {
            set({ lists: get().lists.filter(l => l.id !== payload.old.id) });
          }
        });

        // 订阅笔记变化（如果需要）
        // notesSubscription = ...
      },

      // 取消订阅
      unsubscribeFromChanges: () => {
        if (tasksSubscription) {
          supabaseApi.realtime.unsubscribe(tasksSubscription);
          tasksSubscription = null;
        }
        if (listsSubscription) {
          supabaseApi.realtime.unsubscribe(listsSubscription);
          listsSubscription = null;
        }
        if (notesSubscription) {
          supabaseApi.realtime.unsubscribe(notesSubscription);
          notesSubscription = null;
        }
      },
    }),
    {
      name: 'supabase-store', // DevTools 名称
    }
  )
);

// 导出工具函数（与原 store 兼容）
export { getFilteredTasks, getTaskStats, getTagStats, getPriorityStats } from './useStore';