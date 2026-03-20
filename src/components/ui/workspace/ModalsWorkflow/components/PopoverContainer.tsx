import React from "react";
import { ChevronLeft, X } from "lucide-react";

export const PopoverContainer = ({
  title,
  onClose,
  children,
  width = "w-80",
  showBack,
  onBack,
}: {
  title: any;
  onClose: () => void;
  children?: React.ReactNode;
  width?: string;
  showBack?: boolean;
  onBack?: () => void;
}) => (
  <div
    className={`absolute top-0 right-[105%] mr-2 ${width} bg-white rounded-xl shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 slide-in-from-right-4 overflow-hidden ring-1 ring-slate-900/5`}
  >
    <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50 relative">
      {showBack ? (
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/50"
        >
          <ChevronLeft size={18} />
        </button>
      ) : (
        <div className="w-6"></div>
      )}
      <h4 className="font-bold text-slate-700 text-sm">{title}</h4>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/50 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
    <div className="p-4">{children}</div>
  </div>
);
