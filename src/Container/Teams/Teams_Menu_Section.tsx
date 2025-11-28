import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  LayoutGrid, 
  List, 
  Trash2, 
  Users, 
  UserPlus, 
  Filter 
} from 'lucide-react';

interface TeamsMenuProps {
  totalCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewType: 'grid' | 'list';
  setViewType: (type: 'grid' | 'list') => void;
  selectedCount: number;
  onDelete: () => void;
  // เพิ่ม Props สำหรับ Filter แผนก เพื่อให้เหมือนรูปตัวอย่าง
  selectedDept: string;
  setSelectedDept: (dept: string) => void;
  departments: string[];
}

export default function Teams_Menu_Section({
  totalCount,
  searchTerm,
  setSearchTerm,
  viewType,
  setViewType,
  selectedCount,
  onDelete,
  selectedDept,
  setSelectedDept,
  departments
}: TeamsMenuProps) {
  return (
    <div className="mb-8 relative z-10">
      
      {/* ================= ส่วนหัว (Header) ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        
        {/* ฝั่งซ้าย: Icon + Title */}
        <div className="flex items-center gap-4">
            {/* กล่อง Icon สีฟ้า/คราม */}
            <div className="p-3.5 bg-linear-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
                <Users size={32} strokeWidth={1.5} />
            </div>
            
            <div>
                <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-slate-800 via-blue-700 to-indigo-800 bg-clip-text text-transparent py-1 leading-normal">
                    จัดการข้อมูลพนักงาน
                </h1>
                <p className="text-slate-500 font-medium -mt-1 flex items-center gap-2">
                    แสดงข้อมูลแผนก
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold text-sm border border-blue-200">
                        {selectedDept === "all" ? "ทั้งหมด" : selectedDept}
                    </span>
                    <span className="text-slate-400 text-sm ml-1">({totalCount} คน)</span>
                </p>
            </div>
        </div>

        {/* ฝั่งขวา: ปุ่มเพิ่มพนักงาน */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link href="/addmember">
                <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-1 w-full sm:w-auto">
                    <UserPlus size={18} />
                    <span>เพิ่มพนักงาน</span>
                </button>
            </Link>
        </div>
      </div>

      {/* ================= แถบเครื่องมือ (Control Bar) ================= */}
      <div className="relative z-50 bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50 flex flex-col lg:flex-row gap-4 justify-between items-center">
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center flex-1">
          
          {/* 1. Filter Dropdown (แผนก) */}
          <div className="relative min-w-[200px] w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter size={18} />
            </div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="pl-10 pr-8 py-2.5 w-full border border-white bg-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer font-bold text-slate-700 shadow-sm transition-all hover:bg-white"
            >
              <option value="all">ทุกแผนก (All Dept)</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {/* Chevron Icon */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          {/* 2. ช่องค้นหา (Search) */}
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="ค้นหาชื่อพนักงาน..." 
              className="pl-10 pr-4 py-2.5 w-full border border-white bg-white/50 rounded-xl focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 placeholder-slate-400 font-medium outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* ฝั่งขวา: ปุ่ม View และ ลบ */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            
            {/* View Switcher */}
            <div className="flex bg-slate-100/50 p-1 rounded-xl border border-white/50">
                <button 
                  onClick={() => setViewType('grid')}
                  className={`p-2.5 rounded-lg transition-all ${viewType === 'grid' ? 'bg-white text-blue-600 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <LayoutGrid size={20} />
                </button>
                <button 
                  onClick={() => setViewType('list')}
                  className={`p-2.5 rounded-lg transition-all ${viewType === 'list' ? 'bg-white text-blue-600 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <List size={20} />
                </button>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1" />

            {/* ปุ่มลบ */}
            <button 
              onClick={onDelete}
              disabled={selectedCount === 0}
              className={`font-bold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 active:scale-95
                ${selectedCount > 0 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 cursor-pointer shadow-sm' 
                  : 'bg-slate-100 text-slate-300 border border-transparent cursor-not-allowed'}`}
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">ลบ ({selectedCount})</span>
            </button> 
        </div>
      </div>
    </div>
  );
}