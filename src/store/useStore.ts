import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 用户相关类型
interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar: string | null;
}

// 任务相关类型
interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  listId: string;
  tags: string[];
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface List {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  taskCount?: number;
  isDefault?: boolean;
  orderIndex: number;
}

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Store 状态接口
interface StoreState {
  // 用户状态
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;

  // 任务状态
  tasks: Task[];
  lists: List[];
  selectedListId: string | null;

  // 任务操作
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  moveTask: (taskId: string, newListId: string) => void;
  reorderTasks: (listId: string, taskIds: string[]) => void;

  // 列表操作
  addList: (list: List) => void;
  updateList: (id: string, updates: Partial<List>) => void;
  deleteList: (id: string) => void;
  selectList: (id: string | null) => void;

  // 子任务操作
  addSubtask: (taskId: string, subtask: Subtask) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  toggleSubtaskComplete: (taskId: string, subtaskId: string) => void;

  // 笔记状态
  notes: Note[];
  selectedNoteId: string | null;

  // 笔记操作
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;

  // 搜索和筛选
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterTags: string[];
  toggleFilterTag: (tag: string) => void;
  clearFilters: () => void;

  // UI 状态
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // 数据同步
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  lastSync: string | null;
  setLastSync: (time: string) => void;
}

// 创建 Store
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // 用户状态初始值
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({
        user: null,
        tasks: [],
        lists: [],
        selectedListId: null,
        notes: [],
        selectedNoteId: null,
      }),

      // 任务状态初始值
      tasks: [],
      lists: [], // 初始为空，登录后从数据库加载
      selectedListId: null,

      // 任务操作
      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      toggleTaskComplete: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
              : task
          ),
        })),

      moveTask: (taskId, newListId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, listId: newListId, updatedAt: new Date().toISOString() }
              : task
          ),
        })),

      reorderTasks: (listId, taskIds) =>
        set((state) => {
          const listTasks = state.tasks.filter((t) => t.listId === listId);
          const otherTasks = state.tasks.filter((t) => t.listId !== listId);
          const reorderedListTasks = taskIds
            .map((id) => listTasks.find((t) => t.id === id))
            .filter(Boolean) as Task[];
          return {
            tasks: [...otherTasks, ...reorderedListTasks],
          };
        }),

      // 列表操作
      addList: (list) =>
        set((state) => ({
          lists: [...state.lists, list],
        })),

      updateList: (id, updates) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === id ? { ...list, ...updates } : list
          ),
        })),

      deleteList: (id) =>
        set((state) => {
          // 删除列表时，将该列表中的任务移动到收件箱
          const updatedTasks = state.tasks.map((task) =>
            task.listId === id ? { ...task, listId: 'inbox' } : task
          );
          return {
            lists: state.lists.filter((list) => list.id !== id),
            tasks: updatedTasks,
            selectedListId: state.selectedListId === id ? 'inbox' : state.selectedListId,
          };
        }),

      selectList: (id) => set({ selectedListId: id }),

      // 子任务操作
      addSubtask: (taskId, subtask) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: [...task.subtasks, subtask],
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        })),

      updateSubtask: (taskId, subtaskId, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map((subtask) =>
                    subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        })),

      deleteSubtask: (taskId, subtaskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        })),

      toggleSubtaskComplete: (taskId, subtaskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map((subtask) =>
                    subtask.id === subtaskId
                      ? { ...subtask, completed: !subtask.completed }
                      : subtask
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        })),

      // 笔记状态初始值
      notes: [],
      selectedNoteId: null,

      // 笔记操作
      addNote: (note) =>
        set((state) => ({
          notes: [...state.notes, note],
        })),

      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date().toISOString() }
              : note
          ),
        })),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
        })),

      selectNote: (id) => set({ selectedNoteId: id }),

      // 搜索和筛选
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      filterTags: [],
      toggleFilterTag: (tag) =>
        set((state) => ({
          filterTags: state.filterTags.includes(tag)
            ? state.filterTags.filter((t) => t !== tag)
            : [...state.filterTags, tag],
        })),
      clearFilters: () => set({ searchQuery: '', filterTags: [] }),

      // UI 状态
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      theme: 'light',
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          // 更新 HTML 元素的 class
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
          }
          return { theme: newTheme };
        }),

      // 数据同步
      loading: false,
      setLoading: (loading) => set({ loading }),
      error: null,
      setError: (error) => set({ error }),
      lastSync: null,
      setLastSync: (time) => set({ lastSync: time }),
    }),
    {
      name: 'shandian-task-storage', // localStorage 键名
      partialize: (state) => ({
        // 只持久化必要的数据
        user: state.user,
        tasks: state.tasks,
        lists: state.lists,
        notes: state.notes,
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        selectedListId: state.selectedListId,
        selectedNoteId: state.selectedNoteId,
      }),
    }
  )
);

// 导出类型
export type { User, Task, Subtask, List, Note, StoreState };