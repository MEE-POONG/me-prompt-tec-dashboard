import React from "react";

export const SidebarBtn = ({ icon: Icon, label, onClick, active }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
      active
        ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300 shadow-sm"
        : "text-slate-700 hover:bg-slate-200/70 active:bg-slate-200"
    }`}
  >
    <Icon size={18} className={active ? "text-blue-600" : "text-slate-500"} />{" "}
    {label}
  </button>
);
