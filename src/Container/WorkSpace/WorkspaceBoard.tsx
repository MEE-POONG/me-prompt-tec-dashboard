// ...existing code...
import React, { useState } from "react";
import { useRouter } from "next/router";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Search, X, Plus, Menu } from "lucide-react";
import ModalsWorkflow from "@/components/ui/workspace/ModalsWorkflow";
import { useWorkspaceBoard } from "@/hooks/useWorkspaceBoard";
import { INITIAL_WORKSPACE_COLUMNS, WORKSPACE_INFO } from "@/constants/workspaceData";
import WorkspaceTaskCard from "./Board/WorkspaceTaskCard";
import WorkspaceBoardColumn from "./Board/WorkspaceBoardColumn";
import WorkspaceSidebar from "./Modal/WorkspaceSidebar";
import { WorkspaceBoardProps } from "@/types/workspace";

export default function WorkspaceBoard({ workspaceId }: WorkspaceBoardProps) {
  const router = useRouter();
  const board = useWorkspaceBoard(INITIAL_WORKSPACE_COLUMNS);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTabBarCollapsed, setIsTabBarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "team" | "activity">("details");

  return (
    <div className="flex flex-col h-full relative">
      {isFilterOpen && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-4 animate-in slide-in-from-top-2 shrink-0 z-20">
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter tasks by name or tag..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm bg-white"
              value={board.searchQuery}
              onChange={(e) => board.setSearchQuery(e.target.value)}
            />
          </div>
          {board.searchQuery && (
            <button
              onClick={() => board.setSearchQuery("")}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Clear
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-0 py-6 items-start flex-1 overflow-hidden bg-white relative">
        {/* === KANBAN BOARD === */}
        <div className="flex-1 w-full min-w-0 h-full">
          <DragDropContext onDragEnd={board.onDragEnd}>
            <div className="flex h-full overflow-x-auto gap-6 px-6 items-start pb-4">
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
                  />

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
                </div>
              ))}

              <div className="min-w-[320px] h-[60px] shrink-0">
                <button className="w-full h-full flex items-center justify-center gap-2 bg-gray-50/50 hover:bg-gray-100 text-gray-500 font-bold rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all">
                  <Plus size={20} /> Add New List
                </button>
              </div>
            </div>
          </DragDropContext>
        </div>

        {/* === SIDEBAR === */}
        <WorkspaceSidebar
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={setIsSidebarOpen}
          isTabBarCollapsed={isTabBarCollapsed}
          onTabBarToggle={setIsTabBarCollapsed}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          workspaceInfo={WORKSPACE_INFO}
        />
      </div>

      {/* === MODAL === */}
      {board.selectedTask && (
        <ModalsWorkflow
          isOpen={board.isModalOpen}
          onClose={() => board.setIsModalOpen(false)}
          // task={board.selectedTask!} // <-- non-null assertion เพิ่มเครื่องหมาย !
        />
      )}
    </div>
  );
}
// ...existing code...