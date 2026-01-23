import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import {
  Trash2,
  MessageSquare,
  Paperclip,
  CalendarClock,
  CheckCircle2,
  ListTodo, // [Icon Checklist]
  AlertCircle // [Icon Warning]
} from "lucide-react";
import { WorkspaceTask } from "@/types/workspace";

interface Props {
  task: WorkspaceTask;
  index: number;
  columnId: string | number;
  onClick: (task: WorkspaceTask) => void;
  onDelete: (colId: string | number, taskId: string | number) => void;
  onQuickJoin?: (taskId: string | number) => void;
}

export default function WorkspaceTaskCard({
  task,
  columnId,
  index,
  onDelete,
  onClick,
  onQuickJoin,
}: Props) {
  // 1. Priority Style
  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'High': return 'bg-red-50 text-red-600 border-red-100';
      case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Low': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  // 2. Assignee & Avatar Logic
  const members = Array.isArray(task.members) ? task.members : [];
  const isAccepted = members.length > 0;

  // 3. Due Date Logic (Check if overdue or near due in 24h)
  const isNearDue = (() => {
    if (!task.rawDueDate) return false;
    const due = new Date(task.rawDueDate).getTime();
    const now = new Date().getTime();
    const diff = due - now;
    return diff < 86400000 && diff > 0; // Less than 24 hours
  })();

  const isOverdue = (() => {
    if (!task.rawDueDate) return false;
    // Basic check: if status is not Done and date passed
    return new Date(task.rawDueDate).getTime() < new Date().getTime() && task.status !== 'Done';
  })();

  // 1. Auto Color Tag Logic
  const getColorForTag = (tag: string) => {
    const t = (tag || "").toLowerCase();
    if (t === 'design') return 'bg-pink-50 text-pink-600 border-pink-100';
    if (t === 'dev' || t === 'frontend' || t === 'backend') return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    if (t === 'marketing') return 'bg-orange-50 text-orange-600 border-orange-100';
    if (t === 'urgent') return 'bg-red-50 text-red-600 border-red-100';
    if (t === 'bug') return 'bg-red-50 text-red-600 border-red-100';
    if (t === 'feature') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    return task.tagColor || 'bg-slate-50 text-slate-500 border-slate-200';
  };

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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
            position: snapshot.isDragging ? (provided.draggableProps.style as any)?.position : "relative",
          }}
          className="mb-3 outline-none"
        >
          <div
            className={`
                    group relative p-4 rounded-xl border transition-colors duration-200 outline-none
                    ${snapshot.isDragging
                ? "shadow-xl ring-2 ring-blue-500/20 bg-white rotate-1 cursor-grabbing z-50"
                : isAccepted
                  ? "bg-white border-blue-100 shadow-sm hover:border-blue-300"
                  : "bg-white border-transparent shadow-sm hover:border-blue-200"
              }
                    ${!snapshot.isDragging && (isAccepted ? "hover:shadow-lg" : "hover:shadow-md hover:-translate-y-0.5")}
                    ${isOverdue ? "border-l-4 border-l-red-500" : ""} 
                `}
          >
            {/* --- Header: Tags & Quick Menu --- */}
            <div className="flex items-start justify-between mb-2.5">
              <div className="flex flex-wrap gap-1.5">
                {/* Priority Badge */}
                {task.priority && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wide border flex items-center gap-1 ${getPriorityStyle(task.priority)}`}>
                    {task.priority === "High" && "🔥"} {task.priority}
                  </span>
                )}
                {/* Auto Color Tag Badge */}
                <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wide border ${getColorForTag(task.tag)}`}>
                  {task.tag}
                </span>
              </div>

              {/* 3. Quick Action Menu */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2 p-1.5 hover:bg-slate-100 rounded-full"
                >
                  {/* Import MoreHorizontal first if needed, otherwise reuse Trash2 for now or icon library */}
                  <span className="text-xl leading-none mb-2">...</span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-6 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <button
                      className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => { setIsMenuOpen(false); onClick(task); }}
                    >
                      <span>View Details</span>
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                      onClick={() => { setIsMenuOpen(false); onDelete(columnId, task.id); }}
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}

                {/* Close menu backdrop */}
                {isMenuOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                )}
              </div>
            </div>

            {/* --- Title --- */}
            <h4 className="text-[14px] font-semibold text-slate-800 leading-snug mb-3 line-clamp-2">
              {task.title}
            </h4>

            {/* 2. Attachment Preview Placeholder */}
            {task.attachments > 0 && (
              <div className="mb-3">
                <div className="h-10 w-full bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2 px-3 text-xs text-slate-500">
                  <Paperclip size={14} className="text-blue-400" />
                  <span className="font-medium truncate">{task.attachments} attachment(s)</span>
                </div>
              </div>
            )}

            {/* --- Checklist Bar (Optional) --- */}
            {/* Note: This assumes `task.checklist` is a number or object. Adjust based on real data. 
                 If simple number (e.g. count), show icon. If object {done: 2, total: 5}, show bar. 
                 Using simple icon logic for now based on current prop type `number`. */}
            {(task.checklist || 0) > 0 && (
              <div className="mb-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                <div className="bg-emerald-400 h-full w-1/2"></div> {/* Mockup: 50% */}
              </div>
            )}

            {/* --- Footer Info --- */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">

              {/* List of members (Avatars) */}
              <div className="flex -space-x-1.5 items-center mr-auto">
                {members.slice(0, 3).map((m: any, i: number) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full ring-2 ring-white bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600 uppercase shadow-sm overflow-hidden"
                    title={typeof m === 'object' ? (m as any).name : m}
                  >
                    {(() => {
                      const avatarUrl = typeof m === 'object' ? ((m as any).userAvatar || (m as any).avatar) : m;
                      const name = typeof m === 'object' ? (m as any).name : m;
                      const hasAvatar = avatarUrl && (typeof avatarUrl === 'string') &&
                        (avatarUrl.startsWith("http") || avatarUrl.startsWith("/") || avatarUrl.startsWith("data:"));

                      return hasAvatar ? (
                        <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        (name || "?").substring(0, 2).toUpperCase()
                      );
                    })()}
                  </div>
                ))}
                {members.length > 3 && (
                  <div className="w-6 h-6 rounded-full ring-2 ring-white bg-slate-50 flex items-center justify-center text-[9px] font-bold text-slate-400">
                    +{members.length - 3}
                  </div>
                )}
                {/* Quick Join Button (Ghost) */}
                {!isAccepted && onQuickJoin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onQuickJoin(task.id) }}
                    className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-300 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                    title="Assign to me"
                  >
                    <CheckCircle2 size={12} />
                  </button>
                )}
              </div>

              {/* Icons & Stats */}
              <div className="flex items-center gap-3 text-slate-400">
                {/* Date with Color Code */}
                {task.date && task.date !== 'No date' && (
                  <div className={`flex items-center gap-1 text-[11px] font-medium 
                    ${isOverdue ? "text-red-500 bg-red-50 px-1.5 py-0.5 rounded" :
                      isNearDue ? "text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded" : "text-slate-400"}`
                  }>
                    {isOverdue ? <AlertCircle size={12} /> : <CalendarClock size={12} />}
                    {task.date}
                  </div>
                )}

                {(task.checklist || 0) > 0 && (
                  <div className="flex items-center gap-0.5 text-xs font-medium text-slate-400">
                    <ListTodo size={13} /> <span>{task.checklist}</span>
                  </div>
                )}

                {(task.comments > 0 || task.attachments > 0) && (
                  <div className="flex items-center gap-2">
                    {task.comments > 0 && (
                      <div className="flex items-center gap-0.5 text-xs font-medium">
                        <MessageSquare size={13} /> {task.comments}
                      </div>
                    )}
                    {task.attachments > 0 && (
                      <div className="flex items-center gap-0.5 text-xs font-medium">
                        <Paperclip size={13} /> {task.attachments}
                      </div>
                    )}
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
