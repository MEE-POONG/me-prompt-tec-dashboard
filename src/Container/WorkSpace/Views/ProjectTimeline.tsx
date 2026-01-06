import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  ChevronDown,
  Search,
  Tag,
  Calendar,
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
  onCreateTask,
}: {
  tasks?: any[];
  labels?: any[];
  onCreateTask?: (payload: {
    title: string;
    startDate: string;
    duration: number;
    status: string;
  }) => Promise<any>;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("Month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    // Map tasks to timeline events
    const mapped = tasks
      .filter((t) => t.date && t.date !== "No date")
      .map((t) => {
        const start = t.rawDueDate ? new Date(t.rawDueDate) : new Date();
        const end = new Date(start);
        end.setDate(start.getDate() + 2); // default duration

        const label = labels.find((l) => l.name === t.tag);
        const color = label ? label.bgColor : "bg-blue-500";

        return {
          id: t.id,
          title: t.title,
          startDate: start,
          endDate: end,
          color: color.startsWith("bg-") ? color : `bg-${color}-500`,
          status: t.status || "To Do",
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
  const todayStr = new Date().toISOString().slice(0, 10);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState(todayStr);
  const [newEventStatus, setNewEventStatus] = useState("To Do");
  const [newEventDuration, setNewEventDuration] = useState(3);

  const filterButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setIsFilterPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Logic ---
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const daysToShow =
    viewMode === "Month"
      ? new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        ).getDate()
      : 7;

  const startDate =
    viewMode === "Month"
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
      status: newEventStatus,
    };

    setEvents((prev) => [...prev, newEvt]);
    setIsCreateModalOpen(false);
    setNewEventTitle("");

    if (onCreateTask) {
      try {
        const created = await onCreateTask({
          title: newEventTitle,
          startDate: newEventDate,
          duration: newEventDuration,
          status: newEventStatus,
        });
        if (created && created.id) {
          setEvents((prev) =>
            prev.map((e) => (e.id === tempId ? { ...e, id: created.id } : e))
          );
        }
      } catch (err) {
        setEvents((prev) => prev.filter((e) => e.id !== tempId));
        alert("Failed to create task");
      }
    }
  };

  return (
    // ✅ เปลี่ยนพื้นหลังเป็น bg-slate-50 เพื่อลดความจ้าและเพิ่มมิติ
    <div className="flex flex-col h-full bg-slate-50 relative font-sans text-slate-800">
      
      {/* --- Toolbar --- */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-white shadow-sm z-20 shrink-0">
        {/* Left: Navigation */}
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("Month")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm ${
                viewMode === "Month"
                  ? "bg-white text-slate-800 shadow-slate-200"
                  : "bg-transparent text-slate-500 hover:text-slate-700 shadow-none"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("Week")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm ${
                viewMode === "Week"
                  ? "bg-white text-slate-800 shadow-slate-200"
                  : "bg-transparent text-slate-500 hover:text-slate-700 shadow-none"
              }`}
            >
              Week
            </button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-2"></div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={handlePrev}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <span className="font-bold text-xl text-slate-800 ml-2 min-w-[150px] tracking-tight">
              {currentDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Right: Tools */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div
            className={`flex items-center transition-all duration-300 border border-slate-200 rounded-xl overflow-hidden shadow-sm ${
              isSearchActive
                ? "w-64 bg-white ring-2 ring-blue-100 border-blue-200"
                : "w-10 bg-white hover:bg-slate-50"
            }`}
          >
            <button
              onClick={() => setIsSearchActive(!isSearchActive)}
              className="p-2.5 text-slate-500 shrink-0 hover:text-blue-600 transition-colors"
            >
              <Search size={18} />
            </button>
            {isSearchActive && (
              <input
                autoFocus
                placeholder="Search tasks..."
                className="w-full py-2 pr-4 text-sm outline-none text-slate-800 placeholder:text-slate-400 font-medium"
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
              className={`p-2.5 rounded-xl border transition-all shadow-sm ${
                isFilterPopoverOpen
                  ? "bg-blue-50 border-blue-200 text-blue-600 shadow-inner"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <Tag size={18} />
            </button>

            {isFilterPopoverOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-800">Quick Filters</h4>
                  <button
                    onClick={() => setIsFilterPopoverOpen(false)}
                    className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1 rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">
                    Labels
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {labels.map((l) => (
                      <label
                        key={l.id}
                        className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-0 w-4 h-4"
                        />
                        <div
                          className={`w-3 h-3 rounded-full ${l.bgColor}`}
                        ></div>
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">
                          {l.name}
                        </span>
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
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2 active:scale-95 ml-2 hover:-translate-y-0.5"
          >
            <Plus size={20} /> Create task
          </button>
        </div>
      </div>

      {/* --- Timeline Grid --- */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-slate-50 relative">
        <div className="min-w-full h-full flex flex-col">
          {/* Grid Header */}
          <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10 shadow-sm">
            {daysArray.map((date, i) => {
              const isToday =
                date.toDateString() === new Date().toDateString();
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <div
                  key={i}
                  className={`flex-1 ${
                    viewMode === "Week" ? "min-w-[150px]" : "min-w-[60px]"
                  } border-r border-slate-100 py-4 text-center group transition-colors ${
                    isToday ? "bg-blue-50/50" : isWeekend ? "bg-slate-50/50" : ""
                  }`}
                >
                  <div
                    className={`text-[10px] font-bold uppercase mb-1.5 tracking-wider ${
                      isToday ? "text-blue-600" : "text-slate-400"
                    }`}
                  >
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div
                    className={`text-base font-bold w-9 h-9 flex items-center justify-center mx-auto rounded-full transition-all ${
                      isToday
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-110"
                        : "text-slate-700 group-hover:bg-slate-100"
                    }`}
                  >
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid Body */}
          <div className="flex-1 relative min-h-[500px]">
            {/* Background Lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {daysArray.map((date, i) => {
                const isToday =
                  date.toDateString() === new Date().toDateString();
                const isWeekend =
                  date.getDay() === 0 || date.getDay() === 6;
                return (
                  <div
                    key={i}
                    className={`flex-1 ${
                      viewMode === "Week" ? "min-w-[150px]" : "min-w-[60px]"
                    } border-r border-slate-200/60 h-full ${
                      isToday
                        ? "bg-blue-50/30" // ✅ Highlight คอลัมน์วันนี้
                        : isWeekend
                        ? "bg-slate-100/40"
                        : ""
                    }`}
                  ></div>
                );
              })}
            </div>

            {/* Task Bars */}
            <div className="relative pt-8 space-y-4 px-0">
              {events.map((evt) => {
                if (
                  searchQuery &&
                  !evt.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                  return null;

                const dayDiff =
                  (evt.startDate.getTime() - startDate.getTime()) /
                  (1000 * 3600 * 24);
                const duration =
                  (evt.endDate.getTime() - evt.startDate.getTime()) /
                  (1000 * 3600 * 24);

                if (dayDiff + duration < 0 || dayDiff > daysToShow)
                  return null;

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
                    className={`h-9 rounded-lg flex items-center px-3 text-xs font-bold text-white shadow-md cursor-pointer hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 transition-all absolute whitespace-nowrap overflow-hidden z-10 border border-white/20 ${evt.color}`}
                    style={{
                      left: `${displayLeft}%`,
                      width: `${displayWidth}%`,
                      top: "auto",
                      position: "relative",
                      marginLeft: isStartVisible ? "2px" : "0", // Add spacing
                      marginRight: "2px",
                    }}
                    title={`${evt.title} (${evt.status})`}
                  >
                    {evt.title}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* --- Create Task Modal --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden border border-slate-100 p-0 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" />
                New Timeline Event
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-200 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">
                  Task Name
                </label>
                <input
                  autoFocus
                  placeholder="What needs to be done?"
                  className="w-full text-lg font-semibold text-slate-800 border-b-2 border-slate-200 pb-2 focus:border-blue-500 focus:outline-none placeholder:text-slate-300 bg-transparent transition-colors"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
                    value={newEventDuration}
                    onChange={(e) => setNewEventDuration(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">
                  Status
                </label>
                <div className="relative">
                  <select
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white shadow-sm cursor-pointer"
                    value={newEventStatus}
                    onChange={(e) => setNewEventStatus(e.target.value)}
                  >
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Done</option>
                    <option>Research</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
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