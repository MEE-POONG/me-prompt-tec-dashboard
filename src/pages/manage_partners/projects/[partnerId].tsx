import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FolderGit2, Plus, SquarePen, Trash2 } from "lucide-react";

interface PartnerProject {
  id: string;
  title: string;
  description: string;
}

// MOCK — ไว้เชื่อมฐานข้อมูลทีหลัง
const mockPartnerProjects: Record<string, PartnerProject[]> = {
  "1": [
    { id: "p1", title: "ระบบจัดการคลังสินค้า", description: "พัฒนาโดยนักศึกษาฝึกงานสาขา CS" },
    { id: "p2", title: "เว็บไซต์ข้อมูลศิษย์เก่า", description: "ทำร่วมกับสาขา CS RMUTI" },
  ],
    "2": [
    { id: "p3", title: "ระบบบริหารงานธุรการ", description: "พัฒนาโดยนักศึกษา IS คณะบริหาร" },
  ],
  "3": [],
};

export default function PartnerProjectsPage() {
  const router = useRouter();
  const { partnerId } = router.query;

  const key = typeof partnerId === "string" ? partnerId : "";
  const projects = mockPartnerProjects[key] ?? [];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
            <FolderGit2 className="text-blue-600" />
            โปรเจกต์ของพาร์ทเนอร์
          </h1>

          <Link
            href={`/manage_partners/projects/add/${key}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} /> เพิ่มโปรเจกต์ใหม่
          </Link>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.length === 0 ? (
            <p className="text-gray-500 italic">
              ยังไม่มีโปรเจกต์สำหรับพาร์ทเนอร์นี้
            </p>
          ) : (
            projects.map((p) => (
              <div
                key={p.id}
                className="border bg-white shadow-sm rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{p.title}</h2>
                  <p className="text-gray-600 mt-2 text-sm">{p.description}</p>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <Link
                    href={`/manage_partners/projects/edit/${p.id}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                  >
                    <SquarePen size={16} />
                    แก้ไข
                  </Link>

                  <button
                    className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                    onClick={() => alert("ยังไม่เชื่อมลบกับ backend")}
                  >
                    <Trash2 size={16} />
                    ลบ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
