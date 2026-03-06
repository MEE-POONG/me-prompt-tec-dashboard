import React, { useRef, useEffect, useState } from "react";
import { WorkspaceColumn } from "@/types/workspace";
import { Plus, MoreHorizontal, Edit2, Eraser, Trash2, X } from "lucide-react";

interface Props {
  column: WorkspaceColumn;
  children: React.ReactNode;
  onAddTask: (id: string | number) => void;
  onCreateTask?: (id: string | number, title: string) => Promise<void>;
  onRenameStart: (col: WorkspaceColumn) => void;
  onClearColumn: (id: string | number) => void;
  onDeleteColumn: (id: string | number) => void;
  editingId: string | number | null;
  tempTitle: string;
  onTitleChange: (val: string) => void;
  onSaveTitle: (id: string | number) => void;
  activeMenuId: string | number | null;
  onMenuToggle: (id: string | number | null) => void;
  isAdding?: boolean;
  newTaskTitle?: string;
  setNewTaskTitle?: (val: string) => void;
  onSaveTask?: (id: string | number) => void;
  onCancelAdding?: () => void;
  isReadOnly?: boolean;
}

export default function WorkspaceBoardColumn({
  column,
  children,
  onAddTask,
  onCreateTask,
  onRenameStart,
  onClearColumn,
  onDeleteColumn,
  editingId,
  tempTitle,
  onTitleChange,
  onSaveTitle,
  activeMenuId,
  onMenuToggle,
  isAdding,
  newTaskTitle,
  setNewTaskTitle,
  onSaveTask,
  onCancelAdding,
  isReadOnly,
}: Props) {

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
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

  useEffect(() => {
    if (isCreating) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isCreating]);

  return (
    <div className="flex flex-col h-full max-h-full w-80 shrink-0 bg-slate-100 rounded-2xl border border-slate-200/60 shadow-sm">

      {/* Header */}
      <div className="p-4 pb-2 flex justify-between items-center group">
        <div className={`flex items-center gap-2 flex-1 ${!isCreating ? "overflow-hidden" : ""}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${column.color || 'bg-slate-400'} shadow-sm`}></div>

          {editingId === column.id ? (
            <input
              autoFocus
              className="w-full text-sm font-bold bg-white border-2 border-blue-400 rounded px-2 py-1 outline-none text-gray-900"
              value={tempTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              onBlur={() => onSaveTitle(column.id)}
              onKeyDown={(e) => e.key === "Enter" && onSaveTitle(column.id)}
              disabled={isReadOnly}
            />
          ) : isCreating ? (
            <div className="flex items-center gap-1.5 flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-200">
              <input
                ref={(el) => { inputRef.current = el; }}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newTitle.trim()) {
                      if (typeof onCreateTask === "function") await onCreateTask(column.id, newTitle.trim());
                      setNewTitle("");
                      setIsCreating(false);
                    }
                  }
                  if (e.key === "Escape") {
                    setNewTitle("");
                    setIsCreating(false);
                  }
                }}
                placeholder="Task title..."
                className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-blue-200 outline-none text-slate-800 placeholder:text-slate-400 bg-white shadow-inner focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all min-w-[100px]"
              />
              <button
                onClick={async () => {
                  if (!newTitle.trim()) return;
                  if (typeof onCreateTask === "function") await onCreateTask(column.id, newTitle.trim());
                  setNewTitle("");
                  setIsCreating(false);
                }}
                className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
                title="Add Task"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={() => { setNewTitle(""); setIsCreating(false); }}
                className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                title="Cancel"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-slate-900 text-[15px] tracking-wide truncate">
                {column.title}
              </h3>
              <span className="bg-slate-200/80 text-slate-500 text-xs px-2 py-0.5 rounded-md font-bold min-w-6 text-center">
                {taskCount}
              </span>
            </>
          )}
        </div>

        {!isReadOnly && !isCreating && (
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
            <button
              onClick={() => setIsCreating(true)}
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
                  <button onClick={() => { setIsCreating(true); onMenuToggle(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><Edit2 size={14} /> Add Task</button>
                  <button onClick={() => onRenameStart(column)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><Edit2 size={14} /> Rename</button>
                  <button onClick={() => onClearColumn(column.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><Eraser size={14} /> Clear Tasks</button>
                  <div className="h-px bg-slate-100 my-1"></div>
                  <button onClick={() => onDeleteColumn(column.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 size={14} /> Delete</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {children}

      {/* ✅ แก้ไข: ซ่อนปุ่มนี้ถ้ากำลังกรอกข้อมูลอยู่ (!isAdding) */}
      {/* ✅ Task adding input form */}
      {!editingId && isAdding && !isReadOnly && (
        <div className="p-3 pt-0 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <textarea
            autoFocus
            placeholder="Enter task title..."
            className="w-full p-2 text-sm text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white min-h-[60px]"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSaveTask?.(column.id);
              }
              if (e.key === "Escape") onCancelAdding?.();
            }}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onSaveTask?.(column.id)}
              className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              Add Task
            </button>
            <button
              onClick={() => onCancelAdding?.()}
              className="p-1.5 text-gray-500 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ✅ Add Task Button */}
      {!editingId && !isAdding && !isReadOnly && (
        <div className="p-2 pt-0">
          <button
            onClick={() => onAddTask(column.id)}
            className="w-full py-2 flex items-center justify-start px-3 gap-2 text-slate-700 hover:text-blue-700 hover:bg-slate-200 rounded-xl transition-all text-sm font-bold group"
          >
            <Plus size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="group-hover:translate-x-0.5 transition-transform">Add Task</span>
          </button>
        </div>
      )}
    </div>
  );
}