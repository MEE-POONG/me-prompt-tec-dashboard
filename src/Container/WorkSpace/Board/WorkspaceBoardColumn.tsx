import React, { useRef, useEffect } from "react";
import { WorkspaceColumn } from "@/types/workspace";
import { Plus, MoreHorizontal, Edit2, X, Trash2 } from "lucide-react";

interface WorkspaceBoardColumnProps {
  column: WorkspaceColumn;
  onAddTask: (columnId: string | number) => void;
  onRenameStart: (column: WorkspaceColumn) => void;
  onClearColumn: (columnId: string | number) => void;
  onDeleteColumn: (columnId: string | number) => void;
  editingId: string | number | null;
  tempTitle: string;
  onTitleChange: (value: string) => void;
  onSaveTitle: (columnId: string | number) => void;
  activeMenuId: string | number | null;
  onMenuToggle: (columnId: string | number | null) => void;
}

export default function WorkspaceBoardColumn({
  column,
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
}: WorkspaceBoardColumnProps) {
  const menuRef = useRef<HTMLDivElement>(null);

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
    <div className="p-4 flex justify-between items-center bg-transparent sticky top-0 z-10 group">
      <div className="flex items-center gap-3 flex-1">
        {editingId === column.id ? (
          <div className="flex items-center gap-1 w-full mr-1">
            <input
              autoFocus
              className="w-full text-sm font-bold bg-white border-2 border-blue-400 rounded px-2 py-1 outline-none text-gray-900"
              value={tempTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveTitle(column.id);
                if (e.key === "Escape") onMenuToggle(null);
              }}
              onBlur={() => onSaveTitle(column.id)}
            />
          </div>
        ) : (
          <>
            <h3 className="font-bold text-gray-700 text-sm tracking-wide truncate">
              {column.title}
            </h3>
            <span className="bg-white border border-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
              {(column.tasks || []).length}
            </span>
          </>
        )}
      </div>

      <div className="flex gap-1 relative shrink-0">
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-gray-700 transition-all"
        >
          <Plus size={18} />
        </button>

        <div className="relative">
          <button
            onClick={() => onMenuToggle(activeMenuId === column.id ? null : column.id)}
            className={`p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all ${
              activeMenuId === column.id
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <MoreHorizontal size={18} />
          </button>

          {activeMenuId === column.id && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 origin-top-right"
            >
              <button
                onClick={() => onRenameStart(column)}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <Edit2 size={16} /> Rename List
              </button>
              <button
                onClick={() => onClearColumn(column.id)}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <X size={16} /> Clear Tasks
              </button>
              <div className="border-t border-gray-50 my-1"></div>
              <button
                onClick={() => onDeleteColumn(column.id)}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <Trash2 size={16} /> Delete List
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}