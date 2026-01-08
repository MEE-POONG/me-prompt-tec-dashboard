import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import {
  Search,
  X,
  Plus,
  LayoutDashboard,
  KanbanSquare,
  CalendarDays,
  FileBarChart,
} from "lucide-react";
import ModalsWorkflow from "@/components/ui/workspace/ModalsWorkflow";
import { useWorkspaceBoard } from "@/hooks/useWorkspaceBoard";
import { WorkspaceBoardProps } from "@/types/workspace";

// API helpers
import {
  getBoard,
  createColumn,
  updateColumn,
  deleteColumn,
  createTask,
  updateTask,
  deleteTask,
  createActivity,
} from "@/lib/api/workspace";

// Imports Components
import WorkspaceTaskCard from "./Board/WorkspaceTaskCard";
import WorkspaceBoardColumn from "./Board/WorkspaceBoardColumn";
import WorkspaceHeader, { NotificationItem } from "./WorkspaceHeader";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";
import ModalError from "@/components/ui/Modals/ModalError";
import ModalDelete from "@/components/ui/Modals/ModalsDelete";

// Modals
import {
  WorkspaceSettingsSidebar,
  MembersManageModal,
} from "./WorkspacePageModals";

// Import Views
import ProjectDashboard from "./Views/ProjectDashboard";
import ProjectTimeline from "./Views/ProjectTimeline";
import ProjectReport from "./Views/ProjectReport";

// ✅ 1. Import useSocket Hook
import { useSocket } from "@/hooks/useSocket";

export default function WorkspaceBoard({ workspaceId }: WorkspaceBoardProps) {
  // ✅ 2. เรียก Hooks ทั้งหมดไว้บนสุด (ห้ามมี if มาคั่น)
  const router = useRouter();
  const board = useWorkspaceBoard([]);

  // เรียกใช้ Socket Hook อย่างปลอดภัย
  const socketData = useSocket();
  const socket = socketData?.socket;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspaceInfo, setWorkspaceInfo] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentView, setCurrentView] = useState<
    "board" | "dashboard" | "timeline" | "report"
  >("board");
  const [labels, setLabels] = useState<any[]>([]);

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
  // ✅ State สำหรับ Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // ✅ เพิ่มตัวแปรนี้: เช็คว่าโหลดข้อมูลเสร็จหรือยัง (กันบันทึกทับ)
  const [isLoaded, setIsLoaded] = useState(false);

  // ✅ Ref สำหรับจำ ID ของกิจกรรมล่าสุด
  const lastActivityIdRef = useRef<string | null>(null);

  // ✅ Helper: ดึงชื่อ User ปัจจุบัน
  const getCurrentUserName = () => {
    if (currentUser?.name) return currentUser.name;
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("user");
      if (u) {
        try {
          return JSON.parse(u).name;
        } catch (e) { }
      }
    }
    return "Someone";
  };

  // ✅ 1. โหลดข้อมูล (Load): ทำงานแค่ครั้งเดียวเมื่อเข้าหน้านี้
  useEffect(() => {
    if (typeof window !== "undefined" && workspaceId) {
      const saved = localStorage.getItem(`notifications_${workspaceId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // แปลง string date กลับเป็น object Date
          const withDate = parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }));
          setNotifications(withDate);
        } catch (e) {
          console.error("Error loading notifications", e);
        }
      }
      // บอกว่าโหลดเสร็จแล้วนะ อนุญาตให้บันทึกได้
      setIsLoaded(true);
    }
  }, [workspaceId]);

  // ✅ 2. บันทึกข้อมูล (Save): ทำงานเมื่อข้อมูลเปลี่ยน และต้องโหลดเสร็จแล้วเท่านั้น (isLoaded === true)
  useEffect(() => {
    // ถ้ายังโหลดไม่เสร็จ ห้ามบันทึกเด็ดขาด! (ไม่งั้นจะบันทึกค่าว่างทับของเก่า)
    if (!isLoaded) return;

    if (typeof window !== "undefined" && workspaceId) {
      localStorage.setItem(
        `notifications_${workspaceId}`,
        JSON.stringify(notifications)
      );
    }
  }, [notifications, workspaceId, isLoaded]);

  const getLabelColors = useCallback(
    (tag: string, tagColor?: string, currentLabels: any[] = []) => {
      const labelData = currentLabels.find((l) => l.name === tag);
      if (labelData) {
        const baseColor = labelData.color || "slate";
        return `${labelData.bgColor} ${labelData.textColor} border-${baseColor}-200/50`;
      }
      const color = tagColor || "slate";
      const mapping: Record<string, string> = {
        red: "bg-red-50 text-red-600 border-red-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        yellow: "bg-amber-50 text-amber-600 border-amber-100",
        green: "bg-emerald-50 text-emerald-600 border-emerald-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        slate: "bg-slate-50 text-slate-600 border-slate-100",
        gray: "bg-gray-50 text-gray-600 border-gray-100",
      };
      return mapping[color] || mapping.slate;
    },
    []
  );

  const mapApiTaskToWorkspaceTask = useCallback(
    (task: any, currentLabels: any[] = []) => {
      let dateLabel = "No date";
      try {
        const start = task.startDate
          ? new Date(task.startDate)
          : task.dueDate
            ? new Date(task.dueDate)
            : null;
        const end = task.endDate ? new Date(task.endDate) : null;
        if (start && end) {
          const s = start.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const e = end.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          dateLabel = `${s} - ${e}`;
        } else if (start) {
          dateLabel = start.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        }
      } catch (e) {
        dateLabel = task.dueDate || "No date";
      }

      return {
        id: task.id,
        title: task.title,
        tag: task.tag || "General",
        tagColor: getLabelColors(task.tag, task.tagColor, currentLabels),
        priority: task.priority || "Medium",
        status: task.column?.title || "To Do",
        rawDueDate: task.dueDate,
        assignees: task.assignees,
        memberIds: task.assignees?.map((a: any) => a.userId || a.user?.id),
        members:
          task.assignees?.map((a: any) => {
            const userId = a.userId || a.user?.id;
            // Try to find full member info from the board's member list
            // Note: `members` state is available in closure
            const found = members.find((m: any) => m.userId === userId);
            if (found) {
              return {
                id: found.id,
                name: found.name,
                avatar: found.avatar,
                userAvatar: found.userAvatar, // Add user's profile picture URL
                role: found.role,
                color: found.color,
              };
            }
            // Fallback if not found in board list (e.g. valid user but not in board?)
            return {
              id: userId,
              name: a?.user?.name || "Unknown",
              avatar: a?.user?.avatar,
              userAvatar: a?.user?.avatar, // Fallback to user avatar
              color: "bg-slate-100",
            };
          }) || [],
        comments: task.comments || 0,
        attachments: task.attachments || 0,
        date: dateLabel,
      };
    },
    [getLabelColors, members] // ✅ Updated dependency
  );
  const fetchBoard = useCallback(async () => {
    if (!workspaceId) return;
    setError(null);

    try {
      const data = await getBoard(workspaceId);
      const currentLabels = data.boardLabels || [];
      setLabels(currentLabels);

      const transformedColumns =
        data.columns?.map((col: any) => ({
          id: col.id,
          title: col.title,
          color: col.color || "bg-gray-500",
          tasks: (col.tasks || []).map((t: any) =>
            mapApiTaskToWorkspaceTask(t, currentLabels)
          ),
        })) || [];

      board.setColumns(transformedColumns);
      setWorkspaceInfo({
        name: data.name,
        description: data.description,
        progress: data.progress || 0,
        dueDate: data.dueDate || "",
        members: data.members || [],
        activities: data.activities || [],
        visibility: data.visibility, // [เพิ่ม]
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
      setMembers(data.members || []);
      setActivities(data.activities || []);
    } catch (err: any) {
      console.error("Failed to fetch board data:", err);
      setError(err?.message || "Failed to fetch board data");
    } finally {
      setLoading(false);
    }
  }, [workspaceId, mapApiTaskToWorkspaceTask]);

  // Initial Load Only
  useEffect(() => {
    if (workspaceId) {
      setLoading(true);
      fetchBoard();
    }
  }, [workspaceId]);

  // Initial Fetch
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse user", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!workspaceInfo || !currentUser) {
      return;
    }

    const isMember = (workspaceInfo.members || []).some((m: any) => {
      const memberName = (m.name || "").toLowerCase();
      const userName = (currentUser.name || "").toLowerCase();
      const memberEmail = (m.email || "").toLowerCase();
      const userEmail = (currentUser.email || "").toLowerCase();

      return (
        memberName === userName ||
        memberName === userEmail ||
        (memberEmail && memberEmail === userEmail)
      );
    });

    if (!isMember) {
      if (workspaceInfo.visibility === "PRIVATE") {
        setErrorModal({
          open: true,
          message: "คุณไม่มีสิทธิ์เข้าร่วม",
          description: "โปรเจกต์นี้เป็นแบบส่วนตัวเฉพาะสมาชิกเท่านั้น",
        });
        // We will handle redirect in the Modal's onClose or by checking if we should redirect
        return;
      }
      setIsReadOnly(true);
    } else {
      setIsReadOnly(false);
    }
  }, [workspaceInfo, currentUser, router]);

  // ✅ ระบบ Polling: เช็ค Activity ใหม่ทุกๆ 2 วินาที
  useEffect(() => {
    if (!workspaceId) return;

    const checkUpdates = async () => {
      try {
        const res = await fetch(
          `/api/workspace/activity?boardId=${workspaceId}&limit=1`
        );
        if (res.ok) {
          const data = await res.json();
          const latestActivity = data[0];

          if (
            latestActivity &&
            latestActivity.id !== lastActivityIdRef.current
          ) {
            if (lastActivityIdRef.current !== null) {
              // 1. Refresh ข้อมูลกระดาน
              fetchBoard();

              // 2. สร้างการแจ้งเตือน
              let actionText = "อัปเดต";
              let notifType: NotificationItem["type"] = "update";
              const act = (latestActivity.action || "").toLowerCase();

              if (act.includes("created task")) {
                actionText = "สร้างงานใหม่";
                notifType = "create";
              } else if (act.includes("created list")) {
                actionText = "สร้างลิสต์ใหม่";
                notifType = "create";
              } else if (act.includes("comment")) {
                actionText = "คอมเมนต์ใน";
                notifType = "comment";
              } else if (act.includes("moved")) {
                actionText = "ย้ายงาน";
                notifType = "update";
              } else if (act.includes("deleted")) {
                actionText = "ลบ";
                notifType = "delete";
              } else if (act.includes("renamed")) {
                actionText = "เปลี่ยนชื่อ";
                notifType = "update";
              }

              const newNotif: NotificationItem = {
                id: Date.now().toString(),
                user: latestActivity.user || "System",
                action: actionText,
                target: latestActivity.target || "งาน",
                timestamp: new Date(),
                type: notifType,
                isRead: false,
              };

              setNotifications((prev) => [newNotif, ...prev]);
            }

            lastActivityIdRef.current = latestActivity.id;
          } else if (lastActivityIdRef.current === null && latestActivity) {
            lastActivityIdRef.current = latestActivity.id;
          }
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    };

    const intervalId = setInterval(checkUpdates, 2000); // ✅ เปลี่ยนเป็น 2 วินาที เพื่อความ Realtime
    return () => clearInterval(intervalId);
  }, [workspaceId, fetchBoard]);

  // ✅ Real-time Socket Listener
  useEffect(() => {
    if (!socket || !workspaceId) return;

    // Optional: join-room if backend requires it
    // socket.emit("join-workspace", workspaceId);

    const handleBoardUpdate = (id: string) => {
      // Refresh board only if ID matches (mostly redundant if room-based, but safe)
      if (String(id) === String(workspaceId)) {
        fetchBoard(); // Re-fetch data immediately
      }
    };

    socket.on("board-updated", handleBoardUpdate);

    // Note: If you want to listen for "send-notification" too:
    // socket.on("send-notification", (data) => { ... logic to prepend to notifications ... });

    return () => {
      socket.off("board-updated", handleBoardUpdate);
    };
  }, [socket, workspaceId, fetchBoard]);

  // ✅ ฟังก์ชั่นอ่านแจ้งเตือน
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // ✅ ฟังก์ชั่นอ่านทั้งหมด
  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };



  const handleAddTaskApi = async (columnId: string | number) => {
    if (!board.newTaskTitle?.trim()) return;
    const title = board.newTaskTitle;
    const tempId = `temp-${Date.now()}`;
    const tempTask = {
      id: tempId,
      title,
      tag: "General",
      tagColor: "bg-gray-100 text-gray-600",
      priority: "Medium" as "Medium",
      members: [],
      comments: 0,
      attachments: 0,
      date: "Today",
      status: board.columns.find((c) => c.id === columnId)?.title || "To Do",
    };
    board.setColumns((prev) =>
      prev.map((c) =>
        c.id === columnId ? { ...c, tasks: [...(c.tasks || []), tempTask] } : c
      )
    );
    board.setNewTaskTitle("");
    board.setIsAddingTask(null);

    try {
      const created = await createTask({
        columnId: String(columnId),
        title,
        order: board.columns.find((c) => c.id === columnId)?.tasks?.length ?? 0,
        user: getCurrentUserName(),
      });
      await createActivity({
        boardId: String(workspaceId),
        user: getCurrentUserName(),
        action: "created task",
        target: created.title,
        projectId: String(workspaceId),
        taskId: created.id,
      });

      const mapped = mapApiTaskToWorkspaceTask(created, labels);
      board.setColumns((prev) =>
        prev.map((c) =>
          c.id === columnId
            ? {
              ...c,
              tasks: (c.tasks || []).map((t) =>
                t.id === tempId ? mapped : t
              ),
            }
            : c
        )
      );
    } catch (err: any) {
      // console.error("Failed to create task", err);
      board.setColumns((prev) =>
        prev.map((c) =>
          c.id === columnId
            ? { ...c, tasks: (c.tasks || []).filter((t) => t.id !== tempId) }
            : c
        )
      );

      // Show Error Modal
      setErrorModal({
        open: true,
        message: "ไม่สามารถสร้างงานได้",
        description: err.message || "คุณไม่มีสิทธิ์สร้างงานในบอร์ดนี้",
      });
    }
  };

  const handleDeleteTaskApi = async (
    columnId: string | number,
    taskId: string | number
  ) => {
    const taskTitle =
      board.columns
        .find((c) => c.id === columnId)
        ?.tasks?.find((t) => t.id === taskId)?.title || "task";

    setDeleteModal({
      open: true,
      message: `ต้องการลบงาน "${taskTitle}" ใช่หรือไม่?`,
      onConfirm: async () => {
        const prev = board.columns;
        board.setColumns(
          board.columns.map((c) =>
            c.id === columnId
              ? { ...c, tasks: (c.tasks || []).filter((t) => t.id !== taskId) }
              : c
          )
        );
        try {
          await deleteTask(String(taskId));
          await createActivity({
            boardId: String(workspaceId),
            user: getCurrentUserName(),
            action: "deleted task",
            target: taskTitle,
            projectId: String(workspaceId),
          });
        } catch (err: any) {
          // console.error("Failed to delete task", err);
          board.setColumns(prev); // Revert UI

          // Show Error Modal
          setErrorModal({
            open: true,
            message: "ไม่สามารถลบงานได้",
            description: err.message || "คุณไม่มีสิทธิ์ในการลบงานนี้ (เฉพาะสมาชิกในบอร์ดเท่านั้น)",
          });
        }
      },
    });
  };

  const handleAddColumnApi = async () => {
    if (!board.newColumnTitle?.trim()) return;
    const title = board.newColumnTitle;
    board.setNewColumnTitle("");
    board.setIsAddingColumn(false);
    const tempId = `temp-col-${Date.now()}`;
    const tempCol = { id: tempId, title, tasks: [], color: "bg-gray-400" };
    board.setColumns((prev) => [...prev, tempCol]);
    try {
      const created = await createColumn({
        boardId: String(workspaceId),
        title,
        order: board.columns.length,
        user: getCurrentUserName(),
      });
      const mappedCol = {
        id: created.id,
        title: created.title,
        tasks: (created.tasks || []).map((t: any) =>
          mapApiTaskToWorkspaceTask(t, labels)
        ),
        color: created.color,
      };
      board.setColumns((prev) => {
        const found = prev.some((c) => c.id === tempId);
        if (found) return prev.map((c) => (c.id === tempId ? mappedCol : c));
        return [...prev, mappedCol];
      });
      await createActivity({
        boardId: String(workspaceId),
        user: getCurrentUserName(),
        action: "created list",
        target: created.title,
        projectId: String(workspaceId),
      });

      // ✅ Emit Socket Event
      if (socket) {
        socket.emit("send-notification", {
          workspaceId,
          user: "Someone",
          avatarColor: "bg-purple-500",
          action: "added list",
          target: created.title,
          time: "Just now",
          isRead: false,
          type: "update",
        });
        socket.emit("board-updated", workspaceId);
      }
    } catch (err) {
      console.error("Failed to create column", err);
      board.setColumns((prev) => prev.filter((c) => c.id !== tempId));
    }
  };

  const handleCreateTaskFromTimeline = async ({
    title,
    startDate,
    duration,
    status,
  }: {
    title: string;
    startDate: string;
    duration: number;
    status: string;
  }) => {
    if (!title?.trim()) return;
    const targetCol =
      board.columns.find((c) => c.title === "To Do") || board.columns[0];
    if (!targetCol) return;
    const columnId = targetCol.id;
    try {
      const created = await createTask({
        columnId: String(columnId),
        title,
        dueDate: startDate,
        startDate,
        endDate: new Date(
          new Date(startDate).getTime() + duration * 24 * 60 * 60 * 1000
        ).toISOString(),
        order: board.columns.find((c) => c.id === columnId)?.tasks?.length ?? 0,
        user: getCurrentUserName(),
      });
      await createActivity({
        boardId: String(workspaceId),
        user: getCurrentUserName(),
        action: "created task",
        target: created.title,
        projectId: String(workspaceId),
        taskId: created.id,
      });
      await fetchBoard();
      return created;
    } catch (err) {
      console.error("Failed to create task from timeline", err);
      throw err;
    }
  };

  const handleRenameColumnSaveApi = async (colId: string | number) => {
    const title = board.tempColumnTitle;
    board.setEditingColumnId(null);
    if (!title?.trim()) return;
    const prev = board.columns;
    board.setColumns(
      board.columns.map((c) => (c.id === colId ? { ...c, title } : c))
    );
    try {
      await updateColumn(String(colId), { title, user: getCurrentUserName() });
      await createActivity({
        boardId: String(workspaceId),
        user: getCurrentUserName(),
        action: "renamed list",
        target: title,
        projectId: String(workspaceId),
      });
      // ✅ Emit Socket Event
      if (socket) socket.emit("board-updated", workspaceId);
    } catch (err) {
      console.error("Failed to rename column", err);
      board.setColumns(prev);
    }
  };

  const handleDeleteColumnApi = async (colId: string | number) => {
    const colTitle = board.columns.find((c) => c.id === colId)?.title || "list";
    setDeleteModal({
      open: true,
      message: `ต้องการลบลิสต์ "${colTitle}" ใช่หรือไม่?`,
      onConfirm: async () => {
        const prev = board.columns;
        board.setColumns(board.columns.filter((c) => c.id !== colId));
        try {
          await deleteColumn(String(colId));
          await createActivity({
            boardId: String(workspaceId),
            user: getCurrentUserName(),
            action: "deleted list",
            target: colTitle,
            projectId: String(workspaceId),
          });
        } catch (err) {
          console.error("Failed to delete column", err);
          board.setColumns(prev);
        }
      },
    });
  };

  const handleClearColumnApi = async (colId: string | number) => {
    const colTitle = board.columns.find((c) => c.id === colId)?.title || "list";
    setDeleteModal({
      open: true,
      message: `ต้องการล้างงานทั้งหมดในลิสต์ "${colTitle}" ใช่หรือไม่?`,
      onConfirm: async () => {
        const prev = board.columns;
        const column = board.columns.find((c) => c.id === colId);
        board.setColumns(
          board.columns.map((c) => (c.id === colId ? { ...c, tasks: [] } : c))
        );
        try {
          await Promise.all(
            (column?.tasks || []).map((t) => deleteTask(String(t.id)))
          );
          await createActivity({
            boardId: String(workspaceId),
            user: getCurrentUserName(),
            action: "cleared list",
            target: colTitle,
            projectId: String(workspaceId),
          });
        } catch (err) {
          console.error("Failed to clear column", err);
          board.setColumns(prev);
        }
      },
    });
  };

  const handleDragEnd = async (result: DropResult) => {
    if (isReadOnly) return;
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    board.onDragEnd(result);

    try {
      const isTemp =
        String(draggableId).startsWith("temp-") ||
        !/^[a-fA-F0-9]{24}$/.test(String(draggableId));
      if (isTemp) return;

      await updateTask(String(draggableId), {
        columnId: String(destination.droppableId),
        order: destination.index,
        user: getCurrentUserName(),
      });
      await createActivity({
        boardId: String(workspaceId),
        user: getCurrentUserName(),
        action: "moved task",
        target: "task",
        projectId: String(workspaceId),
        taskId: String(draggableId),
      });

      // ✅ Emit Socket Event
      if (socket) {
        socket.emit("board-updated", workspaceId);
      }
    } catch (err: any) {
      // console.error("Failed to move task", err);
      fetchBoard(); // revert

      // Show Error Modal
      setErrorModal({
        open: true,
        message: "ไม่สามารถย้ายงานได้",
        description: err.message || "คุณไม่มีสิทธิ์ย้ายงานในบอร์ดนี้",
      });
    }
  };

  const handleTaskClickWithPermission = (task: any) => {
    const userId = currentUser?.id || currentUser?._id;
    const userName = currentUser?.name?.toLowerCase().trim();
    const userEmail = currentUser?.email?.toLowerCase().trim();

    // Active Check: ID OR Name OR Email matching
    const isMember = members.some((m) => {
      const mName = m.name?.toLowerCase().trim();
      return (
        (m.userId && m.userId === userId) ||
        (m.id === userId) || // Direct ID match
        (mName && userName && mName === userName) || // Name match
        (mName && userEmail && mName === userEmail) // Email match
      );
    });

    if (!isMember) {
      setErrorModal({
        open: true,
        message: "ไม่สามารถเปิดงานได้",
        description: "คุณไม่มีสิทธิ์เข้าถึงรายละเอียดงานนี้ (เฉพาะสมาชิกในบอร์ดเท่านั้น)",
      });
      return;
    }
    board.handleOpenTaskModal(task);
  };

  return (
    <div className="flex flex-col h-full relative bg-white">
      {loading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/60">
          <div
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
            aria-hidden
          ></div>
        </div>
      )}

      {/* 1. Header */}
      <WorkspaceHeader
        workspaceInfo={
          workspaceInfo || {
            name: "",
            description: "",
            progress: 0,
            dueDate: "",
            members: [],
            activities: [],
          }
        }
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        onOpenSettings={() => {
          if (isReadOnly) {
            return setErrorModal({
              open: true,
              message: "ไม่มีสิทธิ์เข้าถึง!",
              description: "คุณไม่มีสิทธิ์ในการแก้ไขการตั้งค่าโครงการนี้",
            });
          }
          board.setIsSettingsOpen(true);
        }}
        onOpenMembers={() => {
          if (isReadOnly) {
            return setErrorModal({
              open: true,
              message: "ไม่มีสิทธิ์เข้าถึง!",
              description: "คุณไม่มีสิทธิ์ในการจัดการสมาชิกในโครงการนี้",
            });
          }
          board.setIsMembersOpen(true);
        }}
        onRefresh={fetchBoard}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        // ✅ แก้ไข: ลบข้อมูลจาก LocalStorage
        onClearNotifications={() => {
          setDeleteModal({
            open: true,
            message: "ต้องการลบประวัติการแจ้งเตือนทั้งหมดใช่ไหม?",
            onConfirm: () => {
              setNotifications([]);
              localStorage.removeItem(`notifications_${workspaceId}`);
            },
          });
        }}
      />

      {error && (
        <div className="px-6 py-3 bg-red-50 border-l-4 border-red-400 text-red-700 flex items-center justify-between">
          <div className="text-sm">{error}</div>
          <div>
            <button
              onClick={() => fetchBoard()}
              className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* 2. View Switcher & Filter Bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView("board")}
              className={`flex items-center gap-2 py-3 text-sm font-bold border-b-2 transition-all ${currentView === "board"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              <KanbanSquare size={18} /> Board
            </button>
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`flex items-center gap-2 py-3 text-sm font-bold border-b-2 transition-all ${currentView === "dashboard"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button
              onClick={() => setCurrentView("timeline")}
              className={`flex items-center gap-2 py-3 text-sm font-bold border-b-2 transition-all ${currentView === "timeline"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              <CalendarDays size={18} /> Timeline
            </button>
            <button
              onClick={() => setCurrentView("report")}
              className={`flex items-center gap-2 py-3 text-sm font-bold border-b-2 transition-all ${currentView === "report"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              <FileBarChart size={18} /> Reports{" "}
              <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded ml-1">
                New
              </span>
            </button>
          </div>

          {isFilterOpen && (
            <div className="relative w-64 py-2">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Filter tasks..."
                className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm bg-gray-50 font-medium"
                value={board.searchQuery}
                onChange={(e) => board.setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        {isFilterOpen && labels.length > 0 && (
          <div className="px-6 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide border-t border-gray-50 pt-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1 shrink-0">
              Filter Labels:
            </span>
            {labels.map((label) => {
              const isActive = board.selectedLabels.includes(label.name);
              const colors = getLabelColors(label.name, label.color, labels);
              return (
                <button
                  key={label.id}
                  onClick={() => {
                    board.setSelectedLabels((prev) =>
                      isActive
                        ? prev.filter((n) => n !== label.name)
                        : [...prev, label.name]
                    );
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border shrink-0 ${isActive
                    ? colors
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                    }`}
                >
                  {label.name}
                </button>
              );
            })}
            {board.selectedLabels.length > 0 && (
              <button
                onClick={() => board.setSelectedLabels([])}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 underline shrink-0 ml-2"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 w-full h-full overflow-hidden bg-white relative">
        {currentView === "board" && !loading && (
          <div className="h-full pt-6">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex h-full overflow-x-auto gap-6 px-6 items-start pb-4 custom-scrollbar">
                {board.columns.map((col) => (
                  <div
                    key={col.id}
                    className="min-w-[320px] w-[320px] flex flex-col bg-gray-50/50 rounded-2xl border border-gray-200/60 h-full max-h-full transition-colors shrink-0"
                  >
                    <WorkspaceBoardColumn
                      column={col}
                      onAddTask={board.setIsAddingTask}
                      onCreateTask={handleAddTaskApi}
                      onRenameStart={board.handleRenameColumnStart}
                      onClearColumn={() => handleClearColumnApi(col.id)}
                      onDeleteColumn={() => handleDeleteColumnApi(col.id)}
                      editingId={board.editingColumnId}
                      tempTitle={board.tempColumnTitle}
                      onTitleChange={board.setTempColumnTitle}
                      onSaveTitle={() => handleRenameColumnSaveApi(col.id)}
                      activeMenuId={board.activeMenuColumnId}
                      onMenuToggle={board.setActiveMenuColumnId}
                      isReadOnly={isReadOnly}
                    >
                      <Droppable
                        droppableId={String(col.id)}
                        isDropDisabled={isReadOnly}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`px-3 pb-3 flex-1 overflow-y-auto space-y-3 min-h-[150px] rounded-b-2xl scrollbar-hide ${snapshot.isDraggingOver ? "bg-blue-50/30" : ""
                              }`}
                          >
                            {board.filterTasks(col.tasks).map((task, index) => (
                              <WorkspaceTaskCard
                                key={task.id}
                                task={task}
                                columnId={col.id}
                                index={index}
                                onDelete={(cid, tid) =>
                                  handleDeleteTaskApi(cid, tid)
                                }
                                onClick={handleTaskClickWithPermission}
                              />
                            ))}
                            {provided.placeholder}
                            {board.isAddingTask === col.id ? (
                              <div className="bg-white p-3 rounded-xl shadow-lg border border-blue-200 animate-in fade-in zoom-in-95 duration-200 ring-4 ring-blue-50/50">
                                <textarea
                                  autoFocus
                                  placeholder="Type task name..."
                                  className="w-full text-sm resize-none outline-none text-gray-700 placeholder:text-gray-400 mb-2 font-medium bg-transparent"
                                  rows={2}
                                  value={board.newTaskTitle}
                                  onChange={(e) =>
                                    board.setNewTaskTitle(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleAddTaskApi(col.id);
                                    }
                                  }}
                                />
                                <div className="flex items-center justify-between gap-2 mt-2">
                                  <button
                                    onClick={() => handleAddTaskApi(col.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm shadow-blue-200 transition-all active:scale-95"
                                  >
                                    Add Card
                                  </button>
                                  <button
                                    onClick={() => board.setIsAddingTask(null)}
                                    className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              !isReadOnly && (
                                <button
                                  onClick={() => board.setIsAddingTask(col.id)}
                                  className="w-full py-2.5 flex items-center justify-start px-4 gap-2 text-gray-500 hover:text-gray-800 hover:bg-white rounded-xl transition-all text-sm font-semibold group"
                                >
                                  <Plus
                                    size={18}
                                    className="text-gray-400 group-hover:text-blue-500"
                                  />{" "}
                                  Add Task
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </Droppable>
                    </WorkspaceBoardColumn>
                  </div>
                ))}
                {!isReadOnly && (
                  <div className="min-w-[320px] shrink-0">
                    {board.isAddingColumn ? (
                      <div className="bg-white p-4 rounded-2xl shadow-xl border border-blue-200 animate-in fade-in zoom-in-95 ring-4 ring-blue-50/50">
                        <input
                          autoFocus
                          placeholder="List title..."
                          className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400 font-bold bg-transparent mb-4 px-1"
                          value={board.newColumnTitle}
                          onChange={(e) =>
                            board.setNewColumnTitle(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddColumnApi();
                            if (e.key === "Escape")
                              board.setIsAddingColumn(false);
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleAddColumnApi}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg font-bold shadow-sm transition-all"
                          >
                            Add List
                          </button>
                          <button
                            onClick={() => board.setIsAddingColumn(false)}
                            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => board.setIsAddingColumn(true)}
                        className="w-full h-[60px] flex items-center justify-center gap-2 bg-slate-50/50 hover:bg-slate-100/80 text-slate-500 font-bold rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-300 transition-all"
                      >
                        <Plus size={20} /> Add New List
                      </button>
                    )}
                  </div>
                )}
              </div>
            </DragDropContext>
          </div>
        )}
        {currentView === "dashboard" && (
          <ProjectDashboard
            boardId={workspaceId}
            tasks={board.columns.flatMap((c) => c.tasks || [])}
            members={members}
          />
        )}
        {currentView === "timeline" && (
          <ProjectTimeline
            tasks={board.columns.flatMap((c) => c.tasks || [])}
            labels={labels}
            onCreateTask={handleCreateTaskFromTimeline}
          />
        )}
        {currentView === "report" && (
          <ProjectReport
            tasks={board.columns.flatMap((c) => c.tasks || [])}
            members={members}
          />
        )}
      </div>

      {/* === MODALS === */}
      {board.selectedTask && (
        <ModalsWorkflow
          isOpen={board.isModalOpen}
          onClose={() => board.setIsModalOpen(false)}
          task={{ ...board.selectedTask, id: String(board.selectedTask.id) }}
          onTaskUpdated={fetchBoard}
        />
      )}

      <WorkspaceSettingsSidebar
        isOpen={board.isSettingsOpen}
        onClose={() => board.setIsSettingsOpen(false)}
        boardId={String(workspaceId)}
        isReadOnly={isReadOnly}
        workspaceInfo={
          workspaceInfo || {
            name: "",
            description: "",
            progress: 0,
            dueDate: "",
            members: [],
            activities: [],
          }
        }
        onUpdate={fetchBoard} // [เพิ่ม]
        currentUser={currentUser}
      />

      <MembersManageModal
        isOpen={board.isMembersOpen}
        onClose={() => board.setIsMembersOpen(false)}
        members={members}
        workspaceId={String(workspaceId)}
        onMemberAdded={fetchBoard}
        currentUser={currentUser}
      />

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
        onClose={() => {
          setErrorModal({ ...errorModal, open: false });
          if (errorModal.message === "คุณไม่มีสิทธิ์เข้าร่วม") {
            router.push("/workspace");
          }
        }}
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
