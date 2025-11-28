import React from 'react';
import { Search, LayoutGrid, List, Trash2, Handshake, Plus } from 'lucide-react';

// Mock Link 
const Link = ({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) => {
  return (
    <a href={href} className={className} style={{ textDecoration: 'none' }}>
      {children}
    </a>
  );
};

interface PartnersMenuProps {
  totalCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewType: 'grid' | 'list';
  setViewType: (type: 'grid' | 'list') => void;
  selectedCount: number;
  onDelete: () => void;
}

export default function Partners_Menu_Section({
  totalCount,
  searchTerm,
  setSearchTerm,
  viewType,
  setViewType,
  selectedCount,
  onDelete
}: PartnersMenuProps) {
  return (
    <div className="mb-8 relative z-10">
      {/* 1. ส่วนหัวข้อ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div className="flex items-center gap-4">
            {/* 💖 สีไอคอน: Pink -> Rose */}
            <div className="p-3.5 bg-linear-to-br from-pink-500 to-rose-600 text-white rounded-2xl shadow-lg shadow-pink-500/30">
                <Handshake size={32} strokeWidth={1.5} />
            </div>
            <div>
                {/* 💖 สีข้อความ: Gradient ชมพู */}
                <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-slate-800 via-pink-700 to-slate-800 bg-clip-text text-transparent">
                จัดการพันธมิตร
                </h1>
                <p className="text-slate-500 mt-1 font-medium">
                สถาบันและองค์กรที่ร่วมมือ <span className="px-2 py-0.5 bg-pink-50 text-pink-600 rounded-md font-bold ml-1">{totalCount} แห่ง</span>
                </p>
            </div>
        </div>

        {/* ปุ่มเพิ่มพันธมิตร (ใช้สีเข้มตัดกันเหมือนเดิม แต่ Hover สีชมพู) */}
        <Link 
            href="/manage_partners/add" 
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-pink-600 transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-1"
        >
            <Plus size={20} strokeWidth={3} /> 
            <span>เพิ่มพันธมิตร</span>
        </Link>
      </div>

      {/* 2. แถบเครื่องมือ */}
      <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-white/50 flex flex-col lg:flex-row gap-4 justify-between items-center">
        
        {/* ช่องค้นหา */}
        <div className="relative w-full lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="ค้นหาชื่อสถาบัน..." 
            // 💖 Focus Ring สีชมพู
            className="pl-11 pr-4 py-3 w-full bg-white/50 border border-white rounded-xl focus:bg-white focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 placeholder-slate-400 font-medium outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ปุ่มควบคุมด้านขวา */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          
          {/* ปุ่มสลับมุมมอง */}
          <div className="flex bg-slate-100/50 p-1 rounded-xl border border-white/50">
            <button 
              onClick={() => setViewType('grid')}
              // 💖 Active สีชมพู
              className={`p-2.5 rounded-lg transition-all duration-200 ${viewType === 'grid' ? 'bg-white text-pink-600 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewType('list')}
              // 💖 Active สีชมพู
              className={`p-2.5 rounded-lg transition-all duration-200 ${viewType === 'list' ? 'bg-white text-pink-600 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600'}`}
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