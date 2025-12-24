import React, { useState } from "react";
import Layouts from "@/components/Layouts";
import WorkList from "@/Container/WorkSpace/WorkList";
import { Search, LayoutGrid, List, Plus } from "lucide-react";
import Link from "next/link";

export default function Workspace() {
  const [searchItem, setSearchItem] = useState("");
  // Default to "grid" view
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  return (
    <Layouts>
      <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 text-black">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-gray-200">
          {/* Search Bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              id="searchItem"
              name="searchItem"
              placeholder="ค้นหาชื่อแผนงาน..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-800 placeholder-gray-400 font-medium outline-none"
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* View Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setViewType("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewType === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewType("list")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewType === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List size={20} />
              </button>
            </div>

            {/* Add Button */}
            <Link
              href="/workspace/add"
              className="min-w-max bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-blue-200 flex items-center gap-2 active:scale-95"
            >
              <Plus size={20} strokeWidth={3} />
              <span>เพิ่มแผนงาน</span>
            </Link>
          </div>
        </div>
        
        {/* Pass state to WorkList component */}
        <WorkList viewType={viewType} searchItem={searchItem} />
      </div>
    </Layouts>
  );
}