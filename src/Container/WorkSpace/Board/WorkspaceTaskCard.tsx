import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import {
  Trash2,
  MessageSquare,
  Paperclip,
  CalendarClock,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import { WorkspaceTask } from "@/types/workspace";

interface Props {
  task: WorkspaceTask;
  index: number;
  columnId: string | number;
  onClick: (task: WorkspaceTask) => void;
  onDelete: (colId: string | number, taskId: string | number) => void;
  // ✅ เพิ่ม Prop รับฟังก์ชันกดรับงานด่วน (ต้องส่งมาจากหน้า Board)
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
  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'High': return 'bg-red-50 text-red-600 border-red-100';
      case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Low': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  // ✅ เช็คสถานะงาน: ถ้ามีสมาชิก = มีคนทำแล้ว
  const members = Array.isArray(task.members) ? task.members : [];
  const isAccepted = members.length > 0;

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
                    group relative p-4 rounded-xl border transition-all duration-200
                    ${snapshot.isDragging
                ? "shadow-2xl ring-2 ring-blue-500/20 rotate-2 scale-105 bg-white"
                : isAccepted
                  ? "bg-emerald-50 border-emerald-400 shadow-md" // ✅ สีเขียวเมื่อมีคนรับงาน (ตามโค้ดเพื่อน)
                  : "bg-white border-transparent shadow-sm hover:border-blue-200"
              }
                    ${isAccepted ? "hover:shadow-lg hover:bg-emerald-100/60" : "hover:shadow-md hover:-translate-y-0.5"}
                `}
          >
            {/* --- Header: Tags & Delete --- */}
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

            {/* --- Title --- */}
            <h4 className="text-[14px] font-semibold text-slate-800 leading-snug mb-4 line-clamp-2">
              {task.title}
            </h4>

            {/* --- Footer Info --- */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-50/50">

              {/* ✅ 1. ปุ่มติ๊กถูกหน้าการ์ด (Quick Join) */}
              <div className="flex items-center z-20" onClick={(e) => e.stopPropagation()}>
                {onQuickJoin && (
                  <button
                    onClick={() => onQuickJoin(task.id)}
                    className={`
                                  flex items-center justify-center w-7 h-7 rounded-full transition-all border
                                  ${isAccepted
                        ? "bg-emerald-500 border-emerald-600 text-white shadow-sm hover:bg-red-500 hover:border-red-600"
                        : "bg-slate-50 border-slate-200 text-slate-300 hover:border-emerald-400 hover:text-emerald-500 hover:bg-white"
                      }
                                `}
                    title={isAccepted ? "กดเพื่อยกเลิกรับงาน" : "กดเพื่อรับงานนี้"}
                  >
                    <CheckCircle2 size={16} className={isAccepted ? "fill-white text-emerald-500" : ""} />
                  </button>
                )}
              </div>

              {/* Icons & Stats */}
              <div className="flex items-center gap-2 text-slate-400 ml-auto mr-2">
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
                {/* Always show date when available */}
                {task.date && task.date !== 'No date' && (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <CalendarClock size={12} /> {task.date}
                  </div>
                )}
              </div>

              {/* ✅ 2. รูปโปรไฟล์สมาชิก (Avatar Group) */}
              <div className="flex -space-x-1.5 items-center">
                {members.slice(0, 3).map((m: any, i: number) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full ring-2 ring-white bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600 uppercase shadow-sm overflow-hidden"
                    title={typeof m === 'string' ? m : 'Member'}
                  >
                    {/* ตรวจสอบ URL รูปภาพ */}
                    {typeof m === 'string' && (m.startsWith('http') || m.includes('/') || m.includes('data:image')) ? (
                      <img src={m} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      typeof m === 'string' ? m.substring(0, 2) : '?'
                    )}
                  </div>
                ))}
                {members.length > 3 && (
                  <div className="w-6 h-6 rounded-full ring-2 ring-white bg-slate-50 flex items-center justify-center text-[9px] font-bold text-slate-400">
                    +{members.length - 3}
                  </div>
                )}

                {/* ถ้ายังไม่มีคนรับงาน แสดงปุ่ม + จางๆ */}
                {!isAccepted && (
                  <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                    <UserPlus size={10} />
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
