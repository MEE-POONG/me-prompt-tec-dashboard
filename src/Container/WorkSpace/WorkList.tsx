import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Folder,
  MoreVertical,
  Users,
  Trash2,
  Calendar as CalendarIcon,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  Lock, // [เพิ่ม]
  Globe, // [เพิ่ม]
} from "lucide-react";
import ModalError from "@/components/ui/Modals/ModalError";
import ModalDelete from "@/components/ui/Modals/ModalsDelete";

// --- Types ---
interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  visibility?: "PRIVATE" | "PUBLIC";
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
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(
    new Date(2025, 11, 1)
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [permissionModal, setPermissionModal] = useState({
    open: false,
    message: "",
    description: "",
  });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    message: "",
    onConfirm: () => { },
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"all" | "my" | "joined">("all");

  // --- Fetch Data ---
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/workspace/board", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
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
    // Get current user from localStorage
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
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
    const project = projects.find(p => p.id === id);
    setDeleteModal({
      open: true,
      message: `คุณต้องการลบโปรเจกต์ "${project?.name}" ใช่หรือไม่?`,
      onConfirm: async () => {
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
          const res = await fetch(`/api/workspace/board/${id}`, {
            method: "DELETE",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (res.ok) {
            setProjects((prev) => prev.filter((p) => p.id !== id));
          } else {
            setPermissionModal({
              open: true,
              message: "ลบโปรเจกต์ไม่สำเร็จ",
              description: "กรุณาลองใหม่อีกครั้ง"
            });
          }
        } catch (error) {
          console.error(error);
          setPermissionModal({
            open: true,
            message: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถลบโปรเจกต์ได้"
          });
        } finally {
          setActiveDropdownId(null);
          setDeleteModal({ open: false, message: "", onConfirm: () => { } });
        }
      },
    });
  };

  const calculateProgress = (project: Project) => {
    if (!project.columns) return 0;
    const allTasks = project.columns.flatMap((col) => col.tasks);
    if (allTasks.length === 0) return 0;
    const completedTasks = allTasks.filter((t) => t.isDone).length;
    return Math.round((completedTasks / allTasks.length) * 100);
  };

  const getUserMemberData = (project: Project) => {
    if (!currentUser) return null;
    const userName = (currentUser.name || "").toLowerCase();
    const userEmail = (currentUser.email || "").toLowerCase();

    return (project.members || []).find((m: any) => {
      const memberName = (m.name || "").toLowerCase();
      const memberEmail = (m.email || "").toLowerCase();
      return (
        memberName === userName ||
        memberName === userEmail ||
        (memberEmail && memberEmail === userEmail)
      );
    });
  };

  const isUserMember = (project: Project) => !!getUserMemberData(project);

  const isUserOwner = (project: Project) => {
    const member = getUserMemberData(project);
    return member?.role === "Owner";
  };

  const filteredProjects = projects.filter((p) => {
    // 1. Filter by Category Tab
    if (activeTab === "my") {
      if (!isUserOwner(p)) return false;
    } else if (activeTab === "joined") {
      // Joined = Member but NOT Owner
      if (!isUserMember(p) || isUserOwner(p)) return false;
    }

    // 3. Filter by Search and Date
    const matchesSearch =
      p.name.toLowerCase().includes(searchItem.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchItem.toLowerCase());

    const projectDate = new Date(p.createdAt).toISOString().split("T")[0];
    const matchesDate = selectedDate ? projectDate === selectedDate : true;

    return matchesSearch && matchesDate;
  });

  const handleEditClick = (project: Project) => {
    if (!isUserOwner(project)) {
      setPermissionModal({
        open: true,
        message: "คุณไม่มีสิทธิ์แก้ไขโปรเจกต์นี้",
        description:
          "คุณต้องเป็นเจ้าของเพื่อแก้ไขรายละเอียดโปรเจกต์นี้",
      });
      return;
    }
    setEditingProject(project);
    setIsEditModalOpen(true);
    setActiveDropdownId(null);
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
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/workspace/board/${editingProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        const updatedBoard = await res.json();
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
        className={`relative group block h-full transition-all duration-200 ${activeDropdownId === project.id ? "z-50" : "z-0"
          }`}
      >
        <div
          className="absolute inset-0 z-0 cursor-pointer"
          onClick={(e) => {
            if (project.visibility === "PRIVATE" && !isUserMember(project)) {
              setPermissionModal({
                open: true,
                message: "คุณไม่มีสิทธิ์เข้าร่วม",
                description: "โปรเจกต์นี้เป็นแบบส่วนตัวเฉพาะสมาชิกเท่านั้น",
              });
              return;
            }
            router.push(`/workspace/${project.id}`);
          }}
        />

        <div
          className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all h-full relative z-10 pointer-events-none ${viewType === "grid"
            ? "flex flex-col"
            : "flex flex-row items-center gap-6"
            }`}
        >
          <div
            className={`flex ${viewType === "grid"
              ? "justify-between items-start mb-4 w-full"
              : "items-center gap-4 flex-1"
              }`}
          >
            {/* --- ส่วนแสดงผล Grid View --- */}
            {viewType === "grid" ? (
              <div className="w-full mb-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900 truncate flex-1">
                    {project.name}
                  </h3>

                  {/* แสดงสถานะ Private/Public (แก้ไขแล้ว: ใส่ title ที่ div) */}
                  {project.visibility === "PUBLIC" ? (
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold shrink-0 border border-blue-200"
                      title="Public Workspace"
                    >
                      <Globe size={12} />
                      <span>Public</span>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold shrink-0 border border-gray-200"
                      title="Private Workspace"
                    >
                      <Lock size={12} />
                      <span>Private</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 h-10 mt-1">
                  {project.description}
                </p>
              </div>
            ) : (
              // --- ส่วนแสดงผล List View ---
              <div className="flex items-center gap-3 w-full">
                <div
                  className={`p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0`}
                  style={{
                    backgroundColor: `${project.color}20`,
                    color: project.color,
                  }}
                >
                  <Folder size={28} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {project.name}
                    </h3>

                    {/* ป้ายสถานะใน List View (แก้ไขแล้ว: ย้าย title ไปใส่ div หุ้ม) */}
                    {project.visibility === "PUBLIC" ? (
                      <div title="Public">
                        <Globe size={14} className="text-blue-500" />
                      </div>
                    ) : (
                      <div title="Private">
                        <Lock size={14} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {project.description}
                  </p>
                </div>
              </div>
            )}

            {isUserOwner(project) && (
              <div className="relative pointer-events-auto ml-auto">
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
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditClick(project);
                      }}
                    >
                      <Folder size={16} className="text-blue-500" />
                      <span>Edit Details</span>
                    </button>

                    <div className="h-px bg-gray-100 my-1"></div>

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
            )}
          </div>

          {viewType === "grid" && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-3 rounded-xl bg-blue-50 text-blue-600 max-w-max"
                  style={{
                    backgroundColor: `${project.color}20`,
                    color: project.color,
                  }}
                >
                  <Folder size={28} strokeWidth={1.5} />
                </div>
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
      <div className="flex-1 w-full space-y-8 min-w-0">
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

        {/* --- Category Tabs --- */}
        <div className="flex items-center gap-2 bg-gray-100/50 p-1 rounded-xl w-fit">
          {[
            { id: "all", label: "All Projects", icon: Folder },
            { id: "my", label: "My Projects", icon: Plus },
            { id: "joined", label: "Joined Projects", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            {activeTab === "all"
              ? "All Projects"
              : activeTab === "my"
                ? "My Projects"
                : "Joined Projects"}{" "}
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

            {activeTab !== "joined" && !selectedDate && (
              <Link href="/workspace/add" className="block h-full">
                <div
                  className={`border-2 border-dashed border-gray-300 rounded-2xl p-6 flex items-center text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all group cursor-pointer h-full ${viewType === "grid"
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

      <div className="w-full lg:w-80 space-y-6 shrink-0">
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
                    className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${isSelected
                      ? "bg-blue-600 text-white shadow-lg"
                      : "hover:bg-gray-100"
                      } ${hasEvent && !isSelected ? "font-bold text-blue-600" : ""
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
      </div>
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
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

      <ModalError
        open={permissionModal.open}
        message={permissionModal.message}
        description={permissionModal.description}
        onClose={() => setPermissionModal({ ...permissionModal, open: false })}
      />

      <ModalDelete
        open={deleteModal.open}
        message={deleteModal.message}
        onClose={() => setDeleteModal({ ...deleteModal, open: false })}
        onConfirm={deleteModal.onConfirm}
      />
    </div>
  );
}
