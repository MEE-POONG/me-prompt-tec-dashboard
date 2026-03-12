import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Folder,
  Users,
  Trash2,
  X,
  Filter,
  Plus,
  RotateCcw,
} from "lucide-react";

import ModalError from "@/components/ui/Modals/ModalError";
import ModalDelete from "@/components/ui/Modals/ModalsDelete";
import { Project, WorkListProps } from "@/types/workspace";

// Imported Components
import { ProjectCard } from "./components/ProjectCard";
import { ProjectSkeleton } from "./components/ProjectSkeleton";
import { EditProjectModal } from "./components/EditProjectModal";
import { SidebarCalendar } from "./components/SidebarCalendar";

export default function WorkList({
  viewType = "grid",
  searchItem = "",
}: WorkListProps) {
  // --- State ---
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [trashProjects, setTrashProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<"all" | "my" | "joined" | "trash">("all");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(
    new Date(2025, 11, 1)
  );

  // Modals Info
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [readingProject, setReadingProject] = useState<Project | null>(null);
  const [isReadModalOpen, setIsReadModalOpen] = useState(false);
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

  const fetchTrashProjects = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/workspace/board?trash=true", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTrashProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch trash projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
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

  // Fetch trash when tab changes to trash
  useEffect(() => {
    if (activeTab === "trash") {
      fetchTrashProjects();
    }
  }, [activeTab]);

  // --- Helpers for Permissions ---
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

  const isUserMember = (project: Project) => {
    if (!project.members || project.members.length === 0) return true;
    return !!getUserMemberData(project);
  };

  const isUserOwner = (project: Project) => {
    const member = getUserMemberData(project);
    return member?.role === "Owner";
  };

  // --- Filter Logic ---
  const filteredProjects = projects.filter((p) => {
    if (activeTab === "my") {
      if (!isUserOwner(p)) return false;
    } else if (activeTab === "joined") {
      if (!isUserMember(p) || isUserOwner(p)) return false;
    }

    const matchesSearch =
      p.name.toLowerCase().includes(searchItem.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchItem.toLowerCase());

    const projectDate = new Date(p.createdAt).toISOString().split("T")[0];
    const matchesDate = selectedDate ? projectDate === selectedDate : true;

    return matchesSearch && matchesDate;
  });

  // --- Actions ---
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
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              deletedBy: currentUser?.role === "admin" 
                ? `Admin: ${currentUser?.name || currentUser?.email || "Unknown"}`
                : currentUser?.name || currentUser?.email || "Unknown"
            }),
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

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
    setActiveDropdownId(null);
  };

  const handleReadClick = (project: Project) => {
    setReadingProject(project);
    setIsReadModalOpen(true);
  };

  const handleUpdateSubmit = async (data: { name: string; description: string; color: string }) => {
    if (!editingProject) return;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/workspace/board/${editingProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
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

  const handleNavigate = (project: Project) => {
    const isAdmin = currentUser?.role === "admin";

    if (project.visibility === "PRIVATE" && !isUserMember(project) && !isAdmin) {
      setPermissionModal({
        open: true,
        message: "คุณไม่มีสิทธิ์เข้าร่วม",
        description: "โปรเจกต์นี้เป็นแบบส่วนตัวเฉพาะสมาชิกเท่านั้น",
      });
      return;
    }
    router.push(`/workspace/${project.id}`);
  };

  // Restore project from trash
  const handleRestoreProject = async (id: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/workspace/board/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: "restore" }),
      });
      if (res.ok) {
        setTrashProjects((prev) => prev.filter((p) => p.id !== id));
        fetchProjects(); // Refresh main list
      } else {
        setPermissionModal({
          open: true,
          message: "กู้คืนโปรเจกต์ไม่สำเร็จ",
          description: "กรุณาลองใหม่อีกครั้ง"
        });
      }
    } catch (error) {
      console.error(error);
      setPermissionModal({
        open: true,
        message: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถกู้คืนโปรเจกต์ได้"
      });
    }
  };

  // Permanent delete - admin only
  const handlePermanentDelete = async (id: string) => {
    const project = trashProjects.find(p => p.id === id);
    setDeleteModal({
      open: true,
      message: `ลบถาวร "${project?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้!`,
      onConfirm: async () => {
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
          const res = await fetch(`/api/workspace/board/${id}?permanent=true`, {
            method: "DELETE",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (res.ok) {
            setTrashProjects((prev) => prev.filter((p) => p.id !== id));
          } else {
            setPermissionModal({
              open: true,
              message: "ลบถาวรไม่สำเร็จ",
              description: "เฉพาะ Admin เท่านั้นที่สามารถลบถาวรได้"
            });
          }
        } catch (error) {
          console.error(error);
          setPermissionModal({
            open: true,
            message: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถลบถาวรได้"
          });
        } finally {
          setDeleteModal({ open: false, message: "", onConfirm: () => { } });
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex-1 w-full space-y-8">
        <div className="flex items-center gap-2 bg-gray-100/50 p-1 rounded-xl w-fit">
          <div className="h-9 w-32 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-9 w-32 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-9 w-32 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className={viewType === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-3"}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProjectSkeleton key={i} viewType={viewType} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12 items-start">
      <div className="flex-1 w-full space-y-8 min-w-0">
        {selectedDate && (
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-blue-700 text-sm">
              <Filter size={18} />
              <span>Filtering projects created on <strong>{selectedDate}</strong></span>
            </div>
            <button onClick={() => setSelectedDate(null)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="flex mb-4 justify-around items-center gap-1 sm:gap-2 bg-gray-100/50 p-1 rounded-xl w-full overflow-x-auto scrollbar-hide">
          {[
            { id: "all", label: "All Projects", icon: Folder },
            { id: "my", label: "My Projects", icon: Plus },
            { id: "joined", label: "Joined Projects", icon: Users },
            { id: "trash", label: "Trash", icon: Trash2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 whitespace-nowrap px-2 sm:px-3 md:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shrink-0 ${activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            {activeTab === "all" ? "All Projects" : activeTab === "my" ? "My Projects" : activeTab === "joined" ? "Joined Projects" : "Trash"}{" "}
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "trash" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
              {activeTab === "trash" ? trashProjects.length : filteredProjects.length}
            </span>
          </h2>

          {activeTab === "trash" ? (
            // Trash View
            <div className={viewType === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-3"}>
              {trashProjects.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Trash2 size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">ไม่มีโปรเจกต์ในถังขยะ</p>
                </div>
              ) : (
                trashProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{project.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{project.description || "No description"}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mb-4">
                      <p>ลบโดย: {project.deletedBy || "Unknown"}</p>
                      <p>ลบเมื่อ: {project.deletedAt ? new Date(project.deletedAt).toLocaleDateString("th-TH") : "-"}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestoreProject(project.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        <RotateCcw size={16} />
                        กู้คืน
                      </button>
                      {currentUser?.role === "admin" && (
                        <button
                          onClick={() => handlePermanentDelete(project.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                          <Trash2 size={16} />
                          ลบถาวร
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Normal Projects View
            <div className={viewType === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-3"}>
              {activeTab !== "joined" && !selectedDate && (
                <Link href="/workspace/add" className="block h-full">
                  <div className={`border-2 border-dashed border-gray-300 rounded-2xl p-6 flex items-center text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all group cursor-pointer h-full ${viewType === "grid" ? "flex-col justify-center min-h-[220px]" : "flex-row gap-4 min-h-[100px]"}`}>
                    <div className="rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors w-12 h-12 mb-3">
                      <Plus size={24} className="group-hover:text-blue-600" />
                    </div>
                    <span className="font-semibold">Create New Project</span>
                  </div>
                </Link>
              )}
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewType={viewType}
                  isOwner={isUserOwner(project) || currentUser?.role === "admin"}
                  isActiveDropdown={activeDropdownId === project.id}
                  setActiveDropdownId={setActiveDropdownId}
                  onEdit={() => handleEditClick(project)}
                  onDelete={() => handleDeleteProject(project.id)}
                  onClick={() => handleNavigate(project)}
                  onRead={() => handleReadClick(project)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <SidebarCalendar
        projects={projects}
        currentDate={currentCalendarDate}
        onDateChange={setCurrentCalendarDate}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={editingProject}
        onUpdate={handleUpdateSubmit}
      />

      <ModalError open={permissionModal.open} message={permissionModal.message} description={permissionModal.description} onClose={() => setPermissionModal({ ...permissionModal, open: false })} />
      <ModalDelete open={deleteModal.open} message={deleteModal.message} onClose={() => setDeleteModal({ ...deleteModal, open: false })} onConfirm={deleteModal.onConfirm} />

      {/* Read Project Modal */}
      {isReadModalOpen && readingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Project Details</h2>
                <button
                  onClick={() => setIsReadModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{readingProject.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-700 mt-1 whitespace-pre-wrap">{readingProject.description || "No description"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Visibility</label>
                  <p className="text-gray-700 mt-1">{readingProject.visibility === "PUBLIC" ? "Public" : "Private"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-gray-700 mt-1">{new Date(readingProject.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {readingProject.members && readingProject.members.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Members ({readingProject.members.length})</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {readingProject.members.map((member: any, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                        {member.name || member.email}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setIsReadModalOpen(false)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
