import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Search, MoreHorizontal, Calendar as CalendarIcon, Hash, Flag, Inbox, 
  LayoutGrid, ListFilter, ArrowRight, AlertCircle, X, Check, GripVertical, 
  BarChart2, TrendingUp, CornerDownRight, ChevronRight, ChevronDown, Clock
} from 'lucide-react';
import { Task, List, SubTask } from '../../types';
import { parseTaskWithAI } from '../../services/geminiService';

const TaskView: React.FC = () => {
  // State: Tasks
  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: '1', 
      title: 'Buy groceries', 
      completed: false, 
      listId: 'inbox', 
      priority: 'high', 
      tags: ['personal'], 
      dueDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Overdue
      subtasks: [
        { id: 's1', title: 'Milk', completed: true },
        { id: 's2', title: 'Eggs', completed: false }
      ]
    },
    { 
      id: '2', 
      title: 'Finish React project', 
      completed: false, 
      listId: 'work', 
      priority: 'medium', 
      tags: ['dev'], 
      dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
      subtasks: []
    },
    { 
      id: '3', 
      title: 'Morning Jog', 
      completed: true, 
      completedDate: new Date(), 
      listId: 'personal', 
      priority: 'low', 
      tags: ['health'],
      subtasks: [] 
    }
  ]);

  // State: Input & Parsing
  const [inputValue, setInputValue] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [activeListId, setActiveListId] = useState('inbox');

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

  const availableTags = ['work', 'personal', 'health', 'finance', 'dev'];

  // --- Statistics Logic ---
  const getStats = () => {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const weekly = tasks.filter(t => t.completed && t.completedDate && t.completedDate >= startOfWeek).length;
    const monthly = tasks.filter(t => t.completed && t.completedDate && t.completedDate >= startOfMonth).length;

    return { weekly, monthly };
  };
  const stats = getStats();

  // --- Drag & Drop Logic ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent image to clean up drag visual if desired, or default opacity
  };

  const handleTaskDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetTaskId) return;

    const updatedTasks = [...tasks];
    const draggedIndex = updatedTasks.findIndex(t => t.id === draggedTaskId);
    const targetIndex = updatedTasks.findIndex(t => t.id === targetTaskId);

    if (draggedIndex > -1 && targetIndex > -1) {
      const [movedTask] = updatedTasks.splice(draggedIndex, 1);
      updatedTasks.splice(targetIndex, 0, movedTask);
      setTasks(updatedTasks);
    }
    setDraggedTaskId(null);
  };

  const handleListDrop = (e: React.DragEvent, targetListId: string) => {
    e.preventDefault();
    setDragOverListId(null);
    if (!draggedTaskId) return;

    setTasks(tasks.map(t => 
      t.id === draggedTaskId ? { ...t, listId: targetListId } : t
    ));
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

    setTasks([newTask, ...tasks]);
    setInputValue('');
    // Reset toolbar
    setInputPriority('none');
    setInputTags([]);
    setInputDueDate(null);
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const isCompleting = !t.completed;
        return { 
          ...t, 
          completed: isCompleting, 
          completedDate: isCompleting ? new Date() : undefined 
        };
      }
      return t;
    }));
  };

  // --- Subtask Management ---
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      const updatedSubtasks = t.subtasks?.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      return { ...t, subtasks: updatedSubtasks };
    }));
  };

  const handleAddSubtask = (taskId: string) => {
    if (!subtaskInput.trim()) return;
    const newSub: SubTask = { id: Date.now().toString(), title: subtaskInput, completed: false };
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), newSub] } : t
    ));
    setSubtaskInput('');
    setAddingSubtaskTo(null);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
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

  // Filter tasks
  const activeTasks = tasks.filter(t => !t.completed && (activeListId === 'inbox' || t.listId === activeListId));
  const completedTasks = tasks.filter(t => t.completed && (activeListId === 'inbox' || t.listId === activeListId));

  return (
    <div className="flex h-full w-full bg-white">
      {/* Sidebar List Navigation */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full flex-shrink-0">
        <div className="p-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Smart Lists</h2>
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
                <div className="flex items-center gap-2 capitalize">
                  {listId === 'inbox' ? <Inbox size={16} /> : listId === 'today' ? <CalendarIcon size={16} /> : <LayoutGrid size={16} />}
                  {listId.replace(/_/g, ' ')}
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {tasks.filter(t => t.listId === listId && !t.completed).length}
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-4 flex-1">
           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Lists</h2>
           <ul className="space-y-1">
              <li 
                 onDragOver={(e) => { e.preventDefault(); setDragOverListId('work'); }}
                 onDragLeave={() => setDragOverListId(null)}
                 onDrop={(e) => handleListDrop(e, 'work')}
                 onClick={() => setActiveListId('work')}
                 className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${activeListId === 'work' ? 'bg-sage-100 text-sage-700' : 'text-gray-600 hover:bg-gray-100'} ${dragOverListId === 'work' ? 'bg-sage-200 ring-2 ring-sage-400' : ''}`}
              >
                 <span className="w-2 h-2 rounded-full bg-blue-400" /> Work
              </li>
              <li 
                onDragOver={(e) => { e.preventDefault(); setDragOverListId('personal'); }}
                onDragLeave={() => setDragOverListId(null)}
                onDrop={(e) => handleListDrop(e, 'personal')}
                onClick={() => setActiveListId('personal')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${activeListId === 'personal' ? 'bg-sage-100 text-sage-700' : 'text-gray-600 hover:bg-gray-100'} ${dragOverListId === 'personal' ? 'bg-sage-200 ring-2 ring-sage-400' : ''}`}
              >
                 <span className="w-2 h-2 rounded-full bg-green-400" /> Personal
              </li>
           </ul>
        </div>

        {/* Statistics Section */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BarChart2 size={12} /> Statistics
          </h2>
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-sage-50 rounded-lg p-3 border border-sage-100">
                <div className="text-xs text-sage-500 mb-1">This Week</div>
                <div className="text-2xl font-bold text-sage-700 flex items-end gap-1">
                  {stats.weekly}
                  <TrendingUp size={12} className="mb-1.5 text-sage-400" />
                </div>
             </div>
             <div className="bg-sage-50 rounded-lg p-3 border border-sage-100">
                <div className="text-xs text-sage-500 mb-1">This Month</div>
                <div className="text-2xl font-bold text-sage-700">{stats.monthly}</div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Task Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
           <h1 className="text-xl font-bold text-gray-800 capitalize flex items-center gap-2">
             {activeListId.replace(/_/g, ' ')} 
             <span className="text-sm font-normal text-gray-400">({activeTasks.length})</span>
           </h1>
           <div className="flex items-center gap-2">
             <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><ListFilter size={18} /></button>
             <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><MoreHorizontal size={18} /></button>
           </div>
        </div>

        {/* Task Input */}
        <div className="p-6 pb-2">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-sage-400 focus-within:border-transparent transition-all">
             <div className="flex items-center px-4 pt-3">
               <Plus size={20} className="text-gray-400 mr-3" />
               <input 
                 type="text" 
                 placeholder="Add a task to 'Inbox', e.g. 'Read a book every day'..." 
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
                    {inputPriority}
                    <button onClick={() => setInputPriority('none')}><X size={10}/></button>
                  </span>
                )}
                {inputTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                    <Hash size={10} />
                    {tag}
                    <button onClick={() => toggleTag(tag)}><X size={10}/></button>
                  </span>
                ))}
             </div>

             {/* Toolbar */}
             <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50/50 rounded-b-xl relative">
                <div className="flex items-center gap-1">
                   {/* Date Picker */}
                   <div className="relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
                        className={`p-1.5 rounded hover:bg-white hover:shadow-sm transition-all ${inputDueDate ? 'text-blue-500' : 'text-gray-500'}`}
                        title="Set Due Date"
                      >
                        <CalendarIcon size={18} />
                      </button>
                      {activeDropdown === 'date' && (
                        <div className="absolute top-8 left-0 bg-white border border-gray-100 shadow-xl rounded-lg w-40 py-1 z-20">
                           <button onClick={() => { setInputDueDate(new Date()); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700">Today</button>
                           <button onClick={() => { const d = new Date(); d.setDate(d.getDate() + 1); setInputDueDate(d); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700">Tomorrow</button>
                           <button onClick={() => { const d = new Date(); d.setDate(d.getDate() + 7); setInputDueDate(d); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700">Next Week</button>
                        </div>
                      )}
                   </div>

                   {/* Priority Picker */}
                   <div className="relative">
                      <button 
                         onClick={() => setActiveDropdown(activeDropdown === 'priority' ? null : 'priority')}
                         className={`p-1.5 rounded hover:bg-white hover:shadow-sm transition-all ${inputPriority !== 'none' ? 'text-amber-500' : 'text-gray-500'}`}
                         title="Set Priority"
                      >
                         <Flag size={18} />
                      </button>
                      {activeDropdown === 'priority' && (
                        <div className="absolute top-8 left-0 bg-white border border-gray-100 shadow-xl rounded-lg w-32 py-1 z-20">
                           {['high', 'medium', 'low', 'none'].map(p => (
                             <button 
                              key={p} 
                              onClick={() => { setInputPriority(p as any); setActiveDropdown(null); }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700 capitalize flex items-center gap-2"
                             >
                                <Flag size={12} className={p === 'high' ? 'text-red-500' : p === 'medium' ? 'text-amber-500' : p === 'low' ? 'text-blue-500' : 'text-gray-400'} fill="currentColor" />
                                {p}
                             </button>
                           ))}
                        </div>
                      )}
                   </div>
                   
                   {/* Tags Picker */}
                   <div className="relative">
                      <button 
                         onClick={() => setActiveDropdown(activeDropdown === 'tags' ? null : 'tags')}
                         className={`p-1.5 rounded hover:bg-white hover:shadow-sm transition-all ${inputTags.length > 0 ? 'text-sage-500' : 'text-gray-500'}`}
                         title="Add Tags"
                      >
                         <Hash size={18} />
                      </button>
                      {activeDropdown === 'tags' && (
                        <div className="absolute top-8 left-0 bg-white border border-gray-100 shadow-xl rounded-lg w-48 p-2 z-20">
                           <input 
                              className="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 focus:outline-none focus:border-sage-400" 
                              placeholder="Type tag..." 
                              value={tagInputValue}
                              onChange={e => setTagInputValue(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && tagInputValue) {
                                  toggleTag(tagInputValue);
                                  setTagInputValue('');
                                }
                              }}
                           />
                           <div className="flex flex-wrap gap-1">
                             {availableTags.map(tag => (
                               <button 
                                key={tag} 
                                onClick={() => toggleTag(tag)}
                                className={`px-2 py-1 rounded text-xs ${inputTags.includes(tag) ? 'bg-sage-100 text-sage-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                               >
                                 {tag}
                               </button>
                             ))}
                           </div>
                        </div>
                      )}
                   </div>
                </div>

                <button 
                  onClick={handleAddTask}
                  disabled={!inputValue.trim() || isParsing}
                  className="bg-sage-500 hover:bg-sage-600 text-white rounded p-1.5 transition-colors disabled:opacity-50"
                >
                  {isParsing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <ArrowRight size={18} />}
                </button>
             </div>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
           {activeTasks.map(task => {
             const badge = getPriorityBadge(task.priority);
             const overdue = isOverdue(task.dueDate);

             return (
               <div key={task.id}>
                 <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleTaskDrop(e, task.id)}
                    className={`group bg-white border border-gray-100 rounded-lg p-3 flex items-center gap-3 hover:shadow-md transition-all cursor-move ${draggedTaskId === task.id ? 'opacity-40' : ''}`}
                 >
                    <div className="text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500">
                       <GripVertical size={16} />
                    </div>

                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${task.completed ? 'bg-sage-500 border-sage-500' : 'bg-white border-gray-300 hover:border-sage-500'}`}
                    >
                      <Check size={12} className={`text-white transform transition-all duration-200 ${task.completed ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
                    </button>

                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-gray-800 truncate transition-all duration-300">{task.title}</span>
                          {badge && (
                            <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}>
                              <Flag size={8} fill="currentColor" /> {task.priority}
                            </span>
                          )}
                       </div>
                       
                       <div className="flex items-center gap-3 text-xs text-gray-400">
                          {task.dueDate && (
                             <span className={`flex items-center gap-1 ${overdue ? 'text-red-500 font-medium' : ''}`}>
                               {overdue ? <AlertCircle size={12} /> : <CalendarIcon size={12} />}
                               {task.dueDate.toLocaleDateString()}
                             </span>
                          )}
                          {task.tags.map(tag => (
                             <span key={tag} className="flex items-center gap-0.5 text-gray-500">
                                <Hash size={10} /> {tag}
                             </span>
                          ))}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <span className="flex items-center gap-1 bg-gray-100 px-1.5 rounded text-[10px]">
                               <CornerDownRight size={10} /> 
                               {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                            </span>
                          )}
                       </div>
                    </div>

                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                      <button 
                         onClick={() => setAddingSubtaskTo(task.id)}
                         className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-sage-600"
                         title="Add Subtask"
                      >
                         <CornerDownRight size={16} />
                      </button>
                      <button 
                         onClick={() => deleteTask(task.id)}
                         className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500"
                      >
                         <X size={16} />
                      </button>
                    </div>
                 </div>

                 {/* Subtasks Rendering */}
                 {((task.subtasks && task.subtasks.length > 0) || addingSubtaskTo === task.id) && (
                    <div className="pl-11 pr-2 py-1 space-y-1">
                        {task.subtasks?.map(subtask => (
                           <div key={subtask.id} className="flex items-center gap-2 group/sub p-1 rounded hover:bg-gray-50">
                              <button 
                                onClick={() => handleToggleSubtask(task.id, subtask.id)}
                                className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all ${subtask.completed ? 'bg-sage-400 border-sage-400' : 'bg-white border-gray-300'}`}
                              >
                                <Check size={10} className={`text-white ${subtask.completed ? 'opacity-100' : 'opacity-0'}`} />
                              </button>
                              <span className={`text-xs ${subtask.completed ? 'text-gray-400 line-through' : 'text-gray-600'}`}>{subtask.title}</span>
                           </div>
                        ))}
                        
                        {addingSubtaskTo === task.id && (
                           <div className="flex items-center gap-2 pl-1 animate-in slide-in-from-top-2 duration-200">
                              <CornerDownRight size={12} className="text-gray-400" />
                              <input 
                                autoFocus
                                type="text" 
                                className="flex-1 bg-transparent border-b border-gray-200 text-xs py-1 focus:outline-none focus:border-sage-400"
                                placeholder="Subtask name..."
                                value={subtaskInput}
                                onChange={(e) => setSubtaskInput(e.target.value)}
                                onKeyDown={(e) => {
                                   if (e.key === 'Enter') handleAddSubtask(task.id);
                                   if (e.key === 'Escape') setAddingSubtaskTo(null);
                                }}
                                onBlur={() => {
                                   // Optional: Cancel on blur if empty
                                   if(!subtaskInput) setAddingSubtaskTo(null);
                                }}
                              />
                           </div>
                        )}
                    </div>
                 )}
               </div>
             );
           })}

           {/* Completed Section */}
           {completedTasks.length > 0 && (
              <div className="pt-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Completed</h3>
                <div className="space-y-1 opacity-60">
                  {completedTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50/50">
                        <button 
                          onClick={() => toggleTask(task.id)}
                          className="w-5 h-5 rounded border border-sage-300 bg-sage-200 flex items-center justify-center"
                        >
                          <Check size={12} className="text-sage-600" />
                        </button>
                        <span className="text-sm text-gray-400 line-through decoration-gray-400">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default TaskView;