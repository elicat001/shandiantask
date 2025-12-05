import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Search, MoreHorizontal, Calendar as CalendarIcon, Hash, Flag, Inbox,
  LayoutGrid, ListFilter, ArrowRight, AlertCircle, X, Check, GripVertical,
  BarChart2, TrendingUp, CornerDownRight, ChevronRight, ChevronDown, Clock,
  Trash2, CheckSquare, Square, Tag, XCircle
} from 'lucide-react';
import { Task, List, SubTask } from '../../types';
import { parseTaskWithAI } from '../../services/geminiService';
import { useStore, getFilteredTasks } from '../../store/useStore';

const TaskView: React.FC = () => {
  // Global State from Zustand
  const tasks = useStore((state) => state.tasks);
  const lists = useStore((state) => state.lists);
  const activeListId = useStore((state) => state.activeListId);
  const setActiveListId = useStore((state) => state.setActiveList);
  const addTask = useStore((state) => state.addTask);
  const updateTask = useStore((state) => state.updateTask);
  const deleteTask = useStore((state) => state.deleteTask);
  const toggleTask = useStore((state) => state.toggleTask);
  const loadTasks = useStore((state) => state.loadTasks);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // State: Input & Parsing
  const [inputValue, setInputValue] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // State: Enhanced Input Toolbar
  const [inputPriority, setInputPriority] = useState<'none' | 'low' | 'medium' | 'high'>('none');
  const [inputTags, setInputTags] = useState<string[]>([]);
  const [inputDueDate, setInputDueDate] = useState<Date | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [tagInputValue, setTagInputValue] = useState('');

  // State: Subtasks
  const [addingSubtaskTo, setAddingSubtaskTo] = useState<string | null>(null);
  const [subtaskInput, setSubtaskInput] = useState('');

  // State: Drag and Drop
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverListId, setDragOverListId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<'top' | 'bottom' | null>(null);

  // State: Bulk Actions
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [showBulkTagMenu, setShowBulkTagMenu] = useState(false);

  const availableTags = ['工作', '个人', '健康', '财务', '开发', '学习'];

  const listNameMap: Record<string, string> = {
    inbox: '收集箱',
    today: '今天',
    next_7_days: '最近7天',
    work: '工作',
    personal: '个人'
  };

  const priorityMap: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低',
    none: '无'
  };

  // --- Statistics Logic ---
  const getStats = () => {
    const now = new Date();
    // Start of current week (Sunday)
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const weekly = tasks.filter(t => {
      if (!t.completed || !t.completedDate) return false;
      const d = new Date(t.completedDate);
      return d >= startOfWeek;
    }).length;

    const monthly = tasks.filter(t => {
        if (!t.completed || !t.completedDate) return false;
        const d = new Date(t.completedDate);
        return d >= startOfMonth;
    }).length;

    return { weekly, monthly };
  };
  const stats = getStats();

  // --- Drag & Drop Logic ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    if (isSelectionMode) {
      e.preventDefault();
      return;
    }
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Set a transparent drag image or keep default
    // const img = new Image(); img.src = ''; e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleTaskDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault(); // Necessary to allow dropping
    if (isSelectionMode || draggedTaskId === targetId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? 'top' : 'bottom';

    setDragOverTaskId(targetId);
    setDragPosition(position);
  };

  const handleTaskDragLeave = () => {
    setDragOverTaskId(null);
    setDragPosition(null);
  };

  const handleTaskDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverTaskId(null);
    setDragPosition(null);

    if (!draggedTaskId || draggedTaskId === targetId || isSelectionMode) return;

    // TODO: Implement task reordering in Zustand store
    // For now, just reset drag state
    setDraggedTaskId(null);
  };

  const handleListDrop = (e: React.DragEvent, targetListId: string) => {
    e.preventDefault();
    setDragOverListId(null);
    if (!draggedTaskId || isSelectionMode) return;

    updateTask(draggedTaskId, { listId: targetListId });
    setDraggedTaskId(null);
  };

  // --- Task Management ---
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsParsing(true);
    const parsedData = await parseTaskWithAI(inputValue);
    setIsParsing(false);

    // Merge manual overrides with AI data (manual takes precedence)
    const finalPriority = inputPriority !== 'none' ? inputPriority : (parsedData?.priority || 'none');
    const finalTags = inputTags.length > 0 ? inputTags : (parsedData?.tags || []);
    const finalDueDate = inputDueDate ? inputDueDate : (parsedData?.dueDate ? new Date(parsedData.dueDate) : undefined);

    const newTask: Task = {
      id: Date.now().toString(),
      title: parsedData?.title || inputValue,
      completed: false,
      listId: activeListId,
      priority: finalPriority,
      tags: finalTags,
      dueDate: finalDueDate,
      subtasks: []
    };

    addTask(newTask);
    setInputValue('');
    // Reset toolbar
    setInputPriority('none');
    setInputTags([]);
    setInputDueDate(null);
  };

  // toggleTask is now handled by Zustand store

  // --- Bulk Actions ---
  const toggleSelection = (taskId: string) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedTaskIds.size === activeTasks.length) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(activeTasks.map(t => t.id)));
    }
  };

  const handleBulkDelete = () => {
    Array.from(selectedTaskIds).forEach((id: string) => deleteTask(id));
    setSelectedTaskIds(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkComplete = () => {
    Array.from(selectedTaskIds).forEach((id: string) => {
      const task = tasks.find(t => t.id === id);
      if (task && !task.completed) toggleTask(id);
    });
    setSelectedTaskIds(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkTag = (tag: string) => {
    Array.from(selectedTaskIds).forEach((id: string) => {
      const task = tasks.find(t => t.id === id);
      if (task) {
        const currentTags = task.tags || [];
        if (!currentTags.includes(tag)) {
          updateTask(id, { tags: [...currentTags, tag] });
        }
      }
    });
    setShowBulkTagMenu(false);
  };

  // --- Subtask Management ---
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedSubtasks = task.subtasks?.map(st =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      updateTask(taskId, { subtasks: updatedSubtasks });
    }
  };

  const handleAddSubtask = (taskId: string) => {
    if (!subtaskInput.trim()) return;
    const newSub: SubTask = { id: Date.now().toString(), title: subtaskInput, completed: false };
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { subtasks: [...(task.subtasks || []), newSub] });
    }
    setSubtaskInput('');
    setAddingSubtaskTo(null);
  };

  // --- UI Helpers ---
  const isOverdue = (date?: Date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return d < today;
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'high': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' };
      case 'medium': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' };
      case 'low': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' };
      default: return null;
    }
  };

  // --- Dropdown Actions ---
  const toggleTag = (tag: string) => {
    setInputTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // Filter tasks using the utility function from store
  const filteredTasks = getFilteredTasks(tasks, activeListId);
  const activeTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  // Filtered tags for dropdown
  const filteredTags = availableTags.filter(tag => 
    tag.toLowerCase().includes(tagInputValue.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-white relative">
      {/* Sidebar List Navigation */}
      <div className="hidden md:flex w-64 bg-gray-50 border-r border-gray-200 flex-col h-full flex-shrink-0">
        <div className="p-4 flex-shrink-0">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">智能清单</h2>
          <ul className="space-y-1">
            {['inbox', 'today', 'next_7_days'].map(listId => (
              <li 
                key={listId}
                onDragOver={(e) => { e.preventDefault(); setDragOverListId(listId); }}
                onDragLeave={() => setDragOverListId(null)}
                onDrop={(e) => handleListDrop(e, listId)}
                onClick={() => setActiveListId(listId)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  activeListId === listId ? 'bg-sage-100 text-sage-700' : 'text-gray-600 hover:bg-gray-100'
                } ${dragOverListId === listId ? 'bg-sage-200 ring-2 ring-sage-400' : ''}`}
              >
                <div className="flex items-center gap-2">
                  {listId === 'inbox' ? <Inbox size={16} /> : listId === 'today' ? <CalendarIcon size={16} /> : <LayoutGrid size={16} />}
                  {listNameMap[listId]}
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {tasks.filter(t => t.listId === listId && !t.completed).length}
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">清单</h2>
           <ul className="space-y-1">
              <li 
                 onDragOver={(e) => { e.preventDefault(); setDragOverListId('work'); }}
                 onDragLeave={() => setDragOverListId(null)}
                 onDrop={(e) => handleListDrop(e, 'work')}
                 onClick={() => setActiveListId('work')}
                 className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${activeListId === 'work' ? 'bg-sage-100 text-sage-700' : 'text-gray-600 hover:bg-gray-100'} ${dragOverListId === 'work' ? 'bg-sage-200 ring-2 ring-sage-400' : ''}`}
              >
                 <span className="w-2 h-2 rounded-full bg-blue-400" /> 工作
              </li>
              <li 
                onDragOver={(e) => { e.preventDefault(); setDragOverListId('personal'); }}
                onDragLeave={() => setDragOverListId(null)}
                onDrop={(e) => handleListDrop(e, 'personal')}
                onClick={() => setActiveListId('personal')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${activeListId === 'personal' ? 'bg-sage-100 text-sage-700' : 'text-gray-600 hover:bg-gray-100'} ${dragOverListId === 'personal' ? 'bg-sage-200 ring-2 ring-sage-400' : ''}`}
              >
                 <span className="w-2 h-2 rounded-full bg-green-400" /> 个人
              </li>
           </ul>
        </div>

        {/* Statistics Section */}
        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BarChart2 size={12} /> 统计
          </h2>
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-sage-50 rounded-lg p-3 border border-sage-100 cursor-help" title={`本周已完成 ${stats.weekly} 个任务`}>
                <div className="text-xs text-sage-500 mb-1">本周</div>
                <div className="text-2xl font-bold text-sage-700 flex items-end gap-1">
                  {stats.weekly}
                  <TrendingUp size={12} className="mb-1.5 text-sage-400" />
                </div>
             </div>
             <div className="bg-sage-50 rounded-lg p-3 border border-sage-100 cursor-help" title={`本月已完成 ${stats.monthly} 个任务`}>
                <div className="text-xs text-sage-500 mb-1">本月</div>
                <div className="text-2xl font-bold text-sage-700">{stats.monthly}</div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Task Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <div className="h-14 md:h-16 border-b border-gray-100 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
           <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
             {listNameMap[activeListId] || activeListId} 
             <span className="text-sm font-normal text-gray-400">({activeTasks.length})</span>
           </h1>
           <div className="flex items-center gap-2">
             <button 
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedTaskIds(new Set());
                }}
                className={`p-2 rounded transition-colors ${isSelectionMode ? 'bg-sage-100 text-sage-600' : 'hover:bg-gray-100 text-gray-500'}`}
                title="选择任务"
             >
               <CheckSquare size={18} />
             </button>
             <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><ListFilter size={18} /></button>
             <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><MoreHorizontal size={18} /></button>
           </div>
        </div>

        {/* Task Input (Hidden in selection mode for clarity, or kept visible) */}
        <div className={`p-6 pb-2 transition-opacity duration-200 ${isSelectionMode ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-sage-400 focus-within:border-transparent transition-all">
             <div className="flex items-center px-4 pt-3">
               <Plus size={20} className="text-gray-400 mr-3" />
               <input 
                 type="text" 
                 placeholder="添加任务到「任务箱」，例如「每天读本书」..." 
                 className="flex-1 py-1 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleAddTask(e)}
                 disabled={isParsing}
               />
             </div>
             
             {/* Selected Chips Area */}
             <div className="px-12 py-1 flex flex-wrap gap-2 min-h-[4px]">
                {inputDueDate && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">
                    <CalendarIcon size={10} />
                    {inputDueDate.toLocaleDateString()}
                    <button onClick={() => setInputDueDate(null)} className="hover:text-blue-800"><X size={10}/></button>
                  </span>
                )}
                {inputPriority !== 'none' && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getPriorityBadge(inputPriority)?.bg} ${getPriorityBadge(inputPriority)?.text}`}>
                    <Flag size={10} fill="currentColor" />
                    {priorityMap[inputPriority]}
                    <button onClick={() => setInputPriority('none')}><X size={10}/></button>
                  </span>
                )}
                {inputTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-sage-50 text-sage-600 px-2 py-0.5 rounded text-xs font-medium">
                    <Tag size={10} />
                    {tag}
                    <button onClick={() => toggleTag(tag)}><X size={10}/></button>
                  </span>
                ))}
             </div>
             
             {/* Input Toolbar */}
             <div className="flex items-center justify-between px-4 pb-3 pt-1">
                <div className="flex items-center gap-2">
                   <div className="relative">
                      <button onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')} className={`p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-sage-600 transition-colors ${inputDueDate ? 'text-sage-600 bg-sage-50' : ''}`} title="截止日期">
                          <CalendarIcon size={18} />
                      </button>
                      {activeDropdown === 'date' && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-lg p-3 z-50 w-64 animate-in fade-in zoom-in-95 duration-200">
                              <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">选择日期</h3>
                              <input 
                                type="date" 
                                className="w-full border border-gray-200 rounded p-1 text-sm text-gray-600 focus:outline-none focus:border-sage-400"
                                onChange={(e) => { setInputDueDate(e.target.valueAsDate); setActiveDropdown(null); }}
                              />
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                  <button onClick={() => { setInputDueDate(new Date()); setActiveDropdown(null); }} className="text-xs py-1 bg-gray-50 hover:bg-gray-100 rounded text-gray-600">今天</button>
                                  <button onClick={() => { const d = new Date(); d.setDate(d.getDate() + 1); setInputDueDate(d); setActiveDropdown(null); }} className="text-xs py-1 bg-gray-50 hover:bg-gray-100 rounded text-gray-600">明天</button>
                                  <button onClick={() => { const d = new Date(); d.setDate(d.getDate() + 7); setInputDueDate(d); setActiveDropdown(null); }} className="text-xs py-1 bg-gray-50 hover:bg-gray-100 rounded text-gray-600">下周</button>
                                  <button onClick={() => { setInputDueDate(null); setActiveDropdown(null); }} className="text-xs py-1 bg-gray-50 hover:bg-gray-100 rounded text-gray-600">清除</button>
                              </div>
                          </div>
                      )}
                   </div>

                   <div className="relative">
                      <button onClick={() => setActiveDropdown(activeDropdown === 'priority' ? null : 'priority')} className={`p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-sage-600 transition-colors ${inputPriority !== 'none' ? 'text-sage-600 bg-sage-50' : ''}`} title="优先级">
                          <Flag size={18} />
                      </button>
                      {activeDropdown === 'priority' && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-lg p-1 z-50 w-32 animate-in fade-in zoom-in-95 duration-200">
                             {(['high', 'medium', 'low', 'none'] as const).map(p => (
                                 <button 
                                    key={p}
                                    onClick={() => { setInputPriority(p); setActiveDropdown(null); }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded flex items-center gap-2"
                                 >
                                     <Flag size={14} className={p === 'high' ? 'text-red-500' : p === 'medium' ? 'text-amber-500' : p === 'low' ? 'text-blue-500' : 'text-gray-400'} />
                                     {priorityMap[p]}
                                 </button>
                             ))}
                          </div>
                      )}
                   </div>

                   <div className="relative">
                      <button onClick={() => setActiveDropdown(activeDropdown === 'tags' ? null : 'tags')} className={`p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-sage-600 transition-colors ${inputTags.length > 0 ? 'text-sage-600 bg-sage-50' : ''}`} title="标签">
                          <Hash size={18} />
                      </button>
                      {activeDropdown === 'tags' && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-lg p-2 z-50 w-48 animate-in fade-in zoom-in-95 duration-200">
                             <input 
                                type="text" 
                                placeholder="筛选标签..." 
                                className="w-full border-b border-gray-100 pb-2 mb-2 text-sm focus:outline-none"
                                autoFocus
                                value={tagInputValue}
                                onChange={e => setTagInputValue(e.target.value)}
                             />
                             <div className="max-h-40 overflow-y-auto">
                                 {filteredTags.map(tag => (
                                     <button 
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className="w-full text-left px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded flex items-center justify-between"
                                     >
                                         <span># {tag}</span>
                                         {inputTags.includes(tag) && <Check size={12} className="text-sage-500" />}
                                     </button>
                                 ))}
                             </div>
                          </div>
                      )}
                   </div>
                </div>
                <div>
                    <button 
                        onClick={handleAddTask}
                        disabled={!inputValue.trim() && !isParsing} 
                        className="bg-sage-500 hover:bg-sage-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isParsing ? 'AI解析中...' : '添加任务'}
                    </button>
                </div>
             </div>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
            {/* Active Tasks */}
            <div className="space-y-2 relative">
                {activeTasks.length === 0 && completedTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Inbox size={40} className="text-gray-200" />
                        </div>
                        <p>没有任务，享受生活吧！</p>
                    </div>
                )}
                
                {activeTasks.map(task => (
                    <div 
                        key={task.id}
                        draggable={!isSelectionMode}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragOver={(e) => handleTaskDragOver(e, task.id)}
                        onDragLeave={handleTaskDragLeave}
                        onDrop={(e) => handleTaskDrop(e, task.id)}
                        className={`group bg-white border rounded-xl p-3 flex flex-col gap-2 transition-all hover:shadow-md relative ${
                            draggedTaskId === task.id ? 'opacity-30 scale-[0.98]' : 'opacity-100'
                        } ${
                           isSelectionMode 
                              ? selectedTaskIds.has(task.id) ? 'border-sage-300 bg-sage-50/50' : 'border-gray-100' 
                              : 'border-gray-100 hover:border-sage-200'
                        }`}
                    >
                        {/* Insertion Indicators */}
                        {dragOverTaskId === task.id && dragPosition === 'top' && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-sage-500 rounded-full -mt-1.5 shadow-sm z-10 pointer-events-none"></div>
                        )}
                        {dragOverTaskId === task.id && dragPosition === 'bottom' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-sage-500 rounded-full -mb-1.5 shadow-sm z-10 pointer-events-none"></div>
                        )}

                        <div className="flex items-start gap-3">
                            {isSelectionMode ? (
                                <button 
                                    onClick={() => toggleSelection(task.id)}
                                    className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedTaskIds.has(task.id) ? 'bg-sage-500 border-sage-500 text-white' : 'border-gray-300 bg-white'}`}
                                >
                                    {selectedTaskIds.has(task.id) && <Check size={12} />}
                                </button>
                            ) : (
                                <div className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-500">
                                    <GripVertical size={16} />
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3">
                                    <button 
                                        onClick={() => toggleTask(task.id)}
                                        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                                            task.priority === 'high' ? 'border-red-400' : 
                                            task.priority === 'medium' ? 'border-amber-400' : 
                                            task.priority === 'low' ? 'border-blue-400' : 'border-gray-300'
                                        }`}
                                    >
                                    </button>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-800 font-medium">{task.title}</span>
                                            {task.tags.map(tag => (
                                                <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">#{tag}</span>
                                            ))}
                                        </div>
                                        
                                        <div className="flex items-center gap-4 mt-1">
                                            {task.dueDate && (
                                                <span className={`text-xs flex items-center gap-1 ${isOverdue(task.dueDate) ? 'text-red-500' : 'text-gray-400'}`}>
                                                    <CalendarIcon size={12} />
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Subtasks */}
                                {(task.subtasks && task.subtasks.length > 0 || addingSubtaskTo === task.id) && (
                                    <div className="ml-8 mt-2 space-y-1">
                                        {task.subtasks?.map(sub => (
                                            <div key={sub.id} className="flex items-center gap-2 text-sm text-gray-600 group/sub">
                                                <button 
                                                    onClick={() => handleToggleSubtask(task.id, sub.id)}
                                                    className={`w-4 h-4 rounded border flex items-center justify-center ${sub.completed ? 'bg-gray-400 border-gray-400 text-white' : 'border-gray-300'}`}
                                                >
                                                    {sub.completed && <Check size={10} />}
                                                </button>
                                                <span className={sub.completed ? 'line-through text-gray-400' : ''}>{sub.title}</span>
                                            </div>
                                        ))}
                                        {addingSubtaskTo === task.id && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border border-dashed border-gray-300 rounded" />
                                                <input 
                                                    autoFocus
                                                    type="text"
                                                    className="flex-1 bg-transparent text-sm focus:outline-none border-b border-gray-200"
                                                    placeholder="输入子任务..."
                                                    value={subtaskInput}
                                                    onChange={(e) => setSubtaskInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask(task.id)}
                                                    onBlur={() => { if(!subtaskInput) setAddingSubtaskTo(null); }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                <button onClick={() => setAddingSubtaskTo(task.id)} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-sage-600" title="添加子任务">
                                    <CornerDownRight size={16} />
                                </button>
                                <button onClick={() => deleteTask(task.id)} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500" title="删除">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Completed Tasks Accordion */}
            {completedTasks.length > 0 && (
                <div className="mt-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">已完成 ({completedTasks.length})</span>
                        <div className="h-px bg-gray-100 flex-1"></div>
                    </div>
                    <div className="space-y-1 opacity-60 hover:opacity-100 transition-opacity">
                        {completedTasks.map(task => (
                             <div 
                                key={task.id}
                                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group"
                            >
                                <button 
                                    onClick={() => toggleTask(task.id)}
                                    className="w-5 h-5 rounded border border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400"
                                >
                                    <Check size={12} />
                                </button>
                                <span className="text-gray-500 line-through flex-1">{task.title}</span>
                                <button onClick={() => deleteTask(task.id)} className="p-1 hover:text-red-500 text-gray-300 opacity-0 group-hover:opacity-100">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Bulk Action Bar */}
        {isSelectionMode && selectedTaskIds.size > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-200 z-50">
                <span className="font-bold text-sm">{selectedTaskIds.size} 已选择</span>
                <div className="w-px h-4 bg-gray-600"></div>
                <button onClick={handleBulkComplete} className="hover:text-sage-300 transition-colors" title="标记完成"><CheckSquare size={20} /></button>
                <div className="relative">
                    <button onClick={() => setShowBulkTagMenu(!showBulkTagMenu)} className="hover:text-blue-300 transition-colors" title="添加标签"><Tag size={20} /></button>
                    {showBulkTagMenu && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-lg shadow-xl py-1 text-gray-800 w-32 overflow-hidden">
                            {availableTags.map(tag => (
                                <button key={tag} onClick={() => handleBulkTag(tag)} className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm">{tag}</button>
                            ))}
                        </div>
                    )}
                </div>
                <button onClick={handleBulkDelete} className="hover:text-red-300 transition-colors" title="删除"><Trash2 size={20} /></button>
                <div className="w-px h-4 bg-gray-600"></div>
                <button onClick={() => { setIsSelectionMode(false); setSelectedTaskIds(new Set()); }} className="text-sm font-medium hover:text-gray-300">取消</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default TaskView;