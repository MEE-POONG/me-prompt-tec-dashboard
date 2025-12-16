import React, { useRef, useEffect } from "react";
import { WorkspaceColumn } from "@/types/workspace";
import { Plus, MoreHorizontal, Edit2, Eraser, Trash2 } from "lucide-react";

interface Props {
  column: WorkspaceColumn;
  children: React.ReactNode;
  onAddTask: (id: string | number) => void;
  onRenameStart: (col: WorkspaceColumn) => void;
  onClearColumn: (id: string | number) => void;
  onDeleteColumn: (id: string | number) => void;
  editingId: string | number | null;
  tempTitle: string;
  onTitleChange: (val: string) => void;
  onSaveTitle: (id: string | number) => void;
  activeMenuId: string | number | null;
  onMenuToggle: (id: string | number | null) => void;
}

export default function WorkspaceBoardColumn({
  column,
  children,
  onAddTask,
  onRenameStart,
  onClearColumn,
  onDeleteColumn,
  editingId,
  tempTitle,
  onTitleChange,
  onSaveTitle,
  activeMenuId,
  onMenuToggle,
}: Props) {
  
  const menuRef = useRef<HTMLDivElement>(null);
  const taskCount = column.tasks?.length || 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onMenuToggle(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onMenuToggle]);

  return (
    // ✅ Remove backdrop-blur and use a solid background color to fix z-index issues
    <div className="flex flex-col h-full max-h-full bg-slate-100 rounded-2xl border border-slate-200/60 shadow-sm"> 
      
      {/* Header */}
      <div className="p-4 pb-2 flex justify-between items-center group">
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
           <div className={`w-2.5 h-2.5 rounded-full ${column.color || 'bg-slate-400'} shadow-sm`}></div>
           
           {editingId === column.id ? (
             <input
               autoFocus
               className="w-full text-sm font-bold bg-white border-2 border-blue-400 rounded px-2 py-1 outline-none text-gray-900"
               value={tempTitle}
               onChange={(e) => onTitleChange(e.target.value)}
               onBlur={() => onSaveTitle(column.id)}
               onKeyDown={(e) => e.key === "Enter" && onSaveTitle(column.id)}
             />
           ) : (
             <h3 className="font-bold text-slate-700 text-[15px] tracking-wide truncate">
               {column.title}
             </h3>
           )}
           <span className="bg-slate-200/80 text-slate-500 text-xs px-2 py-0.5 rounded-md font-bold min-w-6 text-center">
             {taskCount}
           </span>
        </div>

        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
            <button 
                onClick={() => onAddTask(column.id)} 
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
            >
                <Plus size={16} />
            </button>
            <div className="relative">
                <button
                    onClick={() => onMenuToggle(activeMenuId === column.id ? null : column.id)}
                    className={`p-1.5 rounded-lg transition-colors ${activeMenuId === column.id ? "bg-slate-200 text-slate-800" : "hover:bg-slate-200 text-slate-500"}`}
                >
                    <MoreHorizontal size={16} />
                </button>
                {activeMenuId === column.id && (
                     <div ref={menuRef} className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 origin-top-right">
                        <button onClick={() => onRenameStart(column)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><Edit2 size={14}/> Rename</button>
                        <button onClick={() => onClearColumn(column.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><Eraser size={14}/> Clear Tasks</button>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button onClick={() => onDeleteColumn(column.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 size={14}/> Delete</button>
                     </div>
                )}
            </div>
        </div>
      </div>

      {children}

      {!editingId && (
        <div className="p-2 pt-0">
             <button 
                onClick={() => onAddTask(column.id)}
                className="w-full py-2 flex items-center justify-start px-3 gap-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-all text-sm font-medium group"
            >
                <Plus size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span className="opacity-80 group-hover:opacity-100">Add Task</span>
            </button>
        </div>
      )}
    </div>
  );
}