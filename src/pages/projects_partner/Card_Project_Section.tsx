import React from 'react';
import Image from 'next/image';
import Link from "next/link";
import { Building2, Calendar, Edit3, FolderGit2 } from 'lucide-react';

export interface ProjectData {
  id: string;
  title: string;
  partnerName: string;
  description: string;
  imageUrl: string;
  status: "Published" | "Draft" | string;
  updatedAt: string;
}

interface CardProjectSectionProps {
  projects: ProjectData[];
  viewType: 'grid' | 'list';
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
}

export default function Card_Project_Section({
  projects,
  viewType,
  selectedIds,
  onToggleSelect
}: CardProjectSectionProps) {

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
      {/* ================= GRID VIEW ================= */}
      {viewType === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100
                transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                ${selectedIds.includes(project.id) ? 'ring-2 ring-amber-500 border-amber-500' : ''}
              `}
            >
              {/* Image Cover */}
              <div className="relative h-48 w-full bg-gray-200">
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(project.id)}
                    onChange={() => onToggleSelect(project.id)}
                    className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer shadow-sm"
                  />
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                   <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm
                      ${project.status === 'Published' || project.status === 'เผยแพร่แล้ว'
                        ? 'bg-green-500/90 text-white' 
                        : 'bg-gray-500/90 text-white'}
                   `}>
                      {project.status}
                   </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col grow">
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
                    <Building2 size={12} />
                    {project.partnerName}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 h-12">
                  {project.title}
                </h3>

                <p className="text-xs text-gray-500 line-clamp-2 mb-4 grow">
                  {project.description}
                </p>

                <div className="w-full border-t border-gray-100 my-3"></div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={14} />
                    <span>{project.updatedAt}</span>
                  </div>

                  <Link href={`/projects_partner/edit/${project.id}`}>
                    <button className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-amber-600 transition-colors p-1.5 hover:bg-gray-50 rounded-lg">
                      <Edit3 size={14} />
                      แก้ไข
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= LIST VIEW ================= */}
      {viewType === 'list' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="p-4 text-center w-16">เลือก</th>
                <th className="p-4 w-24">รูปภาพ</th>
                <th className="p-4">ชื่อโปรเจกต์</th>
                <th className="p-4">เจ้าของโปรเจกต์ (Partner)</th>
                <th className="p-4 text-center">สถานะ</th>
                <th className="p-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(project.id) ? 'bg-amber-50' : ''}`}
                >
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(project.id)}
                      onChange={() => onToggleSelect(project.id)}
                      className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-4">
                     <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-gray-200 border border-gray-200">
                        <Image src={project.imageUrl} alt={project.title} fill className="object-cover" />
                     </div>
                  </td>
                  <td className="p-4 font-bold text-gray-800">{project.title}</td>
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center gap-2">
                       <Building2 size={14} className="text-gray-400" />
                       {project.partnerName}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold 
                         ${project.status === 'Published' || project.status === 'เผยแพร่แล้ว'
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'}
                    `}>
                      {project.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Link href={`/projects_partner/edit/${project.id}`}>
                        <button className="text-gray-500 hover:text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-all">
                           <Edit3 size={16} />
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