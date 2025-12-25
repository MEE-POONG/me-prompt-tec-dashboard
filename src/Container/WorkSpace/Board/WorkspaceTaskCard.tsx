import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Trash2, MessageSquare, Paperclip, CalendarClock } from "lucide-react";
import { WorkspaceTask } from "@/types/workspace";

interface Props {
  task: WorkspaceTask;
  index: number;
  columnId: string | number;
  onClick: (task: WorkspaceTask) => void;
  onDelete: (colId: string | number, taskId: string | number) => void;
}

export default function WorkspaceTaskCard({
  task,
  columnId,
  index,
  onDelete,
  onClick,
}: Props) {

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'High': return 'bg-red-50 text-red-600 border-red-100';
      case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Low': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          // ✅ บังคับ Z-Index และ Position ให้ถูกต้องตอนลาก
          style={{
            ...provided.draggableProps.style,
            zIndex: snapshot.isDragging ? 9999 : "auto",
            position: snapshot.isDragging ? (provided.draggableProps.style as any)?.position : "relative",
          }}
          className="mb-3 outline-none"
        >
          <div
            className={`
                    group relative bg-white p-4 rounded-xl border border-transparent 
                    transition-all duration-200
                    ${snapshot.isDragging
                ? "shadow-2xl ring-2 ring-blue-500/20 rotate-2 scale-105"
                : "border-slate-200/50 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              }
                `}
          >
            <div className="flex items-start justify-between mb-2.5">
              <div className="flex flex-wrap gap-1.5">
                <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wide border ${task.tagColor || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  {task.tag}
                </span>
                {task.priority && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wide border flex items-center gap-1 ${getPriorityStyle(task.priority)}`}>
                    {task.priority === "High" && "🔥"} {task.priority}
                  </span>
                )}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); onDelete(columnId, task.id); }}
                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1 p-1 hover:bg-red-50 rounded"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <h4 className="text-[14px] font-semibold text-slate-800 leading-snug mb-4 line-clamp-2">
              {task.title}
            </h4>

            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
              <div className="flex items-center gap-3 text-slate-400">
                {task.comments > 0 && (
                  <div className="flex items-center gap-1 text-xs font-medium hover:text-slate-600 transition-colors">
                    <MessageSquare size={13} strokeWidth={2.5} /> {task.comments}
                  </div>
                )}

                {task.attachments > 0 && (
                  <div className="flex items-center gap-1 text-xs font-medium hover:text-slate-600 transition-colors">
                    <Paperclip size={13} strokeWidth={2.5} /> {task.attachments}
                  </div>
                )}

                {/* Always show date when available */}
                {task.date && task.date !== 'No date' && (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <CalendarClock size={12} /> {task.date}
                  </div>
                )}
              </div>

              <div className="flex -space-x-1.5 items-center pl-2">
                {task.members?.slice(0, 3).map((m: any, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] font-bold uppercase shadow-sm overflow-hidden ${m.avatar ? 'bg-white' : 'bg-linear-to-br from-slate-100 to-slate-200 text-slate-600'}`}
                    title={m.name || "Unknown"}
                  >
                    {m.avatar ? (
                      <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      (m.name || "?").substring(0, 2)
                    )}
                  </div>
                ))}
                {task.members?.length > 3 && (
                  <div className="w-6 h-6 rounded-full ring-2 ring-white bg-slate-50 flex items-center justify-center text-[9px] font-bold text-slate-400">
                    +{task.members.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}