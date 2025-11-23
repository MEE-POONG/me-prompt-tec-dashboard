import React, { useState } from "react";
import Layouts from "@/components/Layouts";
import WorkList from "@/Container/WorkSpace/WorkList";
import { Intern } from "@/Data/dataintern";
import { Search, CheckCircle2, Handshake, LayoutGrid, List, Plus, Trash2 } from "lucide-react";
import Link from "next/link";


export default function WorkSpace() {
  const [searchItem, setSearchItem] = useState('');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [selectedCount, setSelectedCount] = useState(0);

  const totalCount = Intern.length; // หรือค่าจำนวนทั้งหมดที่คุณต้องการแสดง
  const onDelete = () => {
    console.log("Delete items");
  };

  return (
    <Layouts>
      <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 text-black">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-gray-200">

          {/* ช่องค้นหา */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              id="searchItem"
              name="searchItem"
              placeholder="ค้นหาชื่อสถาบัน..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-800 placeholder-gray-400 font-medium outline-none"
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
            />
          </div>

          {/* ปุ่มควบคุมด้านขวา */}
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


            {/* ปุ่มเพิ่มพันธมิตร */}
            {/* <Link href="/manage_partners/add" className="min-w-content bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-blue-200 flex items-center gap-2 active:scale-95">
              <Plus size={20} strokeWidth={3} />
              <span className="w-max">เพิ่มข้อมูล</span>
            </Link> */}

            {/* ปุ่มลบ */}
            {/* <button
              onClick={onDelete}
              disabled={selectedCount === 0}
              className={`font-bold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 active:scale-95
              ${selectedCount > 0
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 border border-transparent cursor-not-allowed opacity-50'}`}
            >
              <Trash2 size={18} />
              <span className="w-max">ลบ ({selectedCount})</span>
            </button> */}
          </div>
        </div>
        <WorkList />
      </div>
    </Layouts>
  );
}
