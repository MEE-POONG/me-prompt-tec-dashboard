import { useState } from "react";
import { WorkspaceColumn, WorkspaceTask } from "@/types/workspace";
import { DropResult } from "@hello-pangea/dnd";

export function useWorkspaceBoard(initialData: WorkspaceColumn[]) {
  const [columns, setColumns] = useState<WorkspaceColumn[]>(initialData);

  // State เดิม
  const [isAddingTask, setIsAddingTask] = useState<string | number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<WorkspaceTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | number | null>(null);
  const [tempColumnTitle, setTempColumnTitle] = useState("");
  const [activeMenuColumnId, setActiveMenuColumnId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);

  // ✅ เพิ่ม State ใหม่สำหรับ Add Column
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  // ... (ฟังก์ชัน onDragEnd, handleRename, handleDelete, handleClear เก็บไว้เหมือนเดิม) ...
  const onDragEnd = (result: DropResult) => {
    // (ใช้โค้ดเดิมของคุณตรงนี้)
    const { destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const startColIndex = columns.findIndex((c) => c.id === source.droppableId);
    const endColIndex = columns.findIndex((c) => c.id === destination.droppableId);
    const startCol = columns[startColIndex];
    const endCol = columns[endColIndex];

    if (source.droppableId === destination.droppableId) {
      const newTasks = Array.from(startCol.tasks || []);
      const [movedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, movedTask);
      const newColumns = [...columns];
      newColumns[startColIndex] = { ...startCol, tasks: newTasks };
      setColumns(newColumns);
      return;
    }

    const startTasks = Array.from(startCol.tasks || []);
    const [movedTask] = startTasks.splice(source.index, 1);
    // Ensure the moved task's status reflects the destination column title
    try { movedTask.status = endCol.title || movedTask.status || "To Do"; } catch (e) { /* ignore if shaped differently */ }
    const endTasks = Array.from(endCol.tasks || []);
    endTasks.splice(destination.index, 0, movedTask);
    const newColumns = [...columns];
    newColumns[startColIndex] = { ...startCol, tasks: startTasks };
    newColumns[endColIndex] = { ...endCol, tasks: endTasks };
    setColumns(newColumns);
  };

  const handleRenameColumnStart = (col: WorkspaceColumn) => {
    setEditingColumnId(col.id);
    setTempColumnTitle(col.title);
    setActiveMenuColumnId(null);
  };

  const handleRenameColumnSave = (colId: string | number) => {
    if (tempColumnTitle.trim())
      setColumns(columns.map((c) => c.id === colId ? { ...c, title: tempColumnTitle } : c));
    setEditingColumnId(null);
  };

  const handleDeleteColumn = (colId: string | number) => {
    if (confirm("Delete this list?")) {
      setColumns(columns.filter((c) => c.id !== colId));
    }
    setActiveMenuColumnId(null);
  };

  const handleClearColumn = (colId: string | number) => {
    if (confirm("Clear all tasks?"))
      setColumns(columns.map((c) => (c.id === colId ? { ...c, tasks: [] } : c)));
    setActiveMenuColumnId(null);
  };

  const handleAddTask = (columnId: string | number) => {
    if (!newTaskTitle.trim()) return;
    const newTask: WorkspaceTask = {
      id: `new-${Date.now()}`,
      title: newTaskTitle,
      tag: "General",
      tagColor: "bg-gray-100 text-gray-600",
      priority: "Medium",
      members: [],
      comments: 0,
      attachments: 0,
      date: "Today",
    };
    setColumns(columns.map((col) => col.id === columnId ? { ...col, tasks: [...(col.tasks || []), newTask] } : col));
    setNewTaskTitle("");
    setIsAddingTask(null);
  };

  const handleDeleteTask = (columnId: string | number, taskId: string | number) => {
    if (confirm("Delete this task?")) {
      setColumns(columns.map((col) => col.id === columnId ? { ...col, tasks: (col.tasks || []).filter((t) => t.id !== taskId) } : col));
    }
  };

  const filterTasks = (tasks: WorkspaceTask[] | undefined) => {
    if (!tasks) return [];

    let filtered = tasks;

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.tag.toLowerCase().includes(q)
      );
    }

    // Filter by selected labels
    if (selectedLabels.length > 0) {
      filtered = filtered.filter((t) => selectedLabels.includes(t.tag));
    }

    return filtered;
  };

  const handleOpenTaskModal = (task: WorkspaceTask) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // ✅ ฟังก์ชันใหม่: เพิ่ม Column
  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    const newCol: WorkspaceColumn = {
      id: `col-${Date.now()}`,
      title: newColumnTitle,
      tasks: [],
      color: "bg-gray-400",
    };
    setColumns([...columns, newCol]);
    setNewColumnTitle("");
    setIsAddingColumn(false);
  };

  return {
    columns, setColumns,
    isAddingTask, setIsAddingTask,
    newTaskTitle, setNewTaskTitle,
    selectedTask, setSelectedTask,
    isModalOpen, setIsModalOpen,
    editingColumnId, setEditingColumnId,
    tempColumnTitle, setTempColumnTitle,
    activeMenuColumnId, setActiveMenuColumnId,
    searchQuery, setSearchQuery,
    selectedLabels, setSelectedLabels,
    isSettingsOpen, setIsSettingsOpen,
    isMembersOpen, setIsMembersOpen,

    // Exports เดิม
    onDragEnd, handleRenameColumnStart, handleRenameColumnSave,
    handleDeleteColumn, handleClearColumn, handleAddTask,
    handleDeleteTask, handleOpenTaskModal, filterTasks,

    // ✅ Exports ใหม่สำหรับ Add Column
    isAddingColumn, setIsAddingColumn,
    newColumnTitle, setNewColumnTitle,
    handleAddColumn
  };
}