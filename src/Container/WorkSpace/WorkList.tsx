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
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<"all" | "my" | "joined">("all");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(
    new Date(2025, 11, 1)
  );

  // Modals Info
  const [editingProject, setEditingProject] = useState<Project | null>(null);
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

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
    setActiveDropdownId(null);
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
    if (project.visibility === "PRIVATE" && !isUserMember(project)) {
      setPermissionModal({
        open: true,
        message: "คุณไม่มีสิทธิ์เข้าร่วม",
        description: "โปรเจกต์นี้เป็นแบบส่วนตัวเฉพาะสมาชิกเท่านั้น",
      });
      return;
    }
    router.push(`/workspace/${project.id}`);
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

        <div className="flex items-center gap-2 bg-gray-100/50 p-1 rounded-xl w-fit">
          {[
            { id: "all", label: "All Projects", icon: Folder },
            { id: "my", label: "My Projects", icon: Plus },
            { id: "joined", label: "Joined Projects", icon: Users },
            { id: "trash", label: "Trash", icon: Trash2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            {activeTab === "all" ? "All Projects" : activeTab === "my" ? "My Projects" : "Joined Projects"}{" "}
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              {filteredProjects.length}
            </span>
          </h2>

          <div className={viewType === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-3"}>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                viewType={viewType}
                isOwner={isUserOwner(project)}
                isActiveDropdown={activeDropdownId === project.id}
                setActiveDropdownId={setActiveDropdownId}
                onEdit={() => handleEditClick(project)}
                onDelete={() => handleDeleteProject(project.id)}
                onClick={() => handleNavigate(project)}
              />
            ))}

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
          </div>
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
    </div>
  );
}
