import React, { useState } from "react";
import Layouts from "@/components/Layouts";
import WorkList from "@/Container/WorkSpace/WorkList";
import SearchbarTwo from "@/components/ui/Searchbar/two";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function Workspace() {
  const [searchItem, setSearchItem] = useState("");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  return (
    <Layouts>
      <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 text-black">
        <SearchbarTwo
          value={searchItem}
          onSearch={setSearchItem}
          viewType={viewType}
          onViewChange={setViewType}
          placeholder="ค้นหาชื่อแผนงาน..."
          action={
            <Link
              href="/workspace/add"
              className="min-w-max bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-blue-200 flex items-center gap-2 active:scale-95"
            >
              <Plus size={20} strokeWidth={3} />
              <span>เพิ่มแผนงาน</span>
            </Link>
          }
        />
        <WorkList viewType={viewType} searchItem={searchItem} />
      </div>
    </Layouts>
  );
}
