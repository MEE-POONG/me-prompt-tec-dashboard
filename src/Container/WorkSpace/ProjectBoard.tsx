import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import ModalsWorkflow from "@/components/ui/workspace/ModalsWorkflow";
import {
  MoreHorizontal,
  Plus,
  Calendar,
  UserCircle2,
  X,
  Trash2,
  MessageSquare,
  Paperclip,
  AlertCircle,
  PieChart,
  Users,
  Activity,
  Filter,
  Settings,
  Search,
  Edit2,
  Archive,
  Check,
  ArrowLeft,
} from "lucide-react";

// --- Types ---
interface Task {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  priority: "High" | "Medium" | "Low";
  members: string[];
  comments: number;
  attachments: number;
  date: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

interface ProjectBoardProps {
  projectId: string;
}

// --- Mock Data ---
const initialData: Column[] = [
  {
    id: "col-1",
    title: "To Do",
    color: "bg-gray-500",
    tasks: [
      {
        id: "t1",
        title: "Research competitors & Market Analysis",
        tag: "Research",
        tagColor: "bg-purple-50 text-purple-600",
        priority: "High",
        members: ["JD", "AL"],
        comments: 3,
        attachments: 2,
        date: "Nov 24",
      },
      {
        id: "t2",
        title: "Draft project proposal",
        tag: "Planning",
        tagColor: "bg-blue-50 text-blue-600",
        priority: "Medium",
        members: ["MK"],
        comments: 0,
        attachments: 0,
        date: "Nov 25",
      },
    ],
  },
  {
    id: "col-2",
    title: "In Progress",
    color: "bg-blue-500",
    tasks: [
      {
        id: "t3",
        title: "Design homepage wireframes",
        tag: "Design",
        tagColor: "bg-pink-50 text-pink-600",
        priority: "High",
        members: ["JD", "S", "M"],
        comments: 12,
        attachments: 4,
        date: "Nov 28",
      },
    ],
  },
  {
    id: "col-3",
    title: "Review",
    color: "bg-yellow-500",
    tasks: [],
  },
  {
    id: "col-4",
    title: "Done",
    color: "bg-green-500",
    tasks: [
      {
        id: "t5",
        title: "Setup project repo",
        tag: "DevOps",
        tagColor: "bg-gray-100 text-gray-600",
        priority: "Low",
        members: ["JD"],
        comments: 1,
        attachments: 1,
        date: "Nov 20",
      },
    ],
  },
];

const projectInfo = {
  name: "Website Redesign",
  description:
    "Redesigning the corporate website for better UX/UI and mobile responsiveness.",
  progress: 45,
  dueDate: "Dec 31, 2025",
  members: [
    {
      name: "Alex L.",
      role: "PM",
      avatar: "AL",
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "Sarah J.",
      role: "Design",
      avatar: "SJ",
      color: "bg-pink-100 text-pink-600",
    },
    {
      name: "Mike K.",
      role: "Dev",
      avatar: "MK",
      color: "bg-green-100 text-green-600",
    },
    {
      name: "John D.",
      role: "Dev",
      avatar: "JD",
      color: "bg-purple-100 text-purple-600",
    },
  ],
  activities: [
    { user: "Alex", action: "moved task", target: "Homepage", time: "10m ago" },
    {
      user: "Sarah",
      action: "uploaded",
      target: "Wireframes v2",
      time: "2h ago",
    },
    { user: "Mike", action: "commented", target: "API Docs", time: "4h ago" },
  ],
};

export default function ProjectBoard({ projectId }: ProjectBoardProps) {
  const router = useRouter(); // Use Next.js router for back button

  // --- State ---
  const [columns, setColumns] = useState<Column[]>(initialData);
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Menu States
  const [activeMenuColumnId, setActiveMenuColumnId] = useState<string | null>(
    null
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Editing State
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [tempColumnTitle, setTempColumnTitle] = useState("");

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // Refs
  const menuRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuColumnId(null);
      }
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Logic: Drag & Drop ---
  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const startColIndex = columns.findIndex((c) => c.id === source.droppableId);
    const endColIndex = columns.findIndex(
      (c) => c.id === destination.droppableId
    );
    const startCol = columns[startColIndex];
    const endCol = columns[endColIndex];

    if (source.droppableId === destination.droppableId) {
      const newTasks = Array.from(startCol.tasks);
      const [movedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, movedTask);
      const newColumns = [...columns];
      newColumns[startColIndex] = { ...startCol, tasks: newTasks };
      setColumns(newColumns);
      return;
    }

    const startTasks = Array.from(startCol.tasks);
    const [movedTask] = startTasks.splice(source.index, 1);
    const endTasks = Array.from(endCol.tasks);
    endTasks.splice(destination.index, 0, movedTask);
    const newColumns = [...columns];
    newColumns[startColIndex] = { ...startCol, tasks: startTasks };
    newColumns[endColIndex] = { ...endCol, tasks: endTasks };
    setColumns(newColumns);
  };

  // --- Handlers ---
  const handleRenameColumnStart = (col: Column) => {
    setEditingColumnId(col.id);
    setTempColumnTitle(col.title);
    setActiveMenuColumnId(null);
  };
  const handleRenameColumnSave = (colId: string) => {
    if (tempColumnTitle.trim())
      setColumns(
        columns.map((c) =>
          c.id === colId ? { ...c, title: tempColumnTitle } : c
        )
      );
    setEditingColumnId(null);
  };
  const handleDeleteColumn = (colId: string) => {
    if (confirm("Delete this list?"))
      setColumns(columns.filter((c) => c.id !== colId));
    setActiveMenuColumnId(null);
  };
  const handleClearColumn = (colId: string) => {
    if (confirm("Clear all tasks?"))
      setColumns(
        columns.map((c) => (c.id === colId ? { ...c, tasks: [] } : c))
      );
    setActiveMenuColumnId(null);
  };

  const handleAddTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: `new-${Date.now()}`,
      title: newTaskTitle,
      tag: "General",
      tagColor: "bg-gray-100 text-gray-600",
      priority: "Medium",
      members: ["ME"],
      comments: 0,
      attachments: 0,
      date: "Today",
    };
    setColumns(
      columns.map((col) =>
        col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
      )
    );
    setNewTaskTitle("");
    setIsAddingTask(null);
  };

  const handleDeleteTask = (columnId: string, taskId: string) => {
    if (confirm("Delete this task?")) {
      setColumns(
        columns.map((col) =>
          col.id === columnId
            ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
            : col
        )
      );
    }
  };

  const filterTasks = (tasks: Task[]) => {
    if (!searchQuery) return tasks;
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleOpenTaskModal = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {" "}
      {/* ใช้ h-full เพื่อให้เต็มพื้นที่ Container พ่อ */}
      {/* ส่วน Header เดิมที่ซ้ำซ้อน ถูกลบออกแล้ว */}
      {/* --- Filter Bar (Expandable) --- */}
      {/* หมายเหตุ: ปุ่มเปิด Filter หายไปพร้อมกับ Header ถ้าต้องการใช้ต้องย้ายปุ่มมาไว้ส่วนอื่น */}
      {isFilterOpen && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-4 animate-in slide-in-from-top-2 shrink-0 z-20">
          <div className="relative w-full max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Filter tasks by name or tag..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Clear
            </button>
          )}
        </div>
      )}
      {/* --- Main Content (Board + Sidebar) --- */}
      <div className="flex flex-col lg:flex-row gap-8 py-6 items-start flex-1 overflow-hidden bg-white">
        {/* === Left: Kanban Board === */}
        <div className="flex-1 w-full min-w-0 h-full">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full overflow-x-auto gap-6 px-6 items-start pb-4">
              {columns.map((col, index) => (
                <div
                  key={col.id}
                  className="min-w-[320px] w-[320px] flex flex-col bg-gray-50/50 rounded-2xl border border-gray-200/60 h-full max-h-full transition-colors shrink-0"
                >
                  {/* Column Header */}
                  <div className="p-4 flex justify-between items-center bg-transparent sticky top-0 z-10 group">
                    <div className="flex items-center gap-3 flex-1">
                      {editingColumnId === col.id ? (
                        <div className="flex items-center gap-1 w-full mr-1">
                          <input
                            autoFocus
                            className="w-full text-sm font-bold bg-white border-2 border-blue-400 rounded px-2 py-1 outline-none text-gray-900"
                            value={tempColumnTitle}
                            onChange={(e) => setTempColumnTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                handleRenameColumnSave(col.id);
                              if (e.key === "Escape") setEditingColumnId(null);
                            }}
                            onBlur={() => handleRenameColumnSave(col.id)}
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="font-bold text-gray-700 text-sm tracking-wide truncate">
                            {col.title}
                          </h3>
                          <span className="bg-white border border-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
                            {col.tasks.length}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-1 relative shrink-0">
                      <button
                        onClick={() => setIsAddingTask(col.id)}
                        className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-gray-700 transition-all"
                      >
                        <Plus size={18} />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenuColumnId(
                              activeMenuColumnId === col.id ? null : col.id
                            )
                          }
                          className={`p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all ${
                            activeMenuColumnId === col.id
                              ? "bg-white text-gray-800 shadow-sm"
                              : "text-gray-400 hover:text-gray-700"
                          }`}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {activeMenuColumnId === col.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 origin-top-right"
                          >
                            <button
                              onClick={() => handleRenameColumnStart(col)}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={16} /> Rename List
                            </button>
                            <button
                              onClick={() => handleClearColumn(col.id)}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                              <X size={16} /> Clear Tasks
                            </button>
                            <div className="border-t border-gray-50 my-1"></div>
                            <button
                              onClick={() => handleDeleteColumn(col.id)}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 size={16} /> Delete List
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`px-3 pb-3 flex-1 overflow-y-auto space-y-3 min-h-[150px] transition-colors rounded-b-2xl scrollbar-hide ${
                          snapshot.isDraggingOver
                            ? "bg-blue-50/30 ring-2 ring-inset ring-blue-100"
                            : ""
                        }`}
                      >
                        {filterTasks(col.tasks).map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => handleOpenTaskModal(task)}
                                style={{
                                  ...provided.draggableProps.style,
                                  zIndex: snapshot.isDragging ? 9999 : "auto",
                                  cursor: snapshot.isDragging
                                    ? "grabbing"
                                    : "grab",
                                }}
                                className={`bg-white p-4 rounded-xl border group relative transition-all duration-200 ${
                                  snapshot.isDragging
                                    ? "shadow-2xl ring-2 ring-blue-500 border-transparent opacity-100 rotate-2 scale-105"
                                    : "border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200"
                                }`}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTask(col.id, task.id);
                                  }}
                                  className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all z-20"
                                >
                                  <Trash2 size={14} />
                                </button>
                                <div className="flex items-center gap-2 mb-3">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${task.tagColor}`}
                                  >
                                    {task.tag}
                                  </span>
                                  {task.priority === "High" && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-red-50 text-red-600 rounded-md">
                                      <AlertCircle size={10} /> High
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-gray-800 font-semibold mb-4 text-sm leading-snug pr-6">
                                  {task.title}
                                </h4>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                  <div className="flex -space-x-2">
                                    {task.members.map((m, i) => (
                                      <div
                                        key={i}
                                        className="w-6 h-6 rounded-full bg-linear-to-br from-blue-100 to-indigo-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-blue-700 ring-1 ring-white"
                                      >
                                        {m}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {(task.comments > 0 ||
                                      task.attachments > 0) && (
                                      <div className="flex items-center gap-2 text-gray-400">
                                        {task.comments > 0 && (
                                          <div className="flex items-center gap-1 text-xs">
                                            <MessageSquare size={14} />
                                            <span>{task.comments}</span>
                                          </div>
                                        )}
                                        {task.attachments > 0 && (
                                          <div className="flex items-center gap-1 text-xs">
                                            <Paperclip size={14} />
                                            <span>{task.attachments}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1 text-gray-400 text-[10px] font-medium bg-gray-50 px-2 py-1 rounded-md">
                                      <Calendar size={12} />
                                      <span>{task.date}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {isAddingTask === col.id ? (
                          <div className="bg-white p-3 rounded-xl shadow-lg border border-blue-200 animate-in fade-in zoom-in-95 duration-200 ring-4 ring-blue-50/50">
                            <textarea
                              autoFocus
                              placeholder="Type task name..."
                              className="w-full text-sm resize-none outline-none text-gray-700 placeholder:text-gray-400 mb-2 font-medium bg-transparent"
                              rows={2}
                              value={newTaskTitle}
                              onChange={(e) => setNewTaskTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddTask(col.id);
                                }
                              }}
                            />
                            <div className="flex items-center justify-between gap-2 mt-2">
                              <button
                                onClick={() => handleAddTask(col.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm shadow-blue-200 transition-all active:scale-95"
                              >
                                Add Card
                              </button>
                              <button
                                onClick={() => setIsAddingTask(null)}
                                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsAddingTask(col.id)}
                            className="w-full py-2.5 flex items-center justify-start px-4 gap-2 text-gray-500 hover:text-gray-800 hover:bg-white rounded-xl transition-all text-sm font-semibold group"
                          >
                            <Plus
                              size={18}
                              className="text-gray-400 group-hover:text-blue-500"
                            />
                            Add Task
                          </button>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
              <div className="min-w-[320px] h-[60px] shrink-0">
                <button className="w-full h-full flex items-center justify-center gap-2 bg-gray-50/50 hover:bg-gray-100 text-gray-500 font-bold rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all">
                  <Plus size={20} /> Add New List
                </button>
              </div>
            </div>
          </DragDropContext>
        </div>

        {/* === Right: Sidebar Widgets === */}
        <div className="w-full lg:w-80 space-y-6 shrink-0 h-full overflow-y-auto pr-6 pb-10 custom-scrollbar">
          {/* Widget 1: Project Overview */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <PieChart size={18} className="text-blue-500" /> Project Details
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              {projectInfo.description}
            </p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{projectInfo.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${projectInfo.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span className="text-xs font-semibold">Due Date</span>
                </div>
                <span className="text-xs font-bold text-gray-800">
                  {projectInfo.dueDate}
                </span>
              </div>
            </div>
          </div>

          {/* Widget 2: Team Members */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Users size={18} className="text-purple-500" /> Team
              </h3>
              <button className="text-xs text-blue-600 font-medium hover:underline">
                Manage
              </button>
            </div>
            <div className="space-y-3">
              {projectInfo.members.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${member.color}`}
                  >
                    {member.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-800">
                      {member.name}
                    </h4>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </div>
              ))}
              <button className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                + Invite Member
              </button>
            </div>
          </div>

          {/* Widget 3: Project Activity */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-orange-500" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {projectInfo.activities.map((act, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 text-sm relative pl-4 border-l-2 border-gray-100"
                >
                  <div>
                    <p className="text-gray-800 text-xs">
                      <span className="font-bold">{act.user}</span> {act.action}{" "}
                      <span className="font-medium text-blue-600">
                        {act.target}
                      </span>
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {act.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Modal */}
      {selectedTask && (
        <ModalsWorkflow
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={{
            id: selectedTask.id,
            title: selectedTask.title,
            tag: selectedTask.tag,
            description: `งาน ${selectedTask.title} มีสมาชิก ${selectedTask.members} คน`,
            startDate: new Date(),
            endDate: new Date(),
          }}
        />
      )}
    </div>
  );
}
