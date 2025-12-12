import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Trash2, MessageSquare, Paperclip, AlertCircle, Calendar } from "lucide-react";
import { WorkspaceTask } from "@/types/workspace";

interface WorkspaceTaskCardProps {
  task: WorkspaceTask;
  columnId: string | number;
  index: number;
  onDelete: (columnId: string | number, taskId: string | number) => void;
  onClick: (task: WorkspaceTask) => void;
}

export default function WorkspaceTaskCard({
  task,
  columnId,
  index,
  onDelete,
  onClick,
}: WorkspaceTaskCardProps) {
  return (
    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          style={{
            ...provided.draggableProps.style,
            zIndex: snapshot.isDragging ? 9999 : "auto",
            cursor: snapshot.isDragging ? "grabbing" : "grab",
          }}
          className={`bg-white p-4 rounded-xl border group relative transition-all duration-200 ${
            snapshot.isDragging
              ? "shadow-2xl ring-2 ring-blue-500 border-transparent opacity-100 rotate-2 scale-105"
              : "border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(columnId, task.id);
            }}
            className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all z-20"
          >
            <Trash2 size={14} />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${task.tagColor}`}>
              {task.tag}
            </span>
            {task.priority === "High" && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-red-50 text-red-600 rounded-md">
                <AlertCircle size={10} /> High
              </span>
            )}
          </div>

          <h4 className="text-gray-800 font-semibold mb-4 text-sm leading-snug pr-6">
            {task.title}
          </h4>

          <div className="flex justify-between items-center pt-3 border-t border-gray-50">
            <div className="flex -space-x-2">
              {task.members.map((m, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-linear-to-br from-blue-100 to-indigo-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-blue-700 ring-1 ring-white"
                >
                  {m}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {(task.comments > 0 || task.attachments > 0) && (
                <div className="flex items-center gap-2 text-gray-400">
                  {task.comments > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <MessageSquare size={14} />
                      <span>{task.comments}</span>
                    </div>
                  )}
                  {task.attachments > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <Paperclip size={14} />
                      <span>{task.attachments}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1 text-gray-400 text-[10px] font-medium bg-gray-50 px-2 py-1 rounded-md">
                <Calendar size={12} />
                <span>{task.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}