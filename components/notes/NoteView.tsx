import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Undo, Redo, Bold, Italic, List, Image as ImageIcon, Sparkles, FileText } from 'lucide-react';
import { Note } from '../../types';
import { summarizeNoteWithAI } from '../../services/geminiService';
import { useSupabaseStore } from '../../store/useSupabaseStore';
import { useAuth } from '../../src/contexts/AuthContext';

const NoteView: React.FC = () => {
  const { user } = useAuth();
  const notes = useSupabaseStore((state) => state.notes);
  const activeNoteId = useSupabaseStore((state) => state.activeNoteId);
  const setActiveNote = useSupabaseStore((state) => state.setActiveNote);
  const fetchNotes = useSupabaseStore((state) => state.fetchNotes);
  const addNote = useSupabaseStore((state) => state.addNote);
  const updateNote = useSupabaseStore((state) => state.updateNote);
  const deleteNote = useSupabaseStore((state) => state.deleteNote);
  const initializeUserData = useSupabaseStore((state) => state.initializeUserData);

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 初始化用户数据和加载笔记
  useEffect(() => {
    if (user?.id) {
      initializeUserData(user.id);
      fetchNotes();
    }
  }, [user?.id, initializeUserData, fetchNotes]);

  // 设置初始活动笔记
  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      setActiveNote(notes[0].id);
    }
  }, [notes, activeNoteId, setActiveNote]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const handleUpdateNote = async (field: keyof Note, value: string) => {
    if (!activeNoteId) return;
    await updateNote(activeNoteId, { [field]: value, updatedAt: new Date() });
  };

  const handleAISummary = async () => {
    if (!activeNote || !activeNoteId) return;
    setIsSummarizing(true);
    const summary = await summarizeNoteWithAI(activeNote.content);
    await updateNote(activeNoteId, { summary });
    setIsSummarizing(false);
  };

  const handleAddNote = async () => {
    const newNote: Partial<Note> = {
      title: 'New Note',
      content: '',
      updatedAt: new Date()
    };
    await addNote(newNote);
    // 新笔记将自动通过 Supabase 订阅更新到 notes 数组
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId);
    // 如果删除的是当前活动笔记，选择另一个
    if (noteId === activeNoteId && notes.length > 1) {
      const remainingNotes = notes.filter(n => n.id !== noteId);
      if (remainingNotes.length > 0) {
        setActiveNote(remainingNotes[0].id);
      }
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full w-full bg-white">
      {/* Note List */}
      <div className="w-72 bg-gray-50 border-r border-gray-200 flex flex-col h-full flex-shrink-0">
         <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
             <span className="font-semibold text-gray-700">All Notes ({notes.length})</span>
             <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
                 <MoreHorizontal size={18} />
             </button>
         </div>
         <div className="p-3">
             <div className="relative">
                <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search notes" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sage-400" 
                />
             </div>
         </div>
         <button onClick={handleAddNote} className="mx-3 mb-3 flex items-center justify-center gap-2 py-2 bg-white border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-sage-400 hover:text-sage-600 transition-all text-sm">
             <Plus size={16} /> New Note
         </button>
         
         <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
             {filteredNotes.length === 0 && searchQuery && (
                 <div className="text-center text-gray-400 text-sm py-8">
                     No notes found for "{searchQuery}"
                 </div>
             )}
             {filteredNotes.map(note => (
                 <div
                    key={note.id}
                    onClick={() => setActiveNote(note.id)}
                    className={`p-3 rounded-lg cursor-pointer border transition-all ${activeNoteId === note.id ? 'bg-white border-sage-300 shadow-sm' : 'bg-transparent border-transparent hover:bg-gray-100'}`}
                >
                     <h3 className={`text-sm font-medium mb-1 truncate ${activeNoteId === note.id ? 'text-sage-700' : 'text-gray-700'}`}>{note.title}</h3>
                     <p className="text-xs text-gray-500 line-clamp-2">{note.content || 'No content'}</p>
                     <span className="text-[10px] text-gray-400 mt-2 block">
                        {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : ''}
                     </span>
                 </div>
             ))}
         </div>
      </div>

      {/* Editor Area */}
      {activeNote ? (
        <div className="flex-1 flex flex-col h-full">
            <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 md:px-6 bg-white flex-shrink-0">
                <input 
                    type="text" 
                    value={activeNote.title}
                    onChange={(e) => handleUpdateNote('title', e.target.value)}
                    className="text-xl font-bold text-gray-800 bg-transparent focus:outline-none placeholder-gray-300 w-full"
                    placeholder="Enter title..."
                />
                <div className="flex items-center gap-2 text-gray-500">
                    <button className="p-2 hover:bg-gray-100 rounded"><Undo size={18}/></button>
                    <button className="p-2 hover:bg-gray-100 rounded"><Redo size={18}/></button>
                    <div className="w-px h-6 bg-gray-200 mx-1" />
                    <button className="p-2 hover:bg-gray-100 rounded"><Bold size={18}/></button>
                    <button className="p-2 hover:bg-gray-100 rounded"><Italic size={18}/></button>
                    <button className="p-2 hover:bg-gray-100 rounded"><List size={18}/></button>
                    <button className="p-2 hover:bg-gray-100 rounded"><ImageIcon size={18}/></button>
                    <div className="w-px h-6 bg-gray-200 mx-1" />
                    <button 
                        onClick={handleAISummary}
                        disabled={isSummarizing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-sage-50 text-sage-600 rounded-full hover:bg-sage-100 transition-colors text-sm font-medium"
                    >
                         {isSummarizing ? <div className="w-4 h-4 border-2 border-sage-500 border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={16} />}
                         AI Summary
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
                {activeNote.summary && (
                    <div className="mb-6 bg-sage-50 p-4 rounded-lg border border-sage-100">
                        <div className="flex items-center gap-2 text-sage-700 mb-2">
                            <Sparkles size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">AI Summary</span>
                        </div>
                        <p className="text-sage-800 text-sm leading-relaxed">{activeNote.summary}</p>
                    </div>
                )}
                <textarea
                    value={activeNote.content}
                    onChange={(e) => handleUpdateNote('content', e.target.value)}
                    className="w-full h-full resize-none focus:outline-none text-gray-700 leading-relaxed text-lg"
                    placeholder="Start typing..."
                />
            </div>
            <div className="h-8 border-t border-gray-100 flex items-center justify-end px-4 text-xs text-gray-400 bg-gray-50">
                Word count: {activeNote.content.length}
            </div>
        </div>
      ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText size={40} className="text-gray-300"/>
              </div>
              <p>Select a note or create a new one</p>
          </div>
      )}
    </div>
  );
};

export default NoteView;