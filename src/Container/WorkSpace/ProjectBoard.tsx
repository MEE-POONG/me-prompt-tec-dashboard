import React, { useState } from "react";
import { MoreHorizontal, Plus, Calendar, UserCircle2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  tag: string;
  members: number;
  date: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

interface ProjectBoardProps {
  projectId?: string;
}

export default function ProjectBoard({ projectId }: ProjectBoardProps) {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "todo",
      title: "To Do",
      color: "bg-gray-500",
      tasks: [
        {
          id: "t1",
          title: "Research competitors",
          tag: "Research",
          members: 3,
          date: "Nov 24",
        },
        {
          id: "t2",
          title: "Draft project proposal",
          tag: "Planning",
          members: 2,
          date: "Nov 25",
        },
      ],
    },
    {
      id: "inprogress",
      title: "In Progress",
      color: "bg-blue-500",
      tasks: [
        {
          id: "t3",
          title: "Design homepage",
          tag: "Design",
          members: 4,
          date: "Nov 28",
        },
      ],
    },
    {
      id: "review",
      title: "Review",
      color: "bg-yellow-500",
      tasks: [
        {
          id: "t4",
          title: "Code review for auth",
          tag: "Development",
          members: 2,
          date: "Nov 23",
        },
      ],
    },
    {
      id: "done",
      title: "Done",
      color: "bg-green-500",
      tasks: [
        {
          id: "t5",
          title: "Setup project repo",
          tag: "DevOps",
          members: 1,
          date: "Nov 20",
        },
      ],
    },
  ]);

  const [draggedTask, setDraggedTask] = useState<{
    taskId: string;
    sourceColId: string;
  } | null>(null);

  const onDragStart = (
    e: React.DragEvent,
    taskId: string,
    sourceColId: string
  ) => {
    setDraggedTask({ taskId, sourceColId });
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, destColId: string) => {
    e.preventDefault();

    if (!draggedTask) return;
    if (draggedTask.sourceColId === destColId) return;

    const newColumns = columns.map((col) => {
      // Remove from source
      if (col.id === draggedTask.sourceColId) {
        return {
          ...col,
          tasks: col.tasks.filter((t) => t.id !== draggedTask.taskId),
        };
      }
      // Add to destination
      if (col.id === destColId) {
        const sourceCol = columns.find((c) => c.id === draggedTask.sourceColId);
        const taskToMove = sourceCol?.tasks.find(
          (t) => t.id === draggedTask.taskId
        );
        if (taskToMove) {
          return { ...col, tasks: [...col.tasks, taskToMove] };
        }
      }
      return col;
    });

    setColumns(newColumns);
    setDraggedTask(null);
  };

  return (
    <div className="flex h-full overflow-x-auto gap-6 pb-4">
      {columns.map((col) => (
        <div
          key={col.id}
          className="min-w-[300px] w-[300px] flex flex-col bg-gray-50 rounded-xl border border-gray-200 h-full max-h-full transition-colors"
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, col.id)}
        >
          {/* Column Header */}
          <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-white rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${col.color}`} />
              <h3 className="font-bold text-gray-700">{col.title}</h3>
              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-medium">
                {col.tasks.length}
              </span>
            </div>
            <div className="flex gap-1">
              <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                <Plus size={18} />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          {/* Tasks List */}
          <div
            className={`p-3 flex-1 overflow-y-auto space-y-3 ${
              draggedTask && draggedTask.sourceColId !== col.id
                ? "bg-gray-100/50"
                : ""
            }`}
          >
            {col.tasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => onDragStart(e, task.id, col.id)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-md">
                    {task.tag}
                  </span>
                  <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
                <h4 className="text-gray-800 font-semibold mb-3 leading-snug">
                  {task.title}
                </h4>
                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                  <div className="flex -space-x-2">
                    {[...Array(task.members)].map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] text-gray-500"
                      >
                        <UserCircle2 size={16} />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Calendar size={14} />
                    <span>{task.date}</span>
                  </div>
                </div>
              </div>
            ))}

            <button className="w-full py-2 flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg border border-dashed border-gray-300 transition-colors text-sm font-medium">
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
