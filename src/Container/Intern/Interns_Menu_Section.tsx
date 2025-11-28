import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  LayoutGrid, 
  List, 
  Trash, 
  GraduationCap, 
  UserPlus, 
  Filter 
} from 'lucide-react';

interface InternsMenuProps {
  totalCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewType: 'grid' | 'list';
  setViewType: (type: 'grid' | 'list') => void;
  selectedCount: number;
  onDelete: () => void;
  
  // ✅ ต้องมี 3 บรรทัดนี้ครับ ไม่งั้นหน้าหลักจะแดง
  selectedGen: string;
  setSelectedGen: (gen: string) => void;
  genOptions: string[]; // <--- ตัวต้นเหตุ
  currentGen: number;
}

export default function Interns_Menu_Section({
  totalCount,
  searchTerm,
  setSearchTerm,
  viewType,
  setViewType,
  selectedCount,
  onDelete,
  
  // ✅ และต้องรับค่าตรงนี้ด้วย
  selectedGen,
  setSelectedGen,
  genOptions, // <--- รับค่ามาใช้
  currentGen
}: InternsMenuProps) {
  return (
    <div className="mb-8 relative z-10">
      
      {/* === Header === */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div className="flex items-center gap-4">
            <div className="p-3.5 bg-linear-to-br from-orange-500 to-amber-600 text-white rounded-2xl shadow-lg shadow-orange-500/30">
                <GraduationCap size={32} strokeWidth={1.5} />
            </div>
            <div>
                <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-orange-900 via-amber-600 to-orange-900 bg-clip-text text-transparent py-2 leading-normal">
                    จัดการนักศึกษา
                </h1>
                <p className="text-slate-500 font-medium -mt-1 flex items-center gap-2">
                    แสดงข้อมูลรุ่นที่ 
                    <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md font-bold text-sm border border-orange-200">
                        {selectedGen === "all" ? "ทั้งหมด" : selectedGen}
                    </span>
                    <span className="text-slate-400 text-sm ml-1">({totalCount} คน)</span>
                </p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link href={`/addintern?gen=${selectedGen === "all" ? currentGen : selectedGen}`}>
                <button className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-1 w-full sm:w-auto">
                    <UserPlus size={18} />
                    <span>เพิ่มนักศึกษา</span>
                </button>
            </Link>
        </div>
      </div>

      {/* === Control Bar === */}
      <div className="relative z-50 bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center flex-1">
          
          <div className="relative min-w-40 w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter size={18} />
            </div>
            
            {/* ✅ ใช้ genOptions ที่รับมาตรงนี้ */}
            <select
              value={selectedGen}
              onChange={(e) => setSelectedGen(e.target.value)}
              className="pl-10 pr-8 py-2.5 w-full border border-white bg-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer font-bold text-slate-700 shadow-sm transition-all hover:bg-white"
            >
              <option value="all">ทุกรุ่น (All Gen)</option>
              {genOptions.map((gen) => (
                <option key={gen} value={gen}>รุ่นที่ {gen}</option>
              ))}
            </select>
            
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="ค้นหาชื่อนักศึกษา..."
              className="pl-10 pr-4 py-2.5 w-full border border-white bg-white/50 rounded-xl focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 transition-all text-slate-800 placeholder-slate-400 font-medium outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <div className="flex bg-slate-100/50 p-1 rounded-xl border border-white/50">
                <button onClick={() => setViewType("grid")} className={`p-2.5 rounded-lg transition-all ${viewType === "grid" ? "bg-white text-orange-600 shadow-sm scale-105" : "text-slate-400 hover:text-slate-600"}`}>
                    <LayoutGrid size={20} />
                </button>
                <button onClick={() => setViewType("list")} className={`p-2.5 rounded-lg transition-all ${viewType === "list" ? "bg-white text-orange-600 shadow-sm scale-105" : "text-slate-400 hover:text-slate-600"}`}>
                    <List size={20} />
                </button>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1" />

            <button
                onClick={onDelete}
                disabled={selectedCount === 0}
                className={`font-bold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 active:scale-95 ${selectedCount > 0 ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 cursor-pointer shadow-sm" : "bg-slate-100 text-slate-300 border border-transparent cursor-not-allowed"}`}
            >
                <Trash size={18} />
                <span className="hidden sm:inline">ลบ ({selectedCount})</span>
            </button>
        </div>
      </div>
    </div>
  );
}