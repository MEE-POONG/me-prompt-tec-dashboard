import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Save,
  Trash2,
  ChevronDown,
  Check,
  Plus,
  MoreHorizontal,
  Copy,
  Bell,
  Search,
  Edit2,
  History,
  Lock,
  CalendarClock,
  Globe,
  User,
  AlertCircle,
  Archive,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import {
  WorkspaceInfo,
  WorkspaceMember,
  WorkspaceTask,
} from "@/types/workspace";
import { updateBoard } from "@/lib/api/workspace";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";
import ModalError from "@/components/ui/Modals/ModalError";
import ModalDelete from "@/components/ui/Modals/ModalsDelete";
import ModalRestore from "@/components/ui/Modals/ModalRestore";

// --- Types ---
// ลบ "difficulty" ออกจาก Type
type TabType = "settings" | "archived" | "activities";

// --- Member Avatar Component ---
const MemberAvatar = ({ member, className }: { member: WorkspaceMember; className?: string }) => {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = member.userAvatar || member.avatar;
  const hasAvatar = !imgError && avatarUrl && (typeof avatarUrl === 'string') &&
    (avatarUrl.startsWith("http") || avatarUrl.startsWith("/") || avatarUrl.startsWith("data:"));

  const bgColor = member.color?.replace("text-", "bg-").split(" ")[0] || "bg-indigo-500";
  const initials = member.name ? member.name.substring(0, 2).toUpperCase() : "??";

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-full font-bold text-white shadow-sm border border-white ${bgColor} ${className}`}
    >
      <span className="z-0 text-xs">{initials}</span>
      {hasAvatar && (
        <img
          src={avatarUrl as string}
          alt={member.name}
          className="absolute inset-0 w-full h-full object-cover z-10"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
};

// --- Component หลัก: Settings Sidebar ---
export function WorkspaceSettingsSidebar({
  isOpen,
  onClose,
  workspaceInfo,
  boardId,
  isReadOnly = false,
  onUpdate,
  currentUser,
}: {
  isOpen: boolean;
  onClose: () => void;
  workspaceInfo: WorkspaceInfo;
  boardId: string;
  isReadOnly?: boolean;
  onUpdate?: () => void;
  currentUser?: any; // [เพิ่ม] prop รับ value ของ user ปัจจุบัน
}) {
  // UI States
  const [activeTab, setActiveTab] = useState<TabType>("settings");
  const [showMenu, setShowMenu] = useState(false);

  // Form States (Settings)
  const [projectName, setProjectName] = useState(workspaceInfo.name || "");
  const [description, setDescription] = useState(workspaceInfo.description || "");
  const [tempDescription, setTempDescription] = useState(workspaceInfo.description || "");
  const [visibility, setVisibility] = useState<"PRIVATE" | "PUBLIC">(workspaceInfo.visibility || "PRIVATE");
  const [tempVisibility, setTempVisibility] = useState<"PRIVATE" | "PUBLIC">(workspaceInfo.visibility || "PRIVATE");
  const [selectedWorkspace, setSelectedWorkspace] = useState("No Workspace");

  // Custom Modal States
  const [successModal, setSuccessModal] = useState({
    open: false,
    message: "",
    description: "",
  });
  const [errorModal, setErrorModal] = useState({
    open: false,
    message: "",
    description: "",
  });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    message: "",
    onConfirm: () => { },
  });
  const [restoreModal, setRestoreModal] = useState({
    open: false,
    message: "",
    onConfirm: () => { },
  });

  // Member States
  const [memberSearch, setMemberSearch] = useState("");
  const [members, setMembers] = useState<WorkspaceMember[]>(workspaceInfo.members);
  const [openMemberDropdownId, setOpenMemberDropdownId] = useState<number | null>(null);

  // [RBAC] Determine if current user is Admin
  const mb = workspaceInfo.members?.find((m) =>
    (currentUser && m.userId === currentUser.id) ||
    (currentUser && m.name === currentUser.name)
  );
  const isOwner = mb?.role === "Owner";

  // ❌ ลบ State และ Logic ของ Difficulty Level ออกทั้งหมดตรงนี้

  // Archived Tasks State
  const [archivedTasks, setArchivedTasks] = useState<WorkspaceTask[]>([]);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  const [archivedSearch, setArchivedSearch] = useState("");

  const fetchArchivedTasks = async () => {
    if (!boardId) return;
    setIsLoadingArchived(true);
    try {
      const res = await fetch(
        `/api/workspace/task?boardId=${boardId}&archived=true`
      );
      if (res.ok) {
        const data = await res.json();
        const mapped: WorkspaceTask[] = data.map((t: any) => ({
          id: t.id,
          title: t.title,
          tag: t.tag || "General",
          tagColor: t.tagColor || "bg-slate-100 text-slate-500",
          priority: t.priority || "Medium",
          members: [],
          comments: t.comments || 0,
          attachments: t.attachments || 0,
          date: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No date",
          status: t.column?.title || "Archived",
        }));
        setArchivedTasks(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch archived tasks", error);
    } finally {
      setIsLoadingArchived(false);
    }
  };

  useEffect(() => {
    if (activeTab === "archived" && isOpen) {
      fetchArchivedTasks();
    }
  }, [activeTab, isOpen, boardId]);

  const handleRestoreTask = async (taskId: string | number) => {
    setRestoreModal({
      open: true,
      message: "ต้องการคืนค่าแท็บพยากรณ์นี้ใช่หรือไม่?",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/workspace/task/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isArchived: false }),
          });

          if (res.ok) {
            setArchivedTasks((prev) => prev.filter((t) => t.id !== taskId));
            setSuccessModal({
              open: true,
              message: "คืนค่าสำเร็จ!",
              description: "คืนค่าแท็บพยากรณ์เรียบร้อยแล้ว",
            });
          } else {
            setErrorModal({
              open: true,
              message: "เกิดข้อผิดพลาด!",
              description: "ไม่สามารถคืนค่าแท็บพยากรณ์ได้",
            });
          }
        } catch (error) {
          console.error("Failed to restore task", error);
          setErrorModal({
            open: true,
            message: "เกิดข้อผิดพลาด!",
            description: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
          });
        }
      },
    });
  };

  // Refs
  const menuRef = useRef<HTMLDivElement>(null);
  const memberDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize Data when modal opens
  useEffect(() => {
    if (isOpen) {
      setMembers(workspaceInfo.members);
      setProjectName(workspaceInfo.name || "");
      setVisibility(workspaceInfo.visibility || "PRIVATE");
      setTempVisibility(workspaceInfo.visibility || "PRIVATE");
      setDescription(workspaceInfo.description || "");
      setTempDescription(workspaceInfo.description || "");
    }
  }, [isOpen, workspaceInfo]);

  // Click Outside to Close Menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (
        memberDropdownRef.current &&
        !memberDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenMemberDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers (Settings) ---
  const handleSaveDescription = async () => {
    if (!boardId) return;
    try {
      await updateBoard(boardId, { description: tempDescription });
      setDescription(tempDescription);
      setSuccessModal({
        open: true,
        message: "บันทึกสำเร็จ!",
        description: "บันทึกรายละเอียดเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error("Failed to update description", error);
      setErrorModal({
        open: true,
        message: "เกิดข้อผิดพลาด!",
        description: "ไม่สามารถบันทึกรายละเอียดได้",
      });
    }
  };

  const handleSaveName = async () => {
    if (!boardId) return;
    try {
      await updateBoard(boardId, { name: projectName });
      setSuccessModal({
        open: true,
        message: "บันทึกสำเร็จ!",
        description: "บันทึกชื่อโปรเจกต์เรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error("Failed to update name", error);
      setErrorModal({
        open: true,
        message: "เกิดข้อผิดพลาด!",
        description: "ชื่่อโปรเจกต์นี้อาจมีอยู่แล้ว หรือเกิดข้อผิดพลาดอื่น",
      });
    }
  };

  const handleSaveVisibility = async () => {
    if (!boardId) return;
    try {
      await updateBoard(boardId, { visibility: tempVisibility });
      setVisibility(tempVisibility);
      setSuccessModal({
        open: true,
        message: "บันทึกสำเร็จ!",
        description: `เปลี่ยนสถานะเป็น ${tempVisibility === "PRIVATE" ? "Private" : "Public"
          } เรียบร้อยแล้ว`,
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Failed to update visibility", error);
      setErrorModal({
        open: true,
        message: "เกิดข้อผิดพลาด!",
        description: "ไม่สามารถเปลี่ยนสถานะได้",
      });
    }
  };

  const handleCancelVisibility = () => {
    setTempVisibility(visibility);
  };

  const handleCancelDescription = () => {
    setTempDescription(description);
  };

  const handleRoleChange = async (index: number, newRole: string) => {
    const member = members[index];
    try {
      const res = await fetch("/api/workspace/member", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      const updatedMembers = [...members];
      updatedMembers[index].role = newRole;
      setMembers(updatedMembers);
      setOpenMemberDropdownId(null);
    } catch (error) {
      console.error(error);
      setErrorModal({
        open: true,
        message: "เกิดข้อผิดพลาด!",
        description: "ไม่สามารถเปลี่ยนบทบาทได้",
      });
    }
  };

  const handleRemoveMember = async (index: number) => {
    const member = members[index];
    setDeleteModal({
      open: true,
      message: `คุณต้องการลบสมาชิิก ${member.name} ใช่หรือไม่?`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/workspace/member?id=${member.id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to remove member");
          const updatedMembers = members.filter((_, i) => i !== index);
          setMembers(updatedMembers);
          setSuccessModal({
            open: true,
            message: "ลบสำเร็จ!",
            description: "ลบสมาชิิกเรียบร้อยแล้ว",
          });
        } catch (error) {
          console.error(error);
          setErrorModal({
            open: true,
            message: "เกิดข้อผิดพลาด!",
            description: "ไม่สามารถลบสมาชิิกได้",
          });
        }
      },
    });
    setOpenMemberDropdownId(null);
  };

  const handleLeaveBoard = () => {
    setDeleteModal({
      open: true,
      message: "คุณต้องการออกจากบอร์ดนี้ใช่หรือไม่?",
      onConfirm: () => {
        onClose();
        // Add actual leave logic here
      },
    });
  };

  // --- ❌ ลบ Handlers (Difficulty) ออกทั้งหมด ---

  // --- Logic for Filtering Lists ---
  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  // ❌ ลบ filteredDifficulties ออก

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-60 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className="fixed inset-y-0 right-0 w-full max-w-[400px] bg-white shadow-2xl z-70 flex flex-col animate-in slide-in-from-right duration-300">
        {/* --- Header --- */}
        <div className="p-5 pb-0 bg-white z-10">
          <div className="flex justify-between items-start mb-2">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded bg-blue-500 shadow-sm"></div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 leading-tight">
                  {workspaceInfo.name}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Created{" "}
                  {workspaceInfo.createdAt
                    ? `on ${format(
                      new Date(workspaceInfo.createdAt),
                      "MMMM d 'at' HH:mm"
                    )}`
                    : "recently"}
                </p>
              </div>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
              >
                <MoreHorizontal size={20} />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 origin-top-right">
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <Bell size={14} /> Notification
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <Copy size={14} /> Copy Board
                  </button>
                  <div className="h-px bg-slate-100 my-1"></div>
                  {!isReadOnly && (
                    <button
                      disabled={!isOwner}
                      title={!isOwner ? "Only Owner can delete board" : ""}
                      onClick={() => setDeleteModal({ ...deleteModal, open: true })}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${isOwner
                        ? 'text-red-600 hover:bg-red-50 cursor-pointer'
                        : 'text-slate-300 cursor-not-allowed bg-slate-50'}`}
                    >
                      <Trash2 size={14} /> Delete Board
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tabs - ❌ ลบ "Difficulty Level" ออกจาก Tabs */}
          <div className="flex items-center gap-6 border-b border-slate-200 mt-6 overflow-x-auto scrollbar-hide">
            {["Settings", "Archived", "Activities"].map(
              (tab) => {
                const tabKey = tab.toLowerCase().replace(" ", "") as TabType;
                return (
                  <button
                    key={tabKey}
                    onClick={() => setActiveTab(tabKey)}
                    className={`pb-3 text-sm font-medium transition-all relative whitespace-nowrap ${activeTab === tabKey
                      ? "text-blue-600"
                      : "text-slate-500 hover:text-slate-700"
                      }`}
                  >
                    {tab}
                    {activeTab === tabKey && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* --- Content --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-slate-50/30">
          {/* TAB 1: SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col min-h-full">
              {/* Project Name */}
              <div className="space-y-1.5 ">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                  <Edit2 size={12} className="text-slate-400" /> Project Name{" "}
                  <span className="text-slate-400 text-xs font-normal">ⓘ</span>
                </label>
                <div className="flex gap-2">
                  <input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isReadOnly}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Visibility */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                  {tempVisibility === "PUBLIC" ? (
                    <Globe size={12} className="text-slate-400" />
                  ) : (
                    <Lock size={12} className="text-slate-400" />
                  )}{" "}
                  Visibility
                </label>
                <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                  <div className="relative mb-3">
                    <select
                      value={tempVisibility}
                      onChange={(e) =>
                        setTempVisibility(
                          e.target.value as "PRIVATE" | "PUBLIC"
                        )
                      }
                      disabled={isReadOnly}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="PRIVATE">Private (สมาชิกเท่านั้น)</option>
                      <option value="PUBLIC">Public (ทุกคนเห็นได้)</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    {tempVisibility === "PRIVATE"
                      ? "เฉพาะสมาชิกที่ได้รับเชิญเท่านั้นที่สามารถเข้าถึงบอร์ดนี้ได้"
                      : "ทุกคนที่มีลิงก์สามารถเข้าถึงบอร์ดนี้ได้"}
                  </p>

                  {/* Buttons for Visibility */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCancelVisibility}
                      disabled={tempVisibility === visibility}
                      className={`px-4 py-1.5 bg-white border border-slate-200 rounded text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all ${tempVisibility === visibility
                        ? "opacity-50 cursor-default"
                        : "active:scale-95"
                        }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveVisibility}
                      disabled={isReadOnly || tempVisibility === visibility}
                      className={`px-4 py-1.5 bg-gray-200 border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all ${isReadOnly || tempVisibility === visibility
                        ? "opacity-50 cursor-not-allowed"
                        : "active:scale-95"
                        }`}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                  Description
                </label>
                <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                  <textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors resize-none mb-3"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCancelDescription}
                      className="px-4 py-1.5 bg-white border border-slate-200 rounded text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDescription}
                      disabled={isReadOnly}
                      className="px-4 py-1.5 bg-gray-200 border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Workspace */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                  <User size={14} /> Workspace
                </label>
                <div className="relative">
                  <select
                    value={selectedWorkspace}
                    onChange={(e) => setSelectedWorkspace(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option>No Workspace</option>
                    <option>Marketing Team</option>
                    <option>Dev Team</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Members */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                  <User size={14} /> Members
                </label>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    placeholder="Search name"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1 pt-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    MEMBERS ({filteredMembers.length})
                  </p>
                  {filteredMembers.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1.5 hover:bg-slate-100 rounded-lg px-2 -mx-2 transition-colors relative"
                    >
                      <div className="flex items-center gap-3">
                        <MemberAvatar member={m} className="w-9 h-9" />
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-tight">
                            {m.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {m.name.includes("ธนภัทร")
                              ? "pattanapat92@gmail.com"
                              : m.name.includes("Siwakorn")
                                ? "siwakorn.pn@rmuti.ac.th"
                                : "user@email.com"}
                          </p>
                        </div>
                      </div>

                      {/* Role Dropdown */}
                      {/* Role Dropdown - Only if Admin/Owner */}
                      {(() => {
                        const currentUserMember = members.find(m =>
                          (currentUser && m.userId === currentUser.id) ||
                          (currentUser && m.name === currentUser.name)
                        );
                        const currentUserRole = currentUserMember?.role || "Viewer";
                        const isOwner = currentUserRole === "Owner";
                        const isBoardOwner = m.role === "Owner";
                        const canEdit = !isBoardOwner && isOwner;

                        return (
                          <button
                            disabled={!canEdit}
                            onClick={() => {
                              if (canEdit) {
                                setOpenMemberDropdownId(
                                  openMemberDropdownId === i ? null : i
                                )
                              }
                            }}
                            className={`text-xs font-medium text-slate-600 flex items-center gap-1 px-2 py-1 rounded transition-all ${canEdit ? 'hover:bg-white hover:shadow-sm cursor-pointer' : 'opacity-70 cursor-not-allowed'}`}
                          >
                            {m.role || "Viewer"} <ChevronDown size={12} className={!canEdit ? "hidden" : ""} />
                          </button>
                        );
                      })()}

                      {openMemberDropdownId === i && (
                        <div
                          ref={memberDropdownRef}
                          className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95"
                        >
                          {["Owner", "Editor", "Viewer"].map((role) => (
                            <button
                              key={role}
                              onClick={() => handleRoleChange(i, role)}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                            >
                              {role}{" "}
                              {m.role === role && (
                                <Check size={14} className="text-blue-600" />
                              )}
                            </button>
                          ))}
                          <div className="h-px bg-slate-100 my-1"></div>
                          <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center justify-between">
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {!isReadOnly && (
                <div className="pt-4 mt-2 border-t border-slate-200">
                  <button
                    onClick={handleLeaveBoard}
                    className="w-full py-2 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors"
                  >
                    <Trash2 size={16} /> Leave Board
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ❌ ส่วนของ TAB 2: DIFFICULTY LEVEL ถูกลบออกไปแล้ว */}

          {/* TAB 3: ARCHIVED */}
          {activeTab === "archived" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-800">
                  Archived tasks
                </h3>
                <button className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-blue-700 transition-all shadow-sm active:scale-95">
                  Switch to columns
                </button>
              </div>

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  placeholder="Search tasks"
                  value={archivedSearch}
                  onChange={(e) => setArchivedSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                {isLoadingArchived ? (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    Loading...
                  </div>
                ) : archivedTasks.filter((t) =>
                  t.title.toLowerCase().includes(archivedSearch.toLowerCase())
                ).length === 0 ? (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center text-center mt-4 h-full">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 relative">
                      <div className="w-16 h-12 bg-blue-600 rounded-md shadow-lg flex items-center justify-center relative z-10 rotate-[-10deg]">
                        <Archive size={24} className="text-white" />
                      </div>
                      <div className="absolute w-14 h-4 bg-blue-800/20 rounded-full blur-md bottom-4"></div>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-1">
                      No items
                    </h4>
                    <p className="text-sm text-slate-500">
                      You can archive tasks or columns here.
                    </p>
                  </div>
                ) : (
                  archivedTasks
                    .filter((t) =>
                      t.title
                        .toLowerCase()
                        .includes(archivedSearch.toLowerCase())
                    )
                    .map((task) => (
                      <div
                        key={task.id}
                        className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-bold text-slate-800 line-clamp-2">
                            {task.title}
                          </h4>
                          <button
                            onClick={() => handleRestoreTask(task.id)}
                            className="text-slate-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded transition-colors"
                            title="Restore"
                          >
                            <History size={16} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span
                            className={`px-1.5 py-0.5 rounded border ${task.tagColor}`}
                          >
                            {task.tag}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <CalendarClock size={12} /> {task.date}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVITIES */}
          {activeTab === "activities" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-full pb-10">
              {workspaceInfo.activities &&
                workspaceInfo.activities.length > 0 ? (
                (
                  Object.entries(
                    (workspaceInfo.activities || []).reduce(
                      (groups: Record<string, any[]>, activity: any) => {
                        const date = new Date(activity.createdAt);
                        const key = isToday(date)
                          ? "Today"
                          : isYesterday(date)
                            ? "Yesterday"
                            : format(date, "EEEE d MMMM yyyy");
                        if (!groups[key]) groups[key] = [];
                        groups[key].push(activity);
                        return groups;
                      },
                      {}
                    )
                  ) as [string, any[]][]
                ).map(([dateLabel, acts]) => (
                  <div key={dateLabel} className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 sticky top-0 bg-slate-50/95 py-2 z-10">
                      {dateLabel}
                    </h3>
                    <div className="space-y-6 pl-2 relative border-l-2 border-slate-200 ml-3">
                      {acts.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex gap-3 relative -ml-[19px] group"
                        >
                          {typeof activity.user === "object" &&
                            ((activity.user as any).userAvatar ||
                              (activity.user as any).avatar) ? (
                            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 z-10 border-4 border-white shadow-sm ring-1 ring-slate-100">
                              <img
                                src={
                                  (activity.user as any).userAvatar ||
                                  (activity.user as any).avatar
                                }
                                alt={(activity.user as any).name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-pink-600 flex items-center justify-center text-white text-xs font-bold shrink-0 z-10 border-4 border-white shadow-sm ring-1 ring-slate-100">
                              {(typeof activity.user === "object"
                                ? (activity.user as any).name
                                : activity.user || "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col pt-1">
                            <div className="text-sm text-slate-800 leading-snug">
                              <span className="font-bold hover:underline cursor-pointer">
                                {typeof activity.user === "object"
                                  ? (activity.user as any).name
                                  : activity.user}
                              </span>{" "}
                              {activity.action}{" "}
                              {activity.target && (
                                <span className="font-medium text-slate-600">
                                  "{activity.target}"
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 mt-1 font-medium group-hover:text-slate-500 transition-colors">
                              {format(
                                new Date(activity.createdAt),
                                "MMMM d 'at' HH:mm"
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <History className="text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">No recent activity</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ModalSuccess
        open={successModal.open}
        message={successModal.message}
        description={successModal.description}
        onClose={() => setSuccessModal({ ...successModal, open: false })}
      />

      <ModalError
        open={errorModal.open}
        message={errorModal.message}
        description={errorModal.description}
        onClose={() => setErrorModal({ ...errorModal, open: false })}
      />

      <ModalDelete
        open={deleteModal.open}
        message={deleteModal.message}
        onClose={() => setDeleteModal({ ...deleteModal, open: false })}
        onConfirm={deleteModal.onConfirm}
      />

      <ModalRestore
        open={restoreModal.open}
        message={restoreModal.message}
        onClose={() => setRestoreModal({ ...restoreModal, open: false })}
        onConfirm={restoreModal.onConfirm}
      />
    </>
  );
}

// --- Invite Member Modal ---
export function MembersManageModal({
  isOpen,
  onClose,
  members,
  workspaceId,
  onMemberAdded,
  currentUser,
}: {
  isOpen: boolean;
  onClose: () => void;
  members: WorkspaceMember[];
  workspaceId?: string;
  onMemberAdded?: () => void;
  currentUser?: any;
}) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Viewer");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [successModal, setSuccessModal] = useState({
    open: false,
    message: "",
    description: "",
  });
  const [errorModal, setErrorModal] = useState({
    open: false,
    message: "",
    description: "",
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    if (!workspaceId) {
      setErrorMsg("Workspace ID missing.");
      return;
    }

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/workspace/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardId: workspaceId,
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to invite member");
      }

      setSuccessMsg("Member invited successfully!");
      setInviteEmail("");
      setInviteRole("Viewer"); // Reset role
      if (onMemberAdded) {
        onMemberAdded();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch("/api/workspace/member", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: memberId, role: newRole }),
      });

      if (!res.ok) throw new Error("Failed to update role");

      if (onMemberAdded) onMemberAdded(); // Refresh list
    } catch (error) {
      console.error(error);
      setErrorModal({
        open: true,
        message: "เกิดข้อผิดพลาด!",
        description: "ไม่สามารถเปลี่ยนบทบาทได้",
      });
    }
  };

  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const executeRemoveMember = async (memberId: string) => {
    try {
      const res = await fetch(`/api/workspace/member?id=${memberId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove member");

      if (onMemberAdded) onMemberAdded(); // Refresh list
      setConfirmRemoveId(null);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to remove member");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-60 flex items-center justify-center backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl w-full max-w-[500px] shadow-2xl p-5 m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl text-slate-900">
            เชิญสมาชิก (Invite member)
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-slate-600" />
          </button>
        </div>
        <div className="px-6 py-6 bg-slate-50/50 rounded-lg mb-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Plus size={18} />
                </div>
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                  placeholder="Invite by email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              {/* Role Selection */}
              <div className="relative w-32 shrink-0">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                >
                  <option value="Viewer">Viewer</option>
                  <option value="Editor">Editor</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              </div>

              <button
                onClick={handleInvite}
                disabled={loading}
                className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? "..." : "เชิญ"}
              </button>
            </div>
            {/* Feedback Messages */}
            {successMsg && (
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium animate-in fade-in slide-in-from-top-1">
                <Check size={16} /> {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="flex items-center gap-2 text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Members ({members.length})
          </h4>
          <div className="space-y-1">
            {members.map((member, index) => {
              // Calculate logic inside map or outside (better outside but fine here for context)
              const currentUserMember = members.find(m =>
                (currentUser && m.userId === currentUser.id) ||
                (currentUser && m.name === currentUser.name)
              );
              const currentUserRole = currentUserMember?.role || "Viewer";
              const isOwner = currentUserRole === "Owner";

              const isSelf =
                currentUser &&
                (member.userId === currentUser.id ||
                  member.id === currentUser.id);
              const isBoardOwner = member.role === "Owner";

              // Permission Logic
              const canDelete = !isSelf && !isBoardOwner && isOwner;
              const canEdit = !isBoardOwner && isOwner;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <MemberAvatar member={member} className="w-10 h-10 text-sm" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        {member.name}
                        {member.role === "Owner" && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-extrabold uppercase tracking-wider">
                            Owner
                          </span>
                        )}
                        {member.role === "Editor" && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                            Editor
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-slate-500">
                        {member.role || "Member"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role || "Viewer"}
                      onChange={(e) =>
                        handleUpdateRole(member.id, e.target.value)
                      }
                      disabled={!canEdit}
                      className={`text-xs font-bold text-slate-600 px-2 py-1.5 bg-slate-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500 outline-none ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <option value="Viewer">Viewer</option>
                      <option value="Editor">Editor</option>
                      {member.role === "Owner" && <option value="Owner">Owner</option>}
                    </select>
                    {canDelete &&
                      (confirmRemoveId === member.id ? (
                        <div className="flex items-center gap-1 ml-1 animate-in slide-in-from-right-2 fade-in duration-200">
                          <span className="text-[10px] font-bold text-red-500 hidden sm:inline">
                            ยืนยัน?
                          </span>
                          <button
                            onClick={() => executeRemoveMember(member.id)}
                            className="p-1 px-3 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 shadow-sm transition-all"
                          >
                            ลบ
                          </button>
                          <button
                            onClick={() => setConfirmRemoveId(null)}
                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmRemoveId(member.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove member"
                        >
                          <Trash2 size={16} />
                        </button>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ModalSuccess
        open={successModal.open}
        message={successModal.message}
        description={successModal.description}
        onClose={() => setSuccessModal({ ...successModal, open: false })}
      />

      <ModalError
        open={errorModal.open}
        message={errorModal.message}
        description={errorModal.description}
        onClose={() => setErrorModal({ ...errorModal, open: false })}
      />
    </div>
  );
}