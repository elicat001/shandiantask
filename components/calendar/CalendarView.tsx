import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Settings, Download, X, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarEvent } from '../../types';

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Weekly Sync', date: new Date(new Date().setDate(new Date().getDate() + 2)), type: 'task' },
    { id: '2', title: 'Project Deadline', date: new Date(new Date().setDate(new Date().getDate() + 10)), type: 'holiday' },
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<{ title: string; date: string; type: 'task' | 'holiday' }>({
    title: '',
    date: '',
    type: 'task'
  });
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month); // 0 = Sunday

  const handleDayClick = (date: Date) => {
    // Format date for input type="date" (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    setNewEvent({
        title: '',
        date: `${year}-${month}-${day}`,
        type: 'task'
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newEvent.title || !newEvent.date) return;

      const eventDate = new Date(newEvent.date);
      // Adjust for time zone offset to keep the selected day accurate
      const adjustedDate = new Date(eventDate.valueOf() + eventDate.getTimezoneOffset() * 60 * 1000);

      const createdEvent: CalendarEvent = {
          id: Date.now().toString(),
          title: newEvent.title,
          date: adjustedDate,
          type: newEvent.type
      };

      setEvents([...events, createdEvent]);
      setIsModalOpen(false);
  };

  const isSameDay = (d1: Date, d2: Date) => {
      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate();
  };

  const renderCalendarDays = () => {
    const calendarDays = [];
    const prevMonthDays = daysInMonth(year, month - 1);
    
    // Previous month filler
    for (let i = 0; i < startDay; i++) {
        const dayNum = prevMonthDays - startDay + 1 + i;
        calendarDays.push(
            <div key={`prev-${i}`} className="border-r border-b border-gray-100 p-2 text-gray-300 bg-gray-50/30 min-h-[100px] cursor-default">
                <span className="text-sm">{dayNum}</span>
            </div>
        );
    }

    // Current month days
    for (let i = 1; i <= days; i++) {
        const cellDate = new Date(year, month, i);
        const isToday = isSameDay(cellDate, new Date());
        
        // Filter events for this day
        const dayEvents = events.filter(evt => isSameDay(evt.date, cellDate));

        calendarDays.push(
            <div 
                key={`curr-${i}`} 
                onClick={() => handleDayClick(cellDate)}
                className={`border-r border-b border-gray-100 p-2 min-h-[100px] relative group hover:bg-sage-50/30 transition-colors cursor-pointer ${isToday ? 'bg-sage-50/50' : ''}`}
            >
                <span className={`text-sm w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-sage-500 text-white font-bold shadow-sm' : 'text-gray-700'}`}>
                    {i}
                </span>
                
                <div className="flex flex-col gap-1 mt-1">
                    {dayEvents.map(evt => (
                        <div 
                            key={evt.id} 
                            className={`text-xs px-1.5 py-0.5 rounded truncate border-l-2 shadow-sm ${
                                evt.type === 'holiday' 
                                ? 'bg-red-50 text-red-700 border-red-400' 
                                : 'bg-blue-50 text-blue-700 border-blue-400'
                            }`}
                            title={evt.title}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent opening create modal when clicking event
                                // In a real app, open edit modal
                            }}
                        >
                            {evt.title}
                        </div>
                    ))}
                </div>

                {/* Hover Add Indicator */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-6 h-6 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center">
                        <span className="text-lg leading-none mb-0.5">+</span>
                    </div>
                </div>
            </div>
        );
    }
    
    // Next month filler
    const totalCells = calendarDays.length;
    const remaining = 42 - totalCells; // Standard 6 rows
    for (let i = 1; i <= remaining; i++) {
         calendarDays.push(
            <div key={`next-${i}`} className="border-r border-b border-gray-100 p-2 text-gray-300 bg-gray-50/30 min-h-[100px] cursor-default">
                <span className="text-sm">{i}</span>
            </div>
        );
    }

    return calendarDays;
  };

  return (
    <div className="flex flex-col h-full bg-white w-full relative">
        {/* Header */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-semibold text-sage-700">
                    {year}-{String(month + 1).padStart(2, '0')}
                 </h2>
                 <div className="flex bg-gray-100 rounded p-0.5">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-white rounded shadow-sm text-gray-600"><ChevronLeft size={16}/></button>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-white rounded shadow-sm text-gray-600"><ChevronRight size={16}/></button>
                 </div>
                 <button 
                    onClick={() => setCurrentDate(new Date())} 
                    className="px-3 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
                >
                    Today
                </button>
            </div>

            <div className="flex items-center gap-3">
                 <div className="flex bg-gray-100 rounded-lg p-1 text-sm">
                    {['Day', '3 Day', 'Week', 'Month'].map(v => (
                        <button key={v} className={`px-3 py-1 rounded-md transition-all ${v === 'Month' ? 'bg-white shadow text-sage-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
                            {v}
                        </button>
                    ))}
                 </div>
                 <button className="text-gray-500 hover:bg-gray-100 p-2 rounded"><Settings size={20}/></button>
                 <button className="text-gray-500 hover:bg-gray-100 p-2 rounded"><Download size={20}/></button>
            </div>
        </div>

        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {day}
                </div>
            ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto">
             <div className="grid grid-cols-7 auto-rows-fr min-h-full">
                {renderCalendarDays()}
            </div>
        </div>

        {/* Add Event Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-800">Add Event</h3>
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSaveEvent} className="p-6 flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Event Title</label>
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="What needs to be done?"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Date</label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                        className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all text-gray-700"
                                    />
                                    <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Type</label>
                                <div className="relative">
                                    <select
                                        value={newEvent.type}
                                        onChange={(e) => setNewEvent({...newEvent, type: e.target.value as 'task' | 'holiday'})}
                                        className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all text-gray-700 appearance-none"
                                    >
                                        <option value="task">Task</option>
                                        <option value="holiday">Holiday</option>
                                    </select>
                                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-4">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={!newEvent.title || !newEvent.date}
                                className="px-6 py-2 bg-sage-500 hover:bg-sage-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-sage-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                            >
                                Save Event
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default CalendarView;