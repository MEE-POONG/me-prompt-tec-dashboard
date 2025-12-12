"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Folder,
  MoreVertical,
  Users,
  Trash2,
  Star,
  CheckCircle2,
  Calendar as CalendarIcon,
  MessageSquare,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";

// --- Types ---
interface Project {
  id: string;
  name: string;
  description: string;
  members: number;
  updated: string;
  createdAt: string; // Format: YYYY-MM-DD
  color: string;
  status: string;
  isImportant: boolean;
  progress: number;
  owner?: string;
}

interface Task {
  id: number;
  title: string;
  project: string;
  due: string;
  isDone: boolean;
  color: string;
}

interface Comment {
  id: number;
  user: string;
  avatar: string;
  text: string;
  project: string;
  time: string;
}

// --- Mock Data ---
const myProjectsData: Project[] = [
  {
    id: "PROJ-001",
    name: "Website Redesign",
    description: "Redesigning the corporate website for better UX/UI.",
    members: 5,
    updated: "2h ago",
    createdAt: "2025-11-10",
    color: "bg-blue-100 text-blue-600",
    status: "In Progress",
    isImportant: false,
    progress: 45,
  },
  {
    id: "PROJ-002",
    name: "Mobile App Development",
    description: "Developing the new customer-facing mobile application.",
    members: 8,
    updated: "1d ago",
    createdAt: "2025-11-15",
    color: "bg-purple-100 text-purple-600",
    status: "Planning",
    isImportant: true,
    progress: 10,
  },
  {
    id: "PROJ-004",
    name: "Internal HR System",
    description: "Employee management dashboard updates.",
    members: 4,
    updated: "5d ago",
    createdAt: "2025-11-20",
    color: "bg-green-100 text-green-600",
    status: "Done",
    isImportant: false,
    progress: 100,
  },
];

const sharedProjectsData: Project[] = [
  {
    id: "PROJ-003",
    name: "Marketing Campaign Q4",
    description: "Creating assets for the upcoming year-end sale.",
    members: 12,
    updated: "3d ago",
    createdAt: "2025-11-10",
    color: "bg-orange-100 text-orange-600",
    status: "Review",
    isImportant: false,
    progress: 80,
    owner: "Sarah J.",
  },
  {
    id: "PROJ-005",
    name: "Client Portal - Phase 2",
    description: "Security audit and feature implementation.",
    members: 6,
    updated: "1w ago",
    createdAt: "2025-11-23",
    color: "bg-pink-100 text-pink-600",
    status: "In Progress",
    isImportant: false,
    progress: 60,
    owner: "David M.",
  },
];

const initialMyTasks: Task[] = [
  { id: 1, title: "ตรวจแก้ Wireframe หน้า Home", project: "Website Redesign", due: "Today", isDone: false, color: "text-red-500 bg-red-50" },
  { id: 2, title: "อัปเดตเอกสาร API", project: "Mobile App", due: "Tomorrow", isDone: false, color: "text-orange-500 bg-orange-50" },
  { id: 3, title: "เตรียมสไลด์ประชุมทีม", project: "General", due: "Nov 28", isDone: true, color: "text-blue-500 bg-blue-50" },
];

const recentComments: Comment[] = [
  { id: 1, user: "Alex", avatar: "A", text: "ตรงส่วน Header น่าจะปรับสีให้อ่อนลงหน่อยนะครับ", project: "Website Redesign", time: "10m ago" },
  { id: 2, user: "Sarah", avatar: "S", text: "ไฟล์ Logo ตัวล่าสุดอัปโหลดให้แล้วนะ อยู่ใน Folder Assets", project: "Marketing Campaign", time: "1h ago" },
  { id: 3, user: "Mike", avatar: "M", text: "บั๊กตรงหน้า Login แก้ไขเรียบร้อยแล้วครับ ฝากเทสด้วย", project: "Client Portal", time: "2h ago" },
];

interface WorkListProps {
  viewType?: "grid" | "list";
  searchItem?: string;
}

export default function WorkList({
  viewType = "grid",
  searchItem = "",
}: WorkListProps) {
  // --- State ---
  const [myProjects, setMyProjects] = useState<Project[]>(myProjectsData);
  const [sharedProjects, setSharedProjects] = useState<Project[]>(sharedProjectsData);
  const [myTasks, setMyTasks] = useState<Task[]>(initialMyTasks);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  
  // Calendar State
  const [selectedDate, setSelectedDate] = useState<string | null>(null); 
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date(2025, 10, 1)); // Default Nov 2025 for demo

  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---
  const handleToggleTask = (taskId: number) => {
    setMyTasks(prev => prev.map(t => t.id === taskId ? { ...t, isDone: !t.isDone } : t));
  };

  const handleDeleteProject = (id: string, isShared: boolean) => {
    if (confirm("คุณต้องการลบโปรเจกต์นี้ใช่หรือไม่?")) {
      if (isShared) setSharedProjects((prev) => prev.filter((p) => p.id !== id));
      else setMyProjects((prev) => prev.filter((p) => p.id !== id));
      setActiveDropdownId(null);
    }
  };

  const handleToggleImportant = (id: string, isShared: boolean) => {
    const updater = (prev: Project[]) => prev.map((p) => p.id === id ? { ...p, isImportant: !p.isImportant } : p);
    if (isShared) setSharedProjects(updater);
    else setMyProjects(updater);
    setActiveDropdownId(null);
  };

  // --- Filtering Logic ---
  const filterFn = (p: Project) => {
    const matchesSearch = p.name.toLowerCase().includes(searchItem.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchItem.toLowerCase());
    const matchesDate = selectedDate ? p.createdAt === selectedDate : true;
    return matchesSearch && matchesDate;
  };

  const filteredMyProjects = myProjects.filter(filterFn);
  const filteredSharedProjects = sharedProjects.filter(filterFn);
  const pendingTasks = myTasks.filter(t => !t.isDone).length;

  // --- Helper Components ---
  const ProjectCard = ({ project, isShared }: { project: Project, isShared: boolean }) => (
    <div className={`relative group block h-full transition-all duration-200 ${activeDropdownId === project.id ? "z-50" : "z-0"}`}>
      <Link href={`/workspace/${project.id}`} className="absolute inset-0 z-0" />
      
      <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all h-full relative z-10 pointer-events-none ${viewType === "grid" ? "flex flex-col" : "flex flex-row items-center gap-6"}`}>
        {project.isImportant && (
          <div className="absolute top-0 right-0 -mt-2 -mr-2 text-yellow-400 drop-shadow-sm bg-white rounded-full p-0.5 animate-in zoom-in">
            <Star size={20} fill="currentColor" />
          </div>
        )}

        <div className={`flex ${viewType === "grid" ? "justify-between items-start mb-4 w-full" : "items-center gap-4 flex-1"}`}>
          <div className="flex items-center gap-3 w-full">
            <div className={`p-3 rounded-xl ${project.color} ${viewType === "list" ? "shrink-0" : "max-w-max"}`}>
              <Folder size={28} strokeWidth={1.5} />
            </div>
            {viewType === "list" && (
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">{project.name}</h3>
                <p className="text-sm text-gray-500 truncate">{project.description}</p>
              </div>
            )}
          </div>

          <div className="relative pointer-events-auto">
            <button
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveDropdownId(activeDropdownId === project.id ? null : project.id); }}
            >
              <MoreVertical size={20} />
            </button>
            {activeDropdownId === project.id && (
              <div ref={dropdownRef} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right cursor-default z-50">
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2" onClick={() => handleToggleImportant(project.id, isShared)}>
                  <Star size={16} className={project.isImportant ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} />
                  <span>{project.isImportant ? "Unmark" : "Mark as Important"}</span>
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2" onClick={() => handleDeleteProject(project.id, isShared)}>
                  <Trash2 size={16} />
                  <span>{isShared ? "Remove from List" : "Delete Project"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {viewType === "grid" && (
          <>
            <div className="w-full mb-4">
              <h3 className="text-lg font-bold text-gray-900 truncate">{project.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 h-10 mt-1">{project.description}</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden">
               <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${project.progress}%` }}></div>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 mt-auto w-full">
              <div className="flex items-center gap-1.5">
                <CalendarIcon size={14} />
                <span>Created: {project.createdAt}</span>
              </div>
            </div>
          </>
        )}

        {viewType === "list" && (
          <div className="flex items-center gap-8 ml-auto text-xs text-gray-500 whitespace-nowrap">
             <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
               <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} />
              <span>{project.members} members</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12 items-start">
      {/* === Left Content (Main) === */}
      <div className="flex-1 w-full space-y-8 min-w-0">
        
        {/* Banner Filter */}
        {selectedDate && (
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-blue-700 text-sm">
              <Filter size={18} />
              <span>Filtering projects created on <strong>{selectedDate}</strong></span>
            </div>
            <button 
              onClick={() => setSelectedDate(null)}
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* My Projects */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              My Projects <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{filteredMyProjects.length}</span>
          </h2>
          
          <div className={viewType === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-3"}>
            {filteredMyProjects.length > 0 ? (
                filteredMyProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} isShared={false} />
                ))
            ) : (
                <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    No projects found{selectedDate ? ` on ${selectedDate}` : ""}
                </div>
            )}
            
            {/* Create New Project Card */}
            {!selectedDate && (
                <Link href="/workspace/add" className="block h-full">
                <div className={`border-2 border-dashed border-gray-300 rounded-2xl p-6 flex items-center text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all group cursor-pointer h-full ${viewType === "grid" ? "flex-col justify-center min-h-[220px]" : "flex-row gap-4 min-h-[100px]"}`}>
                    <div className="rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors w-12 h-12 mb-3">
                    <Plus size={24} className="group-hover:text-blue-600" />
                    </div>
                    <span className="font-semibold">Create New Project</span>
                </div>
                </Link>
            )}
          </div>
        </div>

        {/* Shared Projects */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              Shared Projects <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">{filteredSharedProjects.length}</span>
          </h2>
          
          {filteredSharedProjects.length > 0 ? (
            <div className={viewType === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-3"}>
               {filteredSharedProjects.map((project) => (
                 <ProjectCard key={project.id} project={project} isShared={true} />
               ))}
            </div>
          ) : (
             <div className="text-center py-10 border border-gray-100 rounded-2xl bg-gray-50/50">
               <p className="text-gray-400">No shared projects found {selectedDate ? `on ${selectedDate}` : ""}</p>
             </div>
          )}
        </div>
      </div>

      {/* === Right Sidebar (Widgets) === */}
      <div className="w-full lg:w-80 space-y-6 shrink-0">
         
         {/* Widget 1: Interactive Calendar */}
         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">
                  {currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex items-center gap-1">
                     <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1)))} className="p-1 hover:bg-gray-100 rounded text-gray-600"><ChevronLeft size={16}/></button>
                     <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1)))} className="p-1 hover:bg-gray-100 rounded text-gray-600"><ChevronRight size={16}/></button>
                </div>
            </div>
            <div className="grid grid-cols-7 text-center text-xs text-gray-400 font-medium mb-2">
               {['S','M','T','W','T','F','S'].map((d,i) => <span key={i}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 text-center gap-y-3 text-sm text-gray-700">
               {/* Padding for empty days */}
               {[...Array(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1).getDay())].map((_, i) => <span key={`empty-${i}`} />)}
               
               {/* Days */}
               {[...Array(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0).getDate())].map((_, i) => {
                   const day = i + 1;
                   const dateStr = `${currentCalendarDate.getFullYear()}-${(currentCalendarDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                   const isSelected = selectedDate === dateStr;
                   // Logic check if any project exists on this date
                   const hasEvent = [...myProjects, ...sharedProjects].some(p => p.createdAt === dateStr);

                   return (
                       <div key={day} className="relative flex justify-center">
                           <button 
                               onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                               className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                                   isSelected ? "bg-blue-600 text-white shadow-lg shadow-blue-300 scale-110" : "hover:bg-gray-100"
                               } ${hasEvent && !isSelected ? "font-bold text-blue-600" : ""}`}
                           >
                               {day}
                           </button>
                           {hasEvent && !isSelected && <div className="absolute bottom-0 w-1 h-1 bg-blue-500 rounded-full"></div>}
                       </div>
                   )
               })}
            </div>
            {selectedDate && (
                <button 
                    onClick={() => setSelectedDate(null)} 
                    className="w-full mt-4 text-xs text-blue-600 hover:bg-blue-50 py-2 rounded transition-colors border border-dashed border-blue-200"
                >
                    Clear Filter
                </button>
            )}
         </div>

         {/* Widget 2: My Tasks */}
         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-blue-500"/> My Tasks
                </h3>
                <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{pendingTasks} Pending</span>
            </div>
            <div className="space-y-2">
                {myTasks.map(task => (
                    <div 
                        key={task.id} 
                        className={`group flex items-start gap-3 p-3 rounded-xl transition-all border cursor-pointer select-none ${
                            task.isDone ? "bg-gray-50 border-transparent opacity-60" : "bg-white border-transparent hover:border-gray-200 hover:shadow-sm"
                        }`}
                        onClick={() => handleToggleTask(task.id)}
                    >
                        <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                            task.isDone ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-white group-hover:border-blue-400"
                        }`}>
                            {task.isDone && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-semibold leading-tight truncate ${task.isDone ? "text-gray-500 line-through" : "text-gray-800"}`}>{task.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-gray-500 truncate max-w-20">{task.project}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${task.color} whitespace-nowrap`}>{task.due}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
         </div>

         {/* Widget 3: Recent Comments */}
         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-orange-500"/> Recent Comments
            </h3>
            <div className="space-y-4">
                {recentComments.map(comment => (
                    <div key={comment.id} className="group relative pl-4 border-l-2 border-gray-100 hover:border-orange-300 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">{comment.avatar}</div>
                                <span className="text-xs font-bold text-gray-700">{comment.user}</span>
                            </div>
                            <span className="text-[10px] text-gray-400">{comment.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 group-hover:text-gray-900 transition-colors">"{comment.text}"</p>
                        <p className="text-[10px] text-blue-500 mt-1 font-medium">in {comment.project}</p>
                    </div>
                ))}
            </div>
         </div>
      </div>
    </div>
  );
}