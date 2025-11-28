import React from 'react';
import Image from 'next/image';
import Link from "next/link";
import { FaInstagram, FaGithub, FaFacebook } from "react-icons/fa";
import { FolderKanban, SquarePen } from "lucide-react";

export interface InternData {
  id: string;
  name: { first: string; last: string; display?: string };
  avatar?: string;
  portfolioSlug: string;
  contact?: { email?: string; phone?: string };
  resume?: { summary?: string; links?: Array<{ label: string; url: string }> };
  coopType: string;
  status: string;
  title?: string;
  imageSrc?: string;
  instagram?: string;
  facebook?: string;
  github?: string;
  portfolio?: string;
  gen?: string;
  createdAt: string;
}

interface CardInternSectionProps {
  interns: InternData[];
  viewType: 'grid' | 'list';
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  openModal: (url: string) => void;
  selectedGen: string;
}

export default function Card_Intern_Section({
  interns,
  viewType,
  selectedIds,
  onToggleSelect,
  openModal,
  selectedGen
}: CardInternSectionProps) {
  return (
    <>
      {/* === GRID VIEW === */}
      {viewType === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-6">
          {interns.map((intern) => (
            <div
              key={intern.id}
              className={`relative bg-white rounded-4xl overflow-hidden shadow-sm border border-slate-100 transition-all duration-500 group
                ${selectedIds.includes(intern.id) ? "ring-4 ring-orange-500 shadow-md scale-95" : "hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/10"}
              `}
            >
              <div className="relative w-full aspect-4/5 overflow-hidden bg-slate-50">
                <Image
                  className="transition-transform duration-700 ease-out group-hover:scale-110"
                  src={intern.imageSrc || "/default-avatar.png"}
                  alt={intern.name.display || ""}
                  fill
                  style={{ objectFit: "cover" }}
                />
                
                {/* Gradient & Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-500 z-10"></div>

                {/* Checkbox */}
                <div className="absolute top-4 left-4 z-20">
                    <input
                        type="checkbox"
                        checked={selectedIds.includes(intern.id)}
                        onChange={() => onToggleSelect(intern.id)}
                        className="w-5 h-5 rounded-md border-2 border-white/50 bg-black/20 checked:bg-orange-500 checked:border-orange-500 text-orange-600 focus:ring-orange-500 cursor-pointer shadow-sm backdrop-blur-sm"
                    />
                </div>
                
                {/* Edit Button */}
                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex gap-2">
                    <Link href={`/editintern/${intern.id}`}>
                        <button className="p-2 bg-white/80 hover:bg-white text-slate-700 hover:text-orange-600 rounded-xl backdrop-blur-md shadow-lg transition-all">
                            <SquarePen size={18} />
                        </button>
                    </Link>
                </div>

                {selectedGen === "all" && intern.gen && (
                    <div className="absolute top-4 right-4 z-10 opacity-100 group-hover:opacity-0 transition-opacity">
                      <span className="bg-black/40 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg font-bold border border-white/10">
                        G{intern.gen}
                      </span>
                    </div>
                )}

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    <h2 className="text-xl font-bold mb-1 line-clamp-1 text-white drop-shadow-md" title={intern.name.display}>
                        {intern.name.display || `${intern.name.first} ${intern.name.last}`}
                    </h2>
                    <p className="text-sm font-medium text-orange-200 mb-4">{intern.title}</p>
                    
                    <div className="flex gap-4">
                        {intern.instagram && <a href={intern.instagram} target="_blank" className="hover:text-pink-400 transition-colors"><FaInstagram size={20} /></a>}
                        {intern.facebook && <a href={intern.facebook} target="_blank" className="hover:text-blue-400 transition-colors"><FaFacebook size={20} /></a>}
                        {intern.github && <a href={intern.github} target="_blank" className="hover:text-gray-300 transition-colors"><FaGithub size={20} /></a>}
                        {intern.portfolio && (
                            <button onClick={() => openModal(intern.portfolio!)} className="hover:text-yellow-400 transition-colors">
                                <FolderKanban size={20} />
                            </button>
                        )}
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === LIST VIEW === */}
      {viewType === "list" && (
        <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-sm overflow-hidden border border-white/60 relative z-0 mt-6">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-5 w-16 text-center">เลือก</th>
                <th className="p-5">ข้อมูลส่วนตัว</th>
                <th className="p-5 hidden md:table-cell">ตำแหน่ง</th>
                {selectedGen === "all" && <th className="p-5 text-center">รุ่น</th>}
                <th className="p-5 text-center">Socials</th>
                <th className="p-5 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {interns.map((intern) => (
                <tr key={intern.id} className={`hover:bg-orange-50/30 transition-colors group ${selectedIds.includes(intern.id) ? "bg-orange-50/50" : ""}`}>
                  <td className="p-5 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(intern.id)}
                      onChange={() => onToggleSelect(intern.id)}
                      className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 relative rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                        <Image src={intern.imageSrc || "/default-avatar.png"} alt={intern.name.display || ""} fill style={{ objectFit: "cover" }} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                            {intern.name.display || `${intern.name.first} ${intern.name.last}`}
                        </div>
                        <div className="text-xs text-slate-500 md:hidden">{intern.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 hidden md:table-cell text-slate-600">
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200">
                        {intern.title}
                    </span>
                  </td>
                  {selectedGen === "all" && (
                    <td className="p-5 text-center text-slate-500 font-bold">G{intern.gen || "-"}</td>
                  )}
                  <td className="p-5 text-center">
                    <div className="flex justify-center gap-3 text-slate-400">
                        {intern.instagram && <a href={intern.instagram} target="_blank" className="hover:text-pink-500 transition-colors"><FaInstagram size={18} /></a>}
                        {intern.facebook && <a href={intern.facebook} target="_blank" className="hover:text-blue-600 transition-colors"><FaFacebook size={18} /></a>}
                        {intern.github && <a href={intern.github} target="_blank" className="hover:text-slate-800 transition-colors"><FaGithub size={18} /></a>}
                        {intern.portfolio && (
                            <button onClick={() => openModal(intern.portfolio!)} className="hover:text-yellow-500 transition-colors"><FolderKanban size={18} /></button>
                        )}
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <Link href={`/editintern/${intern.id}`}>
                        <button className="text-xs font-bold bg-white border border-slate-200 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 text-slate-600 px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-2 ml-auto">
                            <SquarePen size={16}/> แก้ไข
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