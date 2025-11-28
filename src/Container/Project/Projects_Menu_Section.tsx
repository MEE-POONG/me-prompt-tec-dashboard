import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  LayoutGrid, 
  List, 
  Briefcase, // ไอคอนกระเป๋า
  Plus 
} from 'lucide-react';
import FilterButton from "@/components/ui/Filterbutton"; // ตรวจสอบ Path ให้ถูกนะครับ

interface ProjectsMenuProps {
  totalCount: number;
  search: string;
  setSearch: (term: string) => void;
  viewType: 'grid' | 'list';
  setViewType: (type: 'grid' | 'list') => void;
  // Props สำหรับ FilterButton
  allTags: string[];
  allTechStacks: string[];
  onFilterChange: (filters: { tag: string | null; tech: string | null }) => void;
}

export default function Projects_Menu_Section({
  totalCount,
  search,
  setSearch,
  viewType,
  setViewType,
  allTags,
  allTechStacks,
  onFilterChange
}: ProjectsMenuProps) {
  return (
    <div className="mb-8 relative z-10">
      
      {/* === Header === */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div className="flex items-center gap-4">
            {/* กล่อง Icon สีม่วง */}
            <div className="p-3.5 bg-linear-to-br from-violet-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-violet-500/30">
                <Briefcase size={32} strokeWidth={1.5} />
            </div>
            
            <div>
                <h2 className="text-4xl font-black tracking-tight bg-linear-to-r from-slate-800 via-violet-800 to-slate-800 bg-clip-text text-transparent">
                    จัดการโปรเจกต์
                </h2>
                <p className="text-slate-500 mt-1 font-medium">
                    ผลงานทั้งหมด <span className="font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md ml-1">{totalCount} โปรเจกต์</span>
                </p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             {/* ปุ่มเพิ่มโปรเจกต์ */}
             <Link href="/project_create">
                <button className="flex items-center justify-center gap-2 bg-[#1e1b4b] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-violet-900 transition-all shadow-lg shadow-violet-900/20 hover:-translate-y-1 w-full sm:w-auto">
                  <Plus size={18} />
                  <span>เพิ่มโปรเจกต์</span>
                </button>
             </Link>
        </div>
      </div>

      {/* === Control Bar === */}
      <div className="relative z-50 bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50 flex flex-col lg:flex-row gap-4 justify-between items-center">
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={20} className="text-slate-400" />
                </div>
                <input 
                    type="text" 
                    placeholder="ค้นหาโปรเจกต์..." 
                    className="pl-11 pr-4 py-3 w-full bg-white/50 border border-white rounded-xl focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-100 transition-all text-slate-800 placeholder-slate-400 font-medium outline-none shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Filter Component */}
            <FilterButton
                tags={allTags}
                techStacks={allTechStacks}
                onFilterChange={onFilterChange}
            />
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <div className="flex bg-slate-100/50 p-1 rounded-xl border border-white/50">
                <button onClick={() => setViewType("grid")} className={`p-2.5 rounded-lg transition-all ${viewType === "grid" ? "bg-white text-violet-600 shadow-sm scale-105" : "text-slate-400 hover:text-slate-600"}`}>
                    <LayoutGrid size={20} />
                </button>
                <button onClick={() => setViewType("list")} className={`p-2.5 rounded-lg transition-all ${viewType === "list" ? "bg-white text-violet-600 shadow-sm scale-105" : "text-slate-400 hover:text-slate-600"}`}>
                    <List size={20} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}