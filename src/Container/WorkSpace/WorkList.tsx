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
  Plus,
  Loader2,
} from "lucide-react";

// --- Types (ปรับให้ตรงกับ Prisma Return Type) ---
interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  members?: any[];
  columns?: {
    tasks: { isDone: boolean }[];
  }[];
}

interface WorkListProps {
  viewType?: "grid" | "list";
  searchItem?: string;
}

export default function WorkList({
  viewType = "grid",
  searchItem = "",
}: WorkListProps) {
  // --- State ---
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(
    new Date(2025, 11, 1)
  );
  // เพิ่ม State สำหรับจัดการ Modal และฟอร์ม
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Fetch Data ---
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/workspace/board");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---
  const handleDeleteProject = async (id: string) => {
    if (!confirm("คุณต้องการลบโปรเจกต์นี้ใช่หรือไม่?")) return;

    try {
      const res = await fetch(`/api/workspace/board/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Delete failed");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActiveDropdownId(null);
    }
  };

  // Helper: คำนวณ % ความสำเร็จจาก Tasks ใน Columns
  const calculateProgress = (project: Project) => {
    if (!project.columns) return 0;
    const allTasks = project.columns.flatMap((col) => col.tasks);
    if (allTasks.length === 0) return 0;
    const completedTasks = allTasks.filter((t) => t.isDone).length;
    return Math.round((completedTasks / allTasks.length) * 100);
  };

  // --- Filtering Logic ---
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchItem.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchItem.toLowerCase());

    // จัดรูปแบบวันที่จาก DB (ISOString) ให้เป็น YYYY-MM-DD เพื่อเทียบกับปฏิทิน
    const projectDate = new Date(p.createdAt).toISOString().split("T")[0];
    const matchesDate = selectedDate ? projectDate === selectedDate : true;

    return matchesSearch && matchesDate;
  });

  const handleEditClick = (project: Project) => {
    console.log("Editing project:", project.id); // ลองใส่ console.log เพื่อเช็คว่าปุ่มถูกกดจริงไหม
    setEditingProject(project); // เก็บข้อมูลโปรเจกต์ที่จะแก้
    setIsEditModalOpen(true); // เปิด Modal
    setActiveDropdownId(null); // ปิด Dropdown เมนู
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProject) return;

    const formData = new FormData(e.currentTarget);
    const updatedData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      color: formData.get("color") as string,
    };

    try {
      const res = await fetch(`/api/workspace/board/${editingProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        const updatedBoard = await res.json();
        // อัปเดตข้อมูลในหน้าจอทันทีโดยไม่ต้อง Refresh
        setProjects((prev) =>
          prev.map((p) =>
            p.id === updatedBoard.id ? { ...p, ...updatedBoard } : p
          )
        );
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  // --- Helper Component ---
  const ProjectCard = ({ project }: { project: Project }) => {
    const progress = calculateProgress(project);
    const dateFormatted = new Date(project.createdAt).toLocaleDateString();

    return (
      <div
        className={`relative group block h-full transition-all duration-200 ${
          activeDropdownId === project.id ? "z-50" : "z-0"
        }`}
      >
        <Link
          href={`/workspace/${project.id}`}
          className="absolute inset-0 z-0"
        />

        <div
          className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all h-full relative z-10 pointer-events-none ${
            viewType === "grid"
              ? "flex flex-col"
              : "flex flex-row items-center gap-6"
          }`}
        >
          <div
            className={`flex ${
              viewType === "grid"
                ? "justify-between items-start mb-4 w-full"
                : "items-center gap-4 flex-1"
            }`}
          >
            <div className="flex items-center gap-3 w-full">
              <div
                className={`p-3 rounded-xl bg-blue-50 text-blue-600 ${
                  viewType === "list" ? "shrink-0" : "max-w-max"
                }`}
                style={{
                  backgroundColor: `${project.color}20`,
                  color: project.color,
                }}
              >
                <Folder size={28} strokeWidth={1.5} />
              </div>
              {viewType === "list" && (
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {project.description}
                  </p>
                </div>
              )}
            </div>

            <div className="relative pointer-events-auto">
              <button
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveDropdownId(
                    activeDropdownId === project.id ? null : project.id
                  );
                }}
              >
                <MoreVertical size={20} />
              </button>
              {activeDropdownId === project.id && (
                <div
                  ref={dropdownRef}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right cursor-default z-50"
                >
                  {/* ปุ่ม Edit */}
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={(e) => {
                      e.preventDefault(); // ป้องกันการไปตาม Link
                      e.stopPropagation(); // หยุดการส่ง Event ไปยัง Element พ่อ
                      handleEditClick(project); // เรียกฟังก์ชันเปิด Modal
                    }}
                  >
                    <Folder size={16} className="text-blue-500" />
                    <span>Edit Details</span>
                  </button>

                  <div className="h-px bg-gray-100 my-1"></div>

                  {/* ปุ่ม Delete */}
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 size={16} />
                    <span>Delete Project</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {viewType === "grid" && (
            <>
              <div className="w-full mb-4">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 h-10 mt-1">
                  {project.description}
                </p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 mt-auto w-full">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon size={14} />
                  <span>Created: {dateFormatted}</span>
                </div>
              </div>
            </>
          )}

          {viewType === "list" && (
            <div className="flex items-center gap-8 ml-auto text-xs text-gray-500 whitespace-nowrap">
              <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={14} />
                <span>{project.members?.length || 0} members</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p>Loading projects...</p>
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
              <span>
                Filtering projects created on <strong>{selectedDate}</strong>
              </span>
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
            All Projects{" "}
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              {filteredProjects.length}
            </span>
          </h2>

          <div
            className={
              viewType === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                : "space-y-3"
            }
          >
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}

            {!selectedDate && (
              <Link href="/workspace/add" className="block h-full">
                <div
                  className={`border-2 border-dashed border-gray-300 rounded-2xl p-6 flex items-center text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all group cursor-pointer h-full ${
                    viewType === "grid"
                      ? "flex-col justify-center min-h-[220px]"
                      : "flex-row gap-4 min-h-[100px]"
                  }`}
                >
                  <div className="rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors w-12 h-12 mb-3">
                    <Plus size={24} className="group-hover:text-blue-600" />
                  </div>
                  <span className="font-semibold">Create New Project</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* === Right Sidebar (Widgets) === */}
      <div className="w-full lg:w-80 space-y-6 shrink-0">
        {/* Interactive Calendar */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">
              {currentCalendarDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setCurrentCalendarDate(
                    new Date(
                      currentCalendarDate.setMonth(
                        currentCalendarDate.getMonth() - 1
                      )
                    )
                  )
                }
                className="p-1 hover:bg-gray-100 rounded text-gray-600"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCurrentCalendarDate(
                    new Date(
                      currentCalendarDate.setMonth(
                        currentCalendarDate.getMonth() + 1
                      )
                    )
                  )
                }
                className="p-1 hover:bg-gray-100 rounded text-gray-600"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center text-xs text-gray-400 font-medium mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 text-center gap-y-3 text-sm text-gray-700">
            {[
              ...Array(
                new Date(
                  currentCalendarDate.getFullYear(),
                  currentCalendarDate.getMonth(),
                  1
                ).getDay()
              ),
            ].map((_, i) => (
              <span key={`empty-${i}`} />
            ))}

            {[
              ...Array(
                new Date(
                  currentCalendarDate.getFullYear(),
                  currentCalendarDate.getMonth() + 1,
                  0
                ).getDate()
              ),
            ].map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentCalendarDate.getFullYear()}-${(
                currentCalendarDate.getMonth() + 1
              )
                .toString()
                .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
              const isSelected = selectedDate === dateStr;
              const hasEvent = projects.some(
                (p) =>
                  new Date(p.createdAt).toISOString().split("T")[0] === dateStr
              );

              return (
                <div
                  key={day}
                  className="relative flex justify-center flex-col items-center"
                >
                  <button
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-lg"
                        : "hover:bg-gray-100"
                    } ${
                      hasEvent && !isSelected ? "font-bold text-blue-600" : ""
                    }`}
                  >
                    {day}
                  </button>
                  {hasEvent && !isSelected && (
                    <div className="mt-0.5 w-1 h-1 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Widgets อื่นๆ (Tasks/Comments) สามารถดึงจาก API activities หรือ tasks แยกต่างหากได้ */}
      </div>
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // กัน Click ทะลุ
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Edit Project</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  name="name"
                  defaultValue={editingProject.name}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingProject.description}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Project details..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Theme Color
                </label>
                <div className="flex gap-3 mt-2">
                  {["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"].map(
                    (color) => (
                      <label key={color} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="color"
                          value={color}
                          defaultChecked={editingProject.color === color}
                          className="peer sr-only"
                        />
                        <div
                          className="w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-gray-800 peer-checked:scale-110 transition-all"
                          style={{ backgroundColor: color }}
                        />
                      </label>
                    )
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
