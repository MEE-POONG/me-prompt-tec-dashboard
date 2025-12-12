import React from "react";
import { Plus } from "lucide-react";

interface TaskActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export function TaskActionButton({
  icon,
  label,
  onClick,
}: TaskActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 px-4 bg-gray-50 hover:bg-white text-gray-700 hover:text-blue-600 font-bold text-base rounded-2xl transition-all duration-300 flex items-center gap-4 shadow-sm hover:shadow-lg border border-gray-100 hover:border-blue-100 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-linear-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <span className="text-gray-500 group-hover:text-blue-600 transition-colors bg-white group-hover:bg-blue-100/50 p-2.5 rounded-xl shadow-sm border border-gray-100 group-hover:scale-110 duration-300 z-10">
        {icon}
      </span>
      <span className="z-10 tracking-wide">{label}</span>
      <div className="flex-1" />
      <div className="opacity-0 group-hover:opacity-100 transform translate-x-3 group-hover:translate-x-0 transition-all duration-300 text-blue-400 z-10">
        <Plus size={16} strokeWidth={3} />
      </div>
    </button>
  );
}
