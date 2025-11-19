import React from 'react';
import Link from 'next/link';
import { Search, LayoutGrid, List, Trash2 } from 'lucide-react';

interface TeamsMenuProps {
  totalCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewType: 'grid' | 'list';
  setViewType: (type: 'grid' | 'list') => void;
  selectedCount: number;
  onDelete: () => void;
}

export default function Teams_Menu_Section({
  totalCount,
  searchTerm,
  setSearchTerm,
  viewType,
  setViewType,
  selectedCount,
  onDelete
}: TeamsMenuProps) {
  return (
    <div className="mb-6">
      {/* หัวข้อ */}
      <h1 className="text-2xl lg:text-3xl font-bold mb-4 text-black">
        จัดการข้อมูลพนักงาน (Team Members)
        <span className="text-sm font-normal text-gray-500 ml-3">
          (ทั้งหมด {totalCount} คน)
        </span>
      </h1>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        
        {/* ช่องค้นหา */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="ค้นหาชื่อพนักงาน..." 
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          
          {/* ปุ่มเปลี่ยนมุมมอง */}
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button 
              onClick={() => setViewType('grid')}
              className={`p-2 rounded-md transition-all ${viewType === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewType('list')}
              className={`p-2 rounded-md transition-all ${viewType === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List size={20} />
            </button>
          </div>

          {/* ปุ่มเพิ่ม */}
          <Link href="/addmember" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
            + เพิ่มพนักงาน
          </Link>
          
          {/* ปุ่มลบ */}
          <button 
            onClick={onDelete}
            disabled={selectedCount === 0}
            className={`font-bold py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap
              ${selectedCount > 0 
                ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            <Trash2 size={18} />
            <span className="hidden sm:inline">ลบ ({selectedCount})</span>
          </button> 
        </div>
      </div>
    </div>
  );
}