import React, { useState, useRef, useEffect } from "react";
import {
    ChevronLeft, ChevronRight, Calendar, Plus, X,
    ChevronDown, Search, Tag
} from "lucide-react";

// --- Types ---
type ViewMode = "Month" | "Week";

interface TimelineEvent {
    id: string | number;
    title: string;
    startDate: Date;
    endDate: Date;
    color: string;
    status: string;
}

export default function ProjectTimeline({
    tasks = [],
    labels = [],
    onCreateTask
}: {
    tasks?: any[],
    labels?: any[],
    onCreateTask?: (payload: { title: string; startDate: string; duration: number; status: string }) => Promise<any>
}) {
    const [viewMode, setViewMode] = useState<ViewMode>("Month");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<TimelineEvent[]>([]);

    useEffect(() => {
        // Map tasks to timeline events
        const mapped = tasks.filter(t => t.date && t.date !== "No date").map(t => {
            // Assuming t.date is string like "Dec 20" or from actual task.dueDate
            // Better if we had the raw task objects or normalized dates
            const start = t.rawDueDate ? new Date(t.rawDueDate) : new Date();
            const end = new Date(start);
            end.setDate(start.getDate() + 2); // default duration if not specified

            // Use label color
            const label = labels.find(l => l.name === t.tag);
            const color = label ? label.bgColor : "bg-blue-500";

            return {
                id: t.id,
                title: t.title,
                startDate: start,
                endDate: end,
                color: color.startsWith("bg-") ? color : `bg-${color}-500`,
                status: t.status || "To Do"
            };
        });
        setEvents(mapped);
    }, [tasks, labels]);

    // States
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // New Event Form
    const today = new Date().toISOString().slice(0, 10);
    const [newEventTitle, setNewEventTitle] = useState("");
    const [newEventDate, setNewEventDate] = useState(today);
    const [newEventStatus, setNewEventStatus] = useState("To Do");
    const [newEventDuration, setNewEventDuration] = useState(3);

    const filterButtonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterButtonRef.current && !filterButtonRef.current.contains(event.target as Node)) {
                setIsFilterPopoverOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- Logic ---
    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const daysToShow = viewMode === "Month"
        ? new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
        : 7;

    const startDate = viewMode === "Month"
        ? new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        : getStartOfWeek(currentDate);

    const daysArray = Array.from({ length: daysToShow }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        return d;
    });

    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (viewMode === "Month") newDate.setMonth(newDate.getMonth() - 1);
        else newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === "Month") newDate.setMonth(newDate.getMonth() + 1);
        else newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const handleAddEvent = async () => {
        if (!newEventTitle.trim()) return;
        const start = new Date(newEventDate);
        const end = new Date(start);
        end.setDate(start.getDate() + newEventDuration);

        let color = "bg-slate-500";
        if (newEventStatus === "In Progress") color = "bg-blue-500";
        if (newEventStatus === "Done") color = "bg-green-500";
        if (newEventStatus === "Research") color = "bg-purple-500";

        const tempId = `temp-${Date.now()}`;
        const newEvt: TimelineEvent = {
            id: tempId,
            title: newEventTitle,
            startDate: start,
            endDate: end,
            color,
            status: newEventStatus
        };

        // optimistic add
        setEvents(prev => [...prev, newEvt]);
        setIsCreateModalOpen(false);
        setNewEventTitle("");

        if (onCreateTask) {
            try {
                const created = await onCreateTask({
                    title: newEventTitle,
                    startDate: newEventDate,
                    duration: newEventDuration,
                    status: newEventStatus
                });
                // replace temp id if backend supplied id
                if (created && created.id) {
                    setEvents(prev => prev.map(e => (e.id === tempId ? { ...e, id: created.id } : e)));
                }
            } catch (err) {
                // rollback optimistic event
                setEvents(prev => prev.filter(e => e.id !== tempId));
                alert("Failed to create task");
            }
        }
    }; 

    return (
        <div className="flex flex-col h-full bg-white relative font-sans text-slate-800">

            {/* --- Toolbar --- */}
            <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-white z-20">

                {/* Left: Navigation */}
                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <button
                            onClick={() => setViewMode("Month")}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === "Month" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setViewMode("Week")}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === "Week" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Week
                        </button>
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-1"></div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Today</button>
                        <div className="flex items-center">
                            <button onClick={handlePrev} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><ChevronLeft size={20} /></button>
                            <button onClick={handleNext} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><ChevronRight size={20} /></button>
                        </div>
                        <span className="font-bold text-lg text-gray-800 ml-2 min-w-[140px]">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Right: Tools */}
                <div className="flex items-center gap-3">

                    {/* Search */}
                    <div className={`flex items-center transition-all duration-300 border border-gray-200 rounded-lg overflow-hidden ${isSearchActive ? 'w-64 bg-white ring-2 ring-blue-100' : 'w-10 bg-white hover:bg-gray-50'}`}>
                        <button onClick={() => setIsSearchActive(!isSearchActive)} className="p-2 text-gray-500 shrink-0">
                            <Search size={18} />
                        </button>
                        {isSearchActive && (
                            <input
                                autoFocus
                                placeholder="Search tasks..."
                                // ✅ ปรับสี text เป็น slate-900 (เข้ม)
                                className="w-full py-1.5 pr-3 text-sm outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onBlur={() => !searchQuery && setIsSearchActive(false)}
                            />
                        )}
                    </div>

                    {/* Filter / Tags Popover */}
                    <div className="relative" ref={filterButtonRef}>
                        <button
                            onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
                            className={`p-2 rounded-lg border transition-all ${isFilterPopoverOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Tag size={18} />
                        </button>

                        {isFilterPopoverOpen && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 animate-in fade-in zoom-in-95">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-800">Quick Filters</h4>
                                    <button onClick={() => setIsFilterPopoverOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                                </div>

                                <div className="mb-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Labels</p>
                                    <div className="space-y-2">
                                        {labels.map(l => (
                                            <label key={l.id} className="flex items-center gap-3 cursor-pointer group">
                                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0" />
                                                <div className={`w-4 h-4 rounded ${l.bgColor}`}></div>
                                                <span className="text-sm text-gray-600 group-hover:text-gray-900">{l.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Create Task Button */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-md shadow-blue-200 transition-all flex items-center gap-2 active:scale-95 ml-2"
                    >
                        <Plus size={18} /> Create task
                    </button>
                </div>
            </div>

            {/* --- Timeline Grid --- */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-white relative">
                <div className="min-w-full h-full flex flex-col">
                    <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10">
                        {daysArray.map((date, i) => {
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                            return (
                                <div key={i} className={`flex-1 ${viewMode === 'Week' ? 'min-w-[150px]' : 'min-w-[60px]'} border-r border-gray-100 py-3 text-center ${isWeekend ? 'bg-slate-50/50' : ''}`}>
                                    <div className={`text-xs font-bold uppercase mb-1 ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </div>
                                    <div className={`text-sm font-bold w-8 h-8 flex items-center justify-center mx-auto rounded-full transition-all ${isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-700'}`}>
                                        {date.getDate()}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex-1 relative min-h-[500px]">
                        <div className="absolute inset-0 flex pointer-events-none">
                            {daysArray.map((date, i) => {
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                return (
                                    <div key={i} className={`flex-1 ${viewMode === 'Week' ? 'min-w-[150px]' : 'min-w-[60px]'} border-r border-gray-100 h-full ${isWeekend ? 'bg-slate-50/30' : ''}`}></div>
                                )
                            })}
                        </div>

                        <div className="relative pt-6 space-y-3 px-0">
                            {events.map((evt) => {
                                if (searchQuery && !evt.title.toLowerCase().includes(searchQuery.toLowerCase())) return null;

                                const dayDiff = (evt.startDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
                                const duration = (evt.endDate.getTime() - evt.startDate.getTime()) / (1000 * 3600 * 24);

                                if (dayDiff + duration < 0 || dayDiff > daysToShow) return null;

                                const leftPercent = (dayDiff / daysToShow) * 100;
                                const widthPercent = (duration / daysToShow) * 100;

                                const isStartVisible = dayDiff >= 0;
                                const displayLeft = isStartVisible ? leftPercent : 0;
                                const displayWidth = isStartVisible
                                    ? Math.min(widthPercent, 100 - leftPercent)
                                    : Math.min(widthPercent + leftPercent, 100);

                                if (displayWidth <= 0) return null;

                                return (
                                    <div
                                        key={evt.id}
                                        className={`h-8 rounded flex items-center px-3 text-xs font-bold text-white shadow-sm cursor-pointer hover:brightness-110 transition-all absolute whitespace-nowrap overflow-hidden ${evt.color}`}
                                        style={{
                                            left: `${displayLeft}%`,
                                            width: `${displayWidth}%`,
                                            top: 'auto',
                                            position: 'relative',
                                            marginLeft: isStartVisible ? 0 : 0
                                        }}
                                    >
                                        {evt.title}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Create Task Modal --- */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center backdrop-blur-[1px] animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-[400px] overflow-hidden border border-gray-100 p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800 text-lg">New Event</h3>
                            <button onClick={() => setIsCreateModalOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Task Name</label>
                                <input
                                    autoFocus
                                    placeholder="Enter task name..."
                                    // ✅ ปรับสี text เป็น slate-900 (เข้ม)
                                    className="w-full text-lg font-semibold text-slate-900 border-none p-0 focus:ring-0 placeholder:text-gray-300"
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Start Date</label>
                                    <input
                                        type="date"
                                        // ✅ ปรับสี text เป็น slate-900
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                        value={newEventDate}
                                        onChange={(e) => setNewEventDate(e.target.value)}
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Days</label>
                                    <input
                                        type="number" min="1"
                                        // ✅ ปรับสี text เป็น slate-900
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                        value={newEventDuration}
                                        onChange={(e) => setNewEventDuration(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Status</label>
                                <div className="relative">
                                    <select
                                        // ✅ ปรับสี text เป็น slate-900
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-900 appearance-none focus:outline-none focus:border-blue-500 bg-white"
                                        value={newEventStatus}
                                        onChange={(e) => setNewEventStatus(e.target.value)}
                                    >
                                        <option>To Do</option>
                                        <option>In Progress</option>
                                        <option>Done</option>
                                        <option>Research</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 mt-2">
                            <button
                                onClick={handleAddEvent}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95"
                            >
                                Create Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}