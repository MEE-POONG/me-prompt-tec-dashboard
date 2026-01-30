import React, { useState } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import ModalsWorkflow from "@/components/ui/workspace/ModalsWorkflow";
import { useWorkspaceBoard } from "@/hooks/useWorkspaceBoard";
import { WorkspaceBoardProps } from "@/types/workspace";
import { useSocket } from "@/hooks/useSocket";

// Custom Hooks
import { useWorkspaceLogic } from "./hooks/useWorkspaceLogic";

// Components
import WorkspaceBoardColumn from "./Board/WorkspaceBoardColumn";
import WorkspaceTaskCard from "./Board/WorkspaceTaskCard"; // Import TaskCard
import WorkspaceHeader from "./WorkspaceHeader";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";
import ModalError from "@/components/ui/Modals/ModalError";
import ModalDelete from "@/components/ui/Modals/ModalsDelete";

// Modals
import {
  WorkspaceSettingsSidebar,
  MembersManageModal,
} from "./WorkspacePageModals";

// Views
import ProjectDashboard from "./Views/ProjectDashboard";
import ProjectTimeline from "./Views/ProjectTimeline";
import ProjectReport from "./Views/ProjectReport";
import { Loader2, Plus, X } from "lucide-react";

export default function WorkspaceBoard({ workspaceId }: WorkspaceBoardProps) {
  // Hooks
  const board = useWorkspaceBoard([]);
  const socketData = useSocket();
  const socket = socketData?.socket;

  // Logic Hook
  const logic = useWorkspaceLogic(workspaceId, board, socket);

  // Local UI State
  const [currentView, setCurrentView] = useState<"board" | "dashboard" | "timeline" | "report">("board");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Modal States
  const [successModal, setSuccessModal] = useState({ open: false, message: "", description: "" });
  const [errorModal, setErrorModal] = useState({ open: false, message: "", description: "" });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    message: "",
    onConfirm: () => { }
  });

  // --- Handlers Wrapper (UI + Logic) ---

  const handleDragEndWrapper = async (result: DropResult) => {
    if (logic.isReadOnly) return;
    board.onDragEnd(result);

    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    try {
      await logic.handleMoveTaskApi(draggableId, destination);
    } catch (error: any) {
      setErrorModal({ open: true, message: "Failed to move task", description: error.message });
    }
  };

  const onAddColumn = async () => {
    try {
      await logic.handleAddColumnApi();
    } catch (error: any) {
      setErrorModal({ open: true, message: "Create Column Failed", description: error.message });
    }
  };

  const onRenameColumn = async (colId: string | number) => {
    try {
      await logic.handleRenameColumnSaveApi(colId);
    } catch (error: any) {
      setErrorModal({ open: true, message: "Rename Failed", description: error.message });
    }
  };

  const onAddTask = async (colId: string | number) => {
    try {
      await logic.handleAddTaskApi(colId);
    } catch (error: any) {
      setErrorModal({ open: true, message: "Create Task Failed", description: error.message });
    }
  };

  const confirmDeleteTask = (colId: string | number, taskId: string | number) => {
    const taskTitle = board.columns.find(c => c.id === colId)?.tasks?.find(t => t.id === taskId)?.title || "task";
    setDeleteModal({
      open: true,
      message: `ต้องการลบงาน "${taskTitle}" ใช่หรือไม่?`,
      onConfirm: async () => {
        try {
          await logic.handleDeleteTaskApi(colId, taskId);
          setDeleteModal(prev => ({ ...prev, open: false }));
        } catch (error: any) {
          setDeleteModal(prev => ({ ...prev, open: false }));
          setErrorModal({ open: true, message: "Delete Failed", description: error.message });
        }
      }
    });
  };

  const confirmDeleteColumn = (colId: string | number) => {
    const colTitle = board.columns.find(c => c.id === colId)?.title || "list";
    setDeleteModal({
      open: true,
      message: `ต้องการลบลิสต์ "${colTitle}" ใช่หรือไม่?`,
      onConfirm: async () => {
        try {
          await logic.handleDeleteColumnApi(colId);
          setDeleteModal(prev => ({ ...prev, open: false }));
        } catch (error: any) {
          setDeleteModal(prev => ({ ...prev, open: false }));
          setErrorModal({ open: true, message: "Delete Failed", description: error.message });
        }
      }
    });
  };

  const confirmClearColumn = (colId: string | number) => {
    const colTitle = board.columns.find(c => c.id === colId)?.title || "list";
    setDeleteModal({
      open: true,
      message: `ต้องการล้างงานทั้งหมดในลิสต์ "${colTitle}" ใช่หรือไม่?`,
      onConfirm: async () => {
        try {
          await logic.handleClearColumnApi(colId);
          setDeleteModal(prev => ({ ...prev, open: false }));
        } catch (error: any) {
          setDeleteModal(prev => ({ ...prev, open: false }));
          setErrorModal({ open: true, message: "Clear Failed", description: error.message });
        }
      }
    });
  };

  // --- Views ---

  if (logic.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (logic.error) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4">
        <div className="text-red-500 font-bold text-xl">Error Loading Board</div>
        <p className="text-gray-600">{logic.error}</p>
      </div>
    );
  }

  // Derive flat tasks for Views
  const allTasks = board.columns.flatMap(c =>
    (c.tasks || []).map(t => ({
      ...t,
      columnTitle: c.title,
      columnId: c.id
    }))
  );

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <WorkspaceHeader
        workspaceInfo={logic.workspaceInfo}

        // Actions
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        isFilterOpen={isFilterOpen}
        onOpenMembers={() => board.setIsMembersOpen(true)}
        onOpenSettings={() => board.setIsSettingsOpen(true)}
        onRefresh={logic.fetchBoard}

        // Notifications
        notifications={logic.notifications}
        onClearNotifications={() => logic.setNotifications([])}
        onMarkAsRead={(id) => logic.setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))}
        onMarkAllAsRead={() => logic.setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {currentView === "board" && (
          <div className="h-full overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
            <DragDropContext onDragEnd={handleDragEndWrapper}>
              <div className="flex h-full gap-6 items-start">
                {(board.columns || []).map((column) => (
                  <WorkspaceBoardColumn
                    key={column.id}
                    column={column}

                    // Logic Hooks mapping
                    editingId={board.editingColumnId}
                    tempTitle={board.tempColumnTitle}
                    onTitleChange={board.setTempColumnTitle}
                    onSaveTitle={onRenameColumn}
                    onRenameStart={board.handleRenameColumnStart}

                    activeMenuId={board.activeMenuColumnId}
                    onMenuToggle={board.setActiveMenuColumnId}

                    onDeleteColumn={confirmDeleteColumn}
                    onClearColumn={confirmClearColumn}

                    isAdding={board.isAddingTask === column.id}
                    onAddTask={onAddTask}
                    onCreateTask={async (id, title) => {
                      board.setNewTaskTitle(title);
                      await onAddTask(id);
                    }}
                    isReadOnly={logic.isReadOnly}
                  >
                    {/* Droppable Area for Tasks */}
                    <Droppable droppableId={String(column.id)} type="TASK">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 overflow-y-auto min-h-[50px] px-2 py-2 space-y-3 custom-scrollbar ${snapshot.isDraggingOver ? "bg-blue-50/50 rounded-lg transition-colors" : ""
                            }`}
                          style={{ maxHeight: "calc(100vh - 280px)" }} // Approx height calc to allow scroll
                        >
                          {board.filterTasks(column.tasks).map((task, index) => (
                            <WorkspaceTaskCard
                              key={task.id}
                              task={task}
                              index={index}
                              columnId={column.id}
                              onClick={board.handleOpenTaskModal}
                              onDelete={confirmDeleteTask}
                            />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </WorkspaceBoardColumn>
                ))}

                {/* Add Column Button / Form */}
                {!logic.isReadOnly && (
                  <div className="shrink-0 w-80">
                    {board.isAddingColumn ? (
                      <div className="bg-white p-3 rounded-xl shadow-lg border border-indigo-100 animate-in fade-in zoom-in duration-200">
                        <input
                          autoFocus
                          type="text"
                          placeholder="Enter list title..."
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 text-sm"
                          value={board.newColumnTitle}
                          onChange={(e) => board.setNewColumnTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") onAddColumn();
                            if (e.key === "Escape") board.setIsAddingColumn(false);
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={onAddColumn}
                            className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                          >
                            Add List
                          </button>
                          <button
                            onClick={() => board.setIsAddingColumn(false)}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                          >
                            <div className="sr-only">Cancel</div>
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => board.setIsAddingColumn(true)}
                        className="w-full flex items-center gap-2 p-4 rounded-xl bg-white/50 hover:bg-white border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-500 hover:text-blue-600 transition-all font-semibold"
                      >
                        <div className="p-1 bg-current rounded-md text-white/90">
                          <Plus size={16} strokeWidth={3} className="text-white" />
                        </div>
                        Add Another List
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
            members={logic.members}
            tasks={allTasks}
          />
        )}

        {currentView === "timeline" && (
          <ProjectTimeline
            tasks={allTasks}
            onCreateTask={logic.handleCreateTaskFromTimeline}
            isReadOnly={logic.isReadOnly}
          />
        )}

        {currentView === "report" && (
          <ProjectReport
            tasks={allTasks}
            members={logic.members}
          />
        )}
      </div>

      {/* Global Modals */}
      <ModalsWorkflow
        isOpen={board.isModalOpen}
        onClose={() => board.setIsModalOpen(false)}
        task={board.selectedTask}
        onTaskUpdated={logic.fetchBoard}
        isReadOnly={logic.isReadOnly}
      />

      <WorkspaceSettingsSidebar
        isOpen={board.isSettingsOpen}
        onClose={() => board.setIsSettingsOpen(false)}
        workspaceInfo={logic.workspaceInfo}
        boardId={workspaceId}
      />

      <MembersManageModal
        isOpen={board.isMembersOpen}
        onClose={() => board.setIsMembersOpen(false)}
        members={logic.members}
        workspaceId={workspaceId}
        currentUser={logic.currentUser}
        onMemberAdded={logic.fetchBoard}
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
        onClose={() => setErrorModal({ ...errorModal, open: false })}
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
