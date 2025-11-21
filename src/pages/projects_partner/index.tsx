import React, { useState } from "react";
import Layouts from "@/components/Layouts"; 
import Image from "next/image";
import Link from "next/link";
import { 
  Search, LayoutGrid, List, Trash2, FolderGit2, 
  Plus, Edit3, Building2, Calendar, ArrowLeft 
} from "lucide-react";

// --- Types & Mock Data ---
interface ProjectData {
  id: string;
  title: string;
  partnerName: string;
  description: string;
  imageUrl: string;
  status: "Published" | "Draft" | string;
  updatedAt: string;
}

const mockProjects: ProjectData[] = [
  {
    id: "p1",
    title: "AI Workshop 2024",
    partnerName: "Computer Science RMUTI",
    description: "อบรมเชิงปฏิบัติการด้าน AI และ Machine Learning สำหรับนักศึกษา",
    imageUrl: "/image/AI.png",
    status: "Published",
    updatedAt: "20/11/2567",
  },
  {
    id: "p2",
    title: "Internship Management System",
    partnerName: "Me Prompt TEC",
    description: "ระบบบริหารจัดการนักศึกษาฝึกงาน (Internal Tool)",
    imageUrl: "/image/Inter.png",
    status: "Published",
    updatedAt: "18/11/2567",
  },
  {
    id: "p3",
    title: "Smart City Hackathon",
    partnerName: "Multimedia Technology",
    description: "กิจกรรมแข่งขันระดมสมองเพื่อพัฒนาเมืองอัจฉริยะ",
    imageUrl: "/image/smart.png",
    status: "Draft",
    updatedAt: "15/11/2567",
  },
];

// --- Main Page Component ---
export default function AllProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>(mockProjects);

  // Filter Logic
  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.partnerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Selection Logic
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Delete Logic
  const handleDelete = () => {
    if (confirm(`คุณต้องการลบ ${selectedIds.length} รายการที่เลือกใช่หรือไม่?`)) {
      setProjects((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    }
  };

  return (
    <Layouts>
      <div className="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md shadow-amber-200">
            <FolderGit2 size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              จัดการโปรเจกต์รวม
            </h1>
            <p className="text-base text-gray-500 mt-1 font-medium">
              โปรเจกต์ทั้งหมดจากพันธมิตรทุกแห่ง ({projects.length} รายการ)
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-gray-200 mb-8 sticky top-4 z-30">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="ค้นหาชื่อโปรเจกต์ หรือ พันธมิตร..." 
              className="pl-11 pr-4 py-3 w-full bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-gray-800 placeholder-gray-400 font-medium outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
             
             {/* ✅ ย้ายปุ่มย้อนกลับมาไว้ตรงนี้ (แบบไอคอนสี่เหลี่ยม) */}
             <Link 
                href="/manage_partners" 
                className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-amber-600 hover:shadow-sm transition-all flex items-center justify-center"
                title="ย้อนกลับไปหน้าพันธมิตร"
             >
                <ArrowLeft size={20} />
             </Link>

             {/* View Toggle */}
             <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button 
                onClick={() => setViewType('grid')}
                className={`p-2 rounded-lg transition-all ${viewType === 'grid' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewType('list')}
                className={`p-2 rounded-lg transition-all ${viewType === 'list' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List size={20} />
              </button>
            </div>

            <div className="h-8 w-px bg-gray-200 mx-1" />

            <Link 
              href="/projects_partner/add" 
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-amber-200 flex items-center gap-2 active:scale-95"
            >
              <Plus size={20} strokeWidth={3} /> 
              <span className="hidden sm:inline">เพิ่มโปรเจกต์</span>
            </Link>

            <button 
              onClick={handleDelete}
              disabled={selectedIds.length === 0}
              className={`font-bold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 active:scale-95
                ${selectedIds.length > 0 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 cursor-pointer' 
                  : 'bg-gray-100 text-gray-400 border border-transparent cursor-not-allowed opacity-50'}`}
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">ลบ ({selectedIds.length})</span>
            </button> 
          </div>
        </div>

        {/* เรียกใช้ Component ภายในไฟล์ */}
        <CardProjectSectionLocal 
          projects={filteredProjects}
          viewType={viewType}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
        />

      </div>
    </Layouts>
  );
}

// --- Sub-Component (ใส่ไว้ในไฟล์เดียวกันเพื่อแก้ปัญหา Import) ---
function CardProjectSectionLocal({
  projects,
  viewType,
  selectedIds,
  onToggleSelect
}: {
  projects: ProjectData[];
  viewType: 'grid' | 'list';
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
}) {

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400">
        <FolderGit2 size={48} className="mb-4 opacity-20" />
        ไม่พบข้อมูลโปรเจกต์
      </div>
    );
  }

  return (
    <>
      {/* Grid View */}
      {viewType === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`group bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col
                ${selectedIds.includes(project.id) ? 'border-amber-500 ring-2 ring-amber-500 ring-opacity-50' : 'border-gray-100'}
              `}
            >
              <div className="relative h-48 w-full bg-gray-200">
                <Image 
                  src={project.imageUrl} 
                  alt={project.title} 
                  fill 
                  className="object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider backdrop-blur-md
                    ${project.status === 'Published' ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                    {project.status}
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(project.id)}
                    onChange={() => onToggleSelect(project.id)}
                    className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer shadow-sm"
                  />
                </div>
              </div>

              <div className="p-5 flex flex-col grow">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded-lg">
                  <Building2 size={12} />
                  {project.partnerName}
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                  {project.title}
                </h3>
                
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 grow">
                  {project.description}
                </p>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={12} /> {project.updatedAt}
                  </span>
                  
                  <Link href={`/projects_partner/edit/${project.id}`}>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-amber-600 transition-colors">
                      <Edit3 size={18} />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewType === 'list' && (
         <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
           <table className="w-full text-left">
             <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
               <tr>
                 <th className="p-4 w-10 text-center">เลือก</th>
                 <th className="p-4 w-20">รูปภาพ</th>
                 <th className="p-4">ชื่อโปรเจกต์</th>
                 <th className="p-4">พาร์ทเนอร์</th>
                 <th className="p-4 text-center">สถานะ</th>
                 <th className="p-4 text-center">จัดการ</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 text-sm">
               {projects.map((project) => (
                 <tr key={project.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(project.id) ? 'bg-amber-50' : ''}`}>
                   <td className="p-4 text-center">
                     <input 
                        type="checkbox" 
                        checked={selectedIds.includes(project.id)}
                        onChange={() => onToggleSelect(project.id)}
                        className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                   </td>
                   <td className="p-4">
                     <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                       <Image src={project.imageUrl} alt={project.title} fill className="object-cover" />
                     </div>
                   </td>
                   <td className="p-4 font-semibold text-gray-800">
                     {project.title}
                   </td>
                   <td className="p-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-gray-400"/>
                        {project.partnerName}
                      </div>
                   </td>
                   <td className="p-4 text-center">
                     <span className={`px-2 py-1 rounded-full text-xs font-bold 
                       ${project.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                       {project.status}
                     </span>
                   </td>
                   <td className="p-4 text-center">
                      <Link href={`/projects_partner/edit/${project.id}`}>
                        <button className="text-amber-600 hover:text-amber-800 font-medium text-xs bg-amber-50 px-3 py-1.5 rounded-lg">
                          แก้ไข
                        </button>
                      </Link>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      )}
    </>
  );
}