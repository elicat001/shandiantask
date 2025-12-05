import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';
import {
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Tag,
  Star,
  Trash2,
  Edit3,
  Menu,
  Search,
  LogOut,
  User,
  ChevronRight,
  Inbox,
  Briefcase,
  Home as HomeIcon
} from 'lucide-react';
import { supabaseApi } from '../services/supabaseApi';

const HomePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const {
    tasks,
    lists,
    selectedListId,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    selectList,
    addList,
    sidebarCollapsed,
    toggleSidebar,
    searchQuery,
    setSearchQuery,
  } = useStore();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [loading, setLoading] = useState(false);

  // 加载任务和列表数据
  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // 加载列表
      const listsResult = await supabaseApi.lists.getAll();
      if (listsResult.success && listsResult.data) {
        // 清除本地默认列表，使用从数据库获取的列表
        useStore.setState({ lists: listsResult.data });
      }

      // 加载任务
      const tasksResult = await supabaseApi.tasks.getAll();
      if (tasksResult.success && tasksResult.data) {
        const formattedTasks = tasksResult.data.map(task => ({
          ...task,
          subtasks: task.subtasks || [],
          tags: task.tags || [],
        }));
        useStore.setState({ tasks: formattedTasks });
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取当前列表的任务
  const currentListTasks = tasks.filter(task => {
    if (!selectedListId) return true;
    return task.listId === selectedListId;
  }).filter(task => {
    if (!searchQuery) return true;
    return task.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // 获取当前列表信息
  const currentList = lists.find(list => list.id === selectedListId) || lists[0];

  // 添加新任务
  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !user) return;

    const newTask = {
      title: newTaskTitle,
      listId: selectedListId || lists[0]?.id || 'inbox',
      completed: false,
      priority: 'medium' as const,
      tags: [],
      subtasks: [],
    };

    // 先添加到本地状态
    const tempId = `temp-${Date.now()}`;
    addTask({
      id: tempId,
      ...newTask,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setNewTaskTitle('');
    setShowAddTask(false);

    // 同步到数据库
    const result = await supabaseApi.tasks.create(newTask);
    if (result.success && result.data) {
      // 用真实的任务替换临时任务
      updateTask(tempId, result.data);
    }
  };

  // 切换任务完成状态
  const handleToggleComplete = async (taskId: string) => {
    toggleTaskComplete(taskId);

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await supabaseApi.tasks.update(taskId, { completed: !task.completed });
    }
  };

  // 删除任务
  const handleDeleteTask = async (taskId: string) => {
    deleteTask(taskId);
    await supabaseApi.tasks.delete(taskId);
  };

  // 获取列表图标
  const getListIcon = (listId: string) => {
    switch (listId) {
      case 'inbox':
        return <Inbox className="w-4 h-4" />;
      case 'work':
        return <Briefcase className="w-4 h-4" />;
      case 'personal':
        return <HomeIcon className="w-4 h-4" />;
      default:
        return <ChevronRight className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-4">
          {/* Logo 和菜单按钮 */}
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center gap-2 ${sidebarCollapsed ? 'hidden' : ''}`}>
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-gray-800">闪电任务</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 用户信息 */}
          {!sidebarCollapsed && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.user_metadata?.username || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* 列表导航 */}
          <nav className="space-y-1">
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => selectList(list.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  selectedListId === list.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? list.name : undefined}
              >
                {getListIcon(list.id)}
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{list.name}</span>
                    <span className="text-xs text-gray-500">
                      {tasks.filter(t => t.listId === list.id).length}
                    </span>
                  </>
                )}
              </button>
            ))}
          </nav>

          {/* 登出按钮 */}
          {!sidebarCollapsed && (
            <div className="absolute bottom-4 left-4 right-4">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 p-6">
        {/* 头部 */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentList?.name || '所有任务'}
              </h1>
              <p className="text-gray-500 mt-1">
                {currentListTasks.filter(t => !t.completed).length} 个待完成任务
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索任务..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
            </div>
          </div>
        </header>

        {/* 任务列表 */}
        <div className="space-y-2">
          {/* 添加任务按钮 */}
          {showAddTask ? (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="输入任务标题..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleAddTask}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  添加
                </button>
                <button
                  onClick={() => {
                    setShowAddTask(false);
                    setNewTaskTitle('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddTask(true)}
              className="w-full flex items-center gap-2 p-3 text-gray-600 hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>添加新任务</span>
            </button>
          )}

          {/* 任务项 */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : currentListTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? '没有找到匹配的任务' : '暂无任务，点击上方添加新任务'}
            </div>
          ) : (
            currentListTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className="mt-1"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    {/* 标签和元信息 */}
                    <div className="flex items-center gap-4 mt-2">
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                      {task.priority === 'high' && (
                        <span className="flex items-center gap-1 text-xs text-red-500">
                          <Star className="w-3 h-3" />
                          高优先级
                        </span>
                      )}
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;