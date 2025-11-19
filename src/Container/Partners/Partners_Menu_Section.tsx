import React from 'react';
import Link from 'next/link';
import { Search, LayoutGrid, List, Trash2, Handshake, Plus } from 'lucide-react';

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
    <div className="mb-8">
      {/* 1. ส่วนหัวข้อ (ปรับสีให้เข้มขึ้น) */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-200">
             <Handshake size={32} strokeWidth={1.5} />
        </div>
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                จัดการพันธมิตร
            </h1>
            <p className="text-base text-gray-500 mt-1 font-medium">
                สถาบันและองค์กรที่ร่วมมือ ({totalCount} แห่ง)
            </p>
        </div>
      </div>

      {/* 2. แถบเครื่องมือ (Control Bar) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-gray-200">
        
        {/* ช่องค้นหา */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="ค้นหาชื่อสถาบัน..." 
            className="pl-11 pr-4 py-3 w-full bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-800 placeholder-gray-400 font-medium outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ปุ่มควบคุม */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          
          {/* ปุ่มสลับมุมมอง */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button 
              onClick={() => setViewType('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewType === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewType('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewType === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List size={20} />
            </button>
          </div>
          
          <div className="h-8 w-px bg-gray-200 mx-1"></div>

          {/* ปุ่มเพิ่ม */}
          <Link 
            href="/manage_partners/add" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-blue-200 flex items-center gap-2 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> 
            <span>เพิ่มข้อมูล</span>
          </Link>
          
          {/* ปุ่มลบ */}
          <button 
            onClick={onDelete}
            disabled={selectedCount === 0}
            className={`font-bold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 active:scale-95
              ${selectedCount > 0 
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 cursor-pointer' 
                : 'bg-gray-100 text-gray-400 border border-transparent cursor-not-allowed opacity-50'}`}
          >
            <Trash2 size={18} />
            <span className="hidden sm:inline">ลบ ({selectedCount})</span>
          </button> 
        </div>
      </div>
    </div>
  );
}