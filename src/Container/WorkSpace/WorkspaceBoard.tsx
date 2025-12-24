import React, { useState, useEffect, useCallback } from "react";
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
  Lock,  // [เพิ่ม]
  Globe, // [เพิ่ม]
} from "lucide-react";
import ModalsWorkflow from "@/components/ui/workspace/ModalsWorkflow";
import { useWorkspaceBoard } from "@/hooks/useWorkspaceBoard";
import { INITIAL_WORKSPACE_COLUMNS } from "@/constants/workspaceData";
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
  getMembers,
  getActivities,
  createActivity,
} from "@/lib/api/workspace";

// Imports Components
import WorkspaceTaskCard from "./Board/WorkspaceTaskCard";
import WorkspaceBoardColumn from "./Board/WorkspaceBoardColumn";
import WorkspaceHeader from "./WorkspaceHeader";

// Modals
import {
  WorkspaceSettingsSidebar,
  MembersManageModal,
} from "./WorkspacePageModals";

// Import Views
import ProjectDashboard from "./Views/ProjectDashboard";
import ProjectTimeline from "./Views/ProjectTimeline";
import ProjectReport from "./Views/ProjectReport";

export default function WorkspaceBoard({ workspaceId }: WorkspaceBoardProps) {
  const router = useRouter();
  const board = useWorkspaceBoard([]);

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

  // Helper: map a color name or board label to Tailwind classes
  const getLabelColors = useCallback((tag: string, tagColor?: string, currentLabels: any[] = []) => {
    // 1. Try to find in board labels first (by name)
    const labelData = currentLabels.find(l => l.name === tag);
    if (labelData) {
      // derive border from bgColor if possible, or use a default
      const baseColor = labelData.color || "slate";
      return `${labelData.bgColor} ${labelData.textColor} border-${baseColor}-200/50`;
    }

    // 2. Fallback to name-based mapping (for INITIAL_TAGS or legacy)
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
  }, []);

  // Helper: map API task -> WorkspaceTask
  const mapApiTaskToWorkspaceTask = useCallback((task: any, currentLabels: any[] = []) => {
    // derive human-friendly date display (support date ranges)
    let dateLabel = "No date";
    try {
      const start = task.startDate ? new Date(task.startDate) : (task.dueDate ? new Date(task.dueDate) : null);
      const end = task.endDate ? new Date(task.endDate) : null;
      if (start && end) {
        const s = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const e = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        dateLabel = `${s} - ${e}`;
      } else if (start) {
        dateLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
        task.assignees?.map(
          (a: any) =>
            // support both shapes (assignee.user or direct fields)
            a?.user?.avatar ||
            a?.avatar ||
            a?.user?.name?.substring(0, 2) ||
            a?.name?.substring(0, 2) ||
            "?"
        ) || [],
      comments: task.comments || 0,
      attachments: task.attachments || 0,
      date: dateLabel,
    };
  }, [getLabelColors]);

  // Fetch board details and populate local state
  const fetchBoard = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getBoard(workspaceId);
      const currentLabels = data.boardLabels || [];
      setLabels(currentLabels);

      // map columns/tasks to workspace shape
      const transformedColumns =
        data.columns?.map((col: any) => ({
          id: col.id,
          title: col.title,
          color: col.color || "bg-gray-500",
          tasks: (col.tasks || []).map((t: any) => mapApiTaskToWorkspaceTask(t, currentLabels)),
        })) || [];

      board.setColumns(transformedColumns);
      setWorkspaceInfo({
        name: data.name,
        description: data.description,
        progress: data.progress || 0,
        dueDate: data.dueDate || "",
        members: data.members || [],
        activities: data.activities || [],
      });
      setMembers(data.members || []);
      setActivities(data.activities || []);
    } catch (err: any) {
      console.error("Failed to fetch board data:", err);
      setError(err?.message || "Failed to fetch board data");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, mapApiTaskToWorkspaceTask]);

  useEffect(() => {
    if (!workspaceId) return;
    fetchBoard();
  }, [workspaceId, fetchBoard]);

  useEffect(() => {
    // Get Current User
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

  // Calculate Read Only logic
  useEffect(() => {
    if (!workspaceInfo || !currentUser) {
      return;
    }

    const isMember = (workspaceInfo.members || []).some(
      (m: any) => {
        const memberName = (m.name || "").toLowerCase();
        const userName = (currentUser.name || "").toLowerCase();
        // Fallback email check if available in future
        const memberEmail = (m.email || "").toLowerCase();
        const userEmail = (currentUser.email || "").toLowerCase();

        // Check if member name matches user name OR user email (common case where invite email is used as name)
        return memberName === userName || memberName === userEmail || (memberEmail && memberEmail === userEmail);
      }
    );

    if (workspaceInfo.visibility === "PUBLIC" && !isMember) {
      setIsReadOnly(true);
    } else {
      setIsReadOnly(false);
    }

  }, [workspaceInfo, currentUser]);

  // Real-time: subscribe to server-sent events for this board
  useEffect(() => {
    if (!workspaceId) return;
    const url = `/api/realtime/stream?channel=${encodeURIComponent(String(workspaceId))}`;
    const es = new EventSource(url);

    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        // For now, simply refetch board on any event — could apply fine-grained updates
        fetchBoard();
      } catch (e) {
        console.error("Invalid realtime message", e);
      }
    };

    es.onerror = (e) => {
      // reconnect logic could be added here
      console.error("SSE error", e);
      es.close();
      // try to reconnect after a short delay
      setTimeout(() => {
        // no-op: effect will recreate if workspaceId unchanged; simple reconnection handled by browser
      }, 3000);
    };

    return () => es.close();
  }, [workspaceId, fetchBoard]);

  // -----------------------
  // API-backed handlers
  // -----------------------
  const handleAddTaskApi = async (columnId: string | number) => {
    if (!board.newTaskTitle?.trim()) return;
    const title = board.newTaskTitle;

    // optimistic UI
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
      // reflect column title for immediate dashboard counts
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

      // activity
      await createActivity({
        boardId: String(workspaceId),
        user: "System",
        action: "created task",
        target: created.title,
        projectId: String(workspaceId),
        taskId: created.id,
      });
    } catch (err) {
      console.error("Failed to create task", err);
      // rollback
      board.setColumns((prev) =>
        prev.map((c) =>
          c.id === columnId
            ? { ...c, tasks: (c.tasks || []).filter((t) => t.id !== tempId) }
            : c
        )
      );
    }
  };

  const handleDeleteTaskApi = async (
    columnId: string | number,
    taskId: string | number
  ) => {
    if (!confirm("Delete this task?")) return;
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
    } catch (err) {
      console.error("Failed to delete task", err);
      board.setColumns(prev);
    }
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
      });
      const mappedCol = {
        id: created.id,
        title: created.title,
        tasks: (created.tasks || []).map((t: any) => mapApiTaskToWorkspaceTask(t, labels)),
        color: created.color,
      };

      board.setColumns((prev) => {
        const found = prev.some((c) => c.id === tempId);
        if (found) return prev.map((c) => (c.id === tempId ? mappedCol : c));
        // fallback: append if temp not found
        return [...prev, mappedCol];
      });

      await createActivity({
        boardId: String(workspaceId),
        user: "System",
        action: "created list",
        target: created.title,
        projectId: String(workspaceId),
      });
    } catch (err) {
      console.error("Failed to create column", err);
      board.setColumns((prev) => prev.filter((c) => c.id !== tempId));
    }
  };

  const handleCreateTaskFromTimeline = async ({ title, startDate, duration, status }: { title: string; startDate: string; duration: number; status: string; }) => {
    if (!title?.trim()) return;
    const targetCol = board.columns.find((c) => c.title === "To Do") || board.columns[0];
    if (!targetCol) return;
    const columnId = targetCol.id;
    try {
      const created = await createTask({
        columnId: String(columnId),
        title,
        dueDate: startDate,
        startDate,
        endDate: new Date(new Date(startDate).getTime() + duration * 24 * 60 * 60 * 1000).toISOString(),
        order: board.columns.find((c) => c.id === columnId)?.tasks?.length ?? 0,
      });
      await createActivity({
        boardId: String(workspaceId),
        user: "System",
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
      await updateColumn(String(colId), { title });
      await createActivity({
        boardId: String(workspaceId),
        user: "System",
        action: "renamed list",
        target: title,
        projectId: String(workspaceId),
      });
    } catch (err) {
      console.error("Failed to rename column", err);
      board.setColumns(prev);
    }
  };

  const handleDeleteColumnApi = async (colId: string | number) => {
    if (!confirm("Delete this list?")) return;
    const prev = board.columns;
    board.setColumns(board.columns.filter((c) => c.id !== colId));

    try {
      await deleteColumn(String(colId));
      await createActivity({
        boardId: String(workspaceId),
        user: "System",
        action: "deleted list",
        target: String(colId),
        projectId: String(workspaceId),
      });
    } catch (err) {
      console.error("Failed to delete column", err);
      board.setColumns(prev);
    }
  };

  const handleClearColumnApi = async (colId: string | number) => {
    if (!confirm("Clear all tasks?")) return;
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
        user: "System",
        action: "cleared list",
        target: String(colId),
        projectId: String(workspaceId),
      });
    } catch (err) {
      console.error("Failed to clear column", err);
      board.setColumns(prev);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // Optimistic UI update
    board.onDragEnd(result);

    try {
      // If this task is a temporary/local task id (optimistic create not yet persisted), we should persist it on the server
      const isTemp = String(draggableId).startsWith("temp-") || !/^[a-fA-F0-9]{24}$/.test(String(draggableId));

      if (isTemp) {
        // Find the moved task in the destination column
        const destCol = board.columns.find((c) => c.id === destination.droppableId);
        const movedTask = destCol?.tasks?.find((t: any) => String(t.id) === String(draggableId));
        if (movedTask) {
          const created = await createTask({
            columnId: String(destination.droppableId),
            title: movedTask.title,
            order: destination.index,
            dueDate: (movedTask as any).rawDueDate || undefined,
            startDate: (movedTask as any).startDate || undefined,
            endDate: (movedTask as any).endDate || undefined,
          });

          const mapped = mapApiTaskToWorkspaceTask(created, labels);
          // replace temp task with persisted task id in columns
          board.setColumns((prev) =>
            prev.map((c) =>
              c.id === destination.droppableId
                ? { ...c, tasks: (c.tasks || []).map((t: any) => (t.id === draggableId ? mapped : t)) }
                : c
            )
          );

          await createActivity({
            boardId: String(workspaceId),
            user: "System",
            action: "created task",
            target: created.title,
            projectId: String(workspaceId),
            taskId: created.id,
          });

          // refresh to ensure consistent ordering and counts
          await fetchBoard();
          return;
        }
      }

      // Normal persisted task move
      await updateTask(String(draggableId), {
        columnId: String(destination.droppableId),
        order: destination.index,
      });
      await createActivity({
        boardId: String(workspaceId),
        user: "System",
        action: "moved task",
        target: String(draggableId),
        projectId: String(workspaceId),
        taskId: String(draggableId),
      });
    } catch (err) {
      console.error("Failed to move task", err);
      // revert by refetching
      try {
        const data = await getBoard(workspaceId);
        const transformedColumns =
          data.columns?.map((col: any) => ({
            id: col.id,
            title: col.title,
            color: col.color || "bg-gray-500",
            tasks: (col.tasks || []).map((t: any) => mapApiTaskToWorkspaceTask(t, labels)),
          })) || [];
        board.setColumns(transformedColumns);
      } catch (e) {
        console.error("Failed to refresh board", e);
      }
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-white">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/60">
          <div
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
            aria-hidden
          ></div>
        </div>
      )}

      {/* 1. Header ด้านบนสุด */}
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
          if (isReadOnly) return alert("You don't have permission to edit settings.");
          board.setIsSettingsOpen(true);
        }}
        onOpenMembers={() => {
          if (isReadOnly) return alert("You don't have permission to manage members.");
          board.setIsMembersOpen(true);
        }}
        onRefresh={fetchBoard}
      />

      {/* Debug Info (Optional - kept minimal if needed, otherwise removed) */}
      {/* <div className="bg-yellow-100... hidden" /> */}

      {/* Error banner */}
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
          {/* View Tabs */}
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

          {/* Filter Input */}
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

        {/* Label Chips Filter */}
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

      {/* 3. Main Content Area */}
      <div className="flex-1 w-full h-full overflow-hidden bg-white relative">
        {/* VIEW: BOARD */}
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
                      <Droppable droppableId={String(col.id)} isDropDisabled={isReadOnly}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`px-3 pb-3 flex-1 overflow-y-auto space-y-3 min-h-[150px] transition-colors rounded-b-2xl scrollbar-hide ${snapshot.isDraggingOver
                              ? "bg-blue-50/30 ring-2 ring-inset ring-blue-100"
                              : ""
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
                                onClick={board.handleOpenTaskModal}
                              />
                            ))}
                            {provided.placeholder}

                            {!isReadOnly && (
                              board.isAddingTask === col.id ? (
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
                                <button
                                  onClick={() => board.setIsAddingTask(col.id)}
                                  className="w-full py-2.5 flex items-center justify-start px-4 gap-2 text-gray-500 hover:text-gray-800 hover:bg-white rounded-xl transition-all text-sm font-semibold group"
                                >
                                  <Plus
                                    size={18}
                                    className="text-gray-400 group-hover:text-blue-500"
                                  />
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

                {/* Add New List Button */}
                {!isReadOnly && (
                  <div className="min-w-[320px] shrink-0">
                    {board.isAddingColumn ? (
                      <div className="bg-white p-4 rounded-2xl shadow-xl border border-blue-200 animate-in fade-in zoom-in-95 ring-4 ring-blue-50/50">
                        <input
                          autoFocus
                          placeholder="Enter list title..."
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
                        disabled={isReadOnly} // Added disabled check
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

        {/* VIEW: DASHBOARD */}
        {currentView === "dashboard" && (
          <ProjectDashboard
            boardId={workspaceId}
            tasks={board.columns.flatMap(c => c.tasks || [])}
            members={members}
          />
        )}

        {/* VIEW: TIMELINE */}
        {currentView === "timeline" && (
          <ProjectTimeline
            tasks={board.columns.flatMap(c => c.tasks || [])}
            labels={labels}
            onCreateTask={handleCreateTaskFromTimeline}
          />
        )}

        {/* VIEW: REPORT */}
        {currentView === "report" && (
          <ProjectReport
            tasks={board.columns.flatMap(c => c.tasks || [])}
            members={members}
          />
        )}
      </div>

      {/* === MODALS === */}
      {
        board.selectedTask && (
          <ModalsWorkflow
            isOpen={board.isModalOpen}
            onClose={() => board.setIsModalOpen(false)}
            task={{ ...board.selectedTask, id: String(board.selectedTask.id) }}
            onTaskUpdated={fetchBoard}
          />
        )
      }

      <WorkspaceSettingsSidebar
        isOpen={board.isSettingsOpen}
        onClose={() => board.setIsSettingsOpen(false)}
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
      />

      <MembersManageModal
        isOpen={board.isMembersOpen}
        onClose={() => board.setIsMembersOpen(false)}
        members={members}
      />
    </div >
  );
}
