import React, { useState } from "react";
import { useRouter } from "next/router";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { Search, X, Plus, LayoutDashboard, KanbanSquare, CalendarDays, FileBarChart } from "lucide-react";
import ModalsWorkflow from "@/components/ui/workspace/ModalsWorkflow";
import { useWorkspaceBoard } from "@/hooks/useWorkspaceBoard";
import { INITIAL_WORKSPACE_COLUMNS, WORKSPACE_INFO } from "@/constants/workspaceData";
import { WorkspaceBoardProps } from "@/types/workspace";

// Imports Components
import WorkspaceTaskCard from "./Board/WorkspaceTaskCard";
import WorkspaceBoardColumn from "./Board/WorkspaceBoardColumn";
import WorkspaceHeader from "./WorkspaceHeader"; 

// Modals
import { WorkspaceSettingsSidebar, MembersManageModal } from "./WorkspacePageModals"; 

// Import Views
import ProjectDashboard from "./Views/ProjectDashboard";
import ProjectTimeline from "./Views/ProjectTimeline";
import ProjectReport from "./Views/ProjectReport"; 

export default function WorkspaceBoard({ workspaceId }: WorkspaceBoardProps) {
  const router = useRouter();
  const board = useWorkspaceBoard(INITIAL_WORKSPACE_COLUMNS);
  
  // State สำหรับ Filter และ View
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"board" | "dashboard" | "timeline" | "report">("board");

  return (
    <div className="flex flex-col h-full relative bg-white">
      {/* 1. Header ด้านบนสุด */}
      <WorkspaceHeader 
        workspaceInfo={WORKSPACE_INFO}
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        onOpenSettings={() => board.setIsSettingsOpen(true)}
        onOpenMembers={() => board.setIsMembersOpen(true)}
      />

      {/* 2. View Switcher & Filter Bar */}
      <div className="border-b border-gray-200 bg-white">
          <div className="px-6 flex items-center justify-between">
            {/* View Tabs */}
            <div className="flex items-center gap-6">
                <button 
                    onClick={() => setCurrentView("board")}
                    className={`flex items-center gap-2 py-3 text-sm font-bold border-b-2 transition-all ${currentView === "board" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                    <KanbanSquare size={18} /> Board
                </button>
                <button 
                    onClick={() => setCurrentView("dashboard")}
                    className={`flex items-center gap-2 py-3 text-sm font-bold border-b-2 transition-all ${currentView === "dashboard" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                    <LayoutDashboard size={18} /> Dashboard
                </button>
                <button 
                    onClick={() => setCurrentView("timeline")}
                    className={`flex items-center gap-2 py-3 text-sm font-bold border-b-2 transition-all ${currentView === "timeline" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                    <CalendarDays size={18} /> Timeline
                </button>
                 <button 
                    onClick={() => setCurrentView("report")}
                    className={`flex items-center gap-2 py-3 text-sm font-bold border-b-2 transition-all ${currentView === "report" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                    <FileBarChart size={18} /> Reports <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded ml-1">New</span>
                </button>
            </div>

            {/* Filter Input */}
            {isFilterOpen && (
                <div className="relative w-64 py-2">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                    type="text"
                    placeholder="Filter..."
                    className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm bg-gray-50"
                    value={board.searchQuery}
                    onChange={(e) => board.setSearchQuery(e.target.value)}
                    />
                </div>
            )}
          </div>
      </div>

      {/* 3. Main Content Area */}
      <div className="flex-1 w-full h-full overflow-hidden bg-white relative">
            
            {/* VIEW: BOARD */}
            {currentView === "board" && (
                <div className="h-full pt-6">
                    <DragDropContext onDragEnd={board.onDragEnd}>
                        <div className="flex h-full overflow-x-auto gap-6 px-6 items-start pb-4 custom-scrollbar">
                        {board.columns.map((col) => (
                            <div
                                key={col.id}
                                className="min-w-[320px] w-[320px] flex flex-col bg-gray-50/50 rounded-2xl border border-gray-200/60 h-full max-h-full transition-colors shrink-0"
                            >
                                <WorkspaceBoardColumn
                                    column={col}
                                    onAddTask={board.setIsAddingTask}
                                    onRenameStart={board.handleRenameColumnStart}
                                    onClearColumn={board.handleClearColumn}
                                    onDeleteColumn={board.handleDeleteColumn}
                                    editingId={board.editingColumnId}
                                    tempTitle={board.tempColumnTitle}
                                    onTitleChange={board.setTempColumnTitle}
                                    onSaveTitle={board.handleRenameColumnSave}
                                    activeMenuId={board.activeMenuColumnId}
                                    onMenuToggle={board.setActiveMenuColumnId}
                                >
                                    <Droppable droppableId={String(col.id)}>
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
                                            {board.filterTasks(col.tasks).map((task, index) => (
                                            <WorkspaceTaskCard
                                                key={task.id}
                                                task={task}
                                                columnId={col.id}
                                                index={index}
                                                onDelete={board.handleDeleteTask}
                                                onClick={board.handleOpenTaskModal}
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
                                                onChange={(e) => board.setNewTaskTitle(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    board.handleAddTask(col.id);
                                                    }
                                                }}
                                                />
                                                <div className="flex items-center justify-between gap-2 mt-2">
                                                <button
                                                    onClick={() => board.handleAddTask(col.id)}
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
                                                <Plus size={18} className="text-gray-400 group-hover:text-blue-500" />
                                                Add Task
                                            </button>
                                            )}
                                        </div>
                                        )}
                                    </Droppable>
                                </WorkspaceBoardColumn>
                            </div>
                        ))}

                        {/* Add New List Button */}
                        <div className="min-w-[320px] shrink-0">
                            {board.isAddingColumn ? (
                                <div className="bg-white p-4 rounded-2xl shadow-xl border border-blue-200 animate-in fade-in zoom-in-95 ring-4 ring-blue-50/50">
                                    <input
                                        autoFocus
                                        placeholder="Enter list title..."
                                        className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400 font-bold bg-transparent mb-4 px-1"
                                        value={board.newColumnTitle}
                                        onChange={(e) => board.setNewColumnTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") board.handleAddColumn();
                                            if (e.key === "Escape") board.setIsAddingColumn(false);
                                        }}
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={board.handleAddColumn}
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
                        </div>
                    </DragDropContext>
                </div>
            )}

            {/* VIEW: DASHBOARD */}
            {currentView === "dashboard" && <ProjectDashboard />}

            {/* VIEW: TIMELINE */}
            {currentView === "timeline" && <ProjectTimeline />}

            {/* VIEW: REPORT */}
            {currentView === "report" && <ProjectReport />}

      </div>

      {/* === MODALS === */}
      {board.selectedTask && (
        <ModalsWorkflow
          isOpen={board.isModalOpen}
          onClose={() => board.setIsModalOpen(false)}
        //   task={board.selectedTask} 
        />
      )}

      <WorkspaceSettingsSidebar 
        isOpen={board.isSettingsOpen}
        onClose={() => board.setIsSettingsOpen(false)}
        workspaceInfo={WORKSPACE_INFO}
      />
      
      <MembersManageModal 
        isOpen={board.isMembersOpen}
        onClose={() => board.setIsMembersOpen(false)}
        members={WORKSPACE_INFO.members}
      />
    </div>
  );
}