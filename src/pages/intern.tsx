import Layouts from "@/components/Layouts";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { FaInstagram, FaGithub, FaFacebook } from "react-icons/fa";
import {
  FolderKanban,
  X,
  Trash,
  Search,
  LayoutGrid,
  List,
  Filter,
  UserPlus,
  SquarePen,
  GraduationCap,
  Loader2
} from "lucide-react";
import ModalDelete from "@/components/ui/Modals/ModalsDelete";

interface InternData {
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

export default function InternPage() {
  const currentGen = 6;
  const [internList, setInternList] = useState<InternData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [selectedGen, setSelectedGen] = useState<string>("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalUrl, setModalUrl] = useState<string | null>(null);

  const genOptions = Array.from(
    new Set(internList.map((intern) => intern.gen).filter(Boolean))
  ).sort((a, b) => Number(b) - Number(a));

  useEffect(() => {
    fetchInterns();
  }, [selectedGen]);

  const fetchInterns = async () => {
    setIsLoading(true);
    setInternList([]);
    try {
      const response = await fetch(`/api/intern?limit=100&gen=${selectedGen}`);
      const result = await response.json();

      if (response.ok) {
        const formattedInterns = result.data.map((intern: any) => {
          const links = intern.resume?.links || [];
          const pfLink = links.find((l: any) => l.label.toLowerCase().includes("portfolio"))?.url;

          return {
            id: intern.id,
            name: intern.name,
            title: intern.coopType === "coop" ? "นักศึกษาฝึกงาน" : "Intern",
            imageSrc: intern.avatar || "/default-avatar.png",
            avatar: intern.avatar,
            portfolioSlug: intern.portfolioSlug,
            instagram: links.find((l: any) => l.label.toLowerCase().includes("instagram"))?.url,
            facebook: links.find((l: any) => l.label.toLowerCase().includes("facebook"))?.url,
            github: links.find((l: any) => l.label.toLowerCase().includes("github"))?.url,
            portfolio: pfLink || "",
            contact: intern.contact,
            resume: intern.resume,
            coopType: intern.coopType,
            status: intern.status,
            gen: intern.gen,
            createdAt: intern.createdAt,
          };
        });

        formattedInterns.sort((a: any, b: any) => {
          if (a.gen === b.gen) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return Number(b.gen) - Number(a.gen);
        });

        setInternList(formattedInterns);
      }
    } catch (error) {
      console.error("Error fetching interns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    setShowDeleteModal(true);
  };

  const onConfirmDelete = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) => fetch(`/api/intern/${id}`, { method: "DELETE" }))
      );
      setSelectedIds([]);
      await fetchInterns();
      setShowDeleteModal(false);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      console.error("Error deleting interns:", err);
    }
  };

  const openModal = (url: string | undefined | null) => {
    if (!url) return;
    setModalUrl(url);
  };
  const closeModal = () => setModalUrl(null);

  const filteredInterns = internList.filter((intern) => {
    const displayName = intern.name.display || `${intern.name.first} ${intern.name.last}`;
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Layouts>
      <div className="relative min-h-screen bg-[#fffaf5] overflow-hidden font-sans text-slate-800">
        
        {/* --- Background Aurora --- */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-orange-200/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-amber-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-red-200/30 rounded-full blur-[100px] mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-7xl py-8">
          
          {/* === Header === */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div className="flex items-center gap-4">
                <div className="p-3.5 bg-linear-to-br from-orange-500 to-amber-600 text-white rounded-2xl shadow-lg shadow-orange-500/30">
                    <GraduationCap size={32} strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-orange-900 via-amber-600 to-orange-900 bg-clip-text text-transparent py-2 leading-normal">
                        จัดการนักศึกษา
                    </h1>
                    <p className="text-slate-500 font-medium -mt-1 flex items-center gap-2">
                        แสดงข้อมูลรุ่นที่ 
                        <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md font-bold text-sm border border-orange-200">
                            {selectedGen === "all" ? "ทั้งหมด" : selectedGen}
                        </span>
                        <span className="text-slate-400 text-sm ml-1">({filteredInterns.length} คน)</span>
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Link href={`/addintern?gen=${selectedGen === "all" ? currentGen : selectedGen}`}>
                    <button className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-1 w-full sm:w-auto">
                        <UserPlus size={18} />
                        <span>เพิ่มนักศึกษา</span>
                    </button>
                </Link>
            </div>
          </div>

          {/* === Control Bar === */}
          <div className="relative z-50 bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50 mb-8 flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center flex-1">
              
              <div className="relative min-w-40 w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Filter size={18} />
                </div>
                <select
                  value={selectedGen}
                  onChange={(e) => setSelectedGen(e.target.value)}
                  className="pl-10 pr-8 py-2.5 w-full border border-white bg-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer font-bold text-slate-700 shadow-sm transition-all hover:bg-white"
                >
                  <option value="all">ทุกรุ่น (All Gen)</option>
                  {genOptions.map((gen) => (
                    <option key={gen} value={gen}>รุ่นที่ {gen}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={20} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อนักศึกษา..."
                  className="pl-10 pr-4 py-2.5 w-full border border-white bg-white/50 rounded-xl focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 transition-all text-slate-800 placeholder-slate-400 font-medium outline-none shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                <div className="flex bg-slate-100/50 p-1 rounded-xl border border-white/50">
                    <button onClick={() => setViewType("grid")} className={`p-2.5 rounded-lg transition-all ${viewType === "grid" ? "bg-white text-orange-600 shadow-sm scale-105" : "text-slate-400 hover:text-slate-600"}`}>
                        <LayoutGrid size={20} />
                    </button>
                    <button onClick={() => setViewType("list")} className={`p-2.5 rounded-lg transition-all ${viewType === "list" ? "bg-white text-orange-600 shadow-sm scale-105" : "text-slate-400 hover:text-slate-600"}`}>
                        <List size={20} />
                    </button>
                </div>

                <div className="h-8 w-px bg-slate-200 mx-1" />

                <button
                    onClick={handleDelete}
                    disabled={selectedIds.length === 0}
                    className={`font-bold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 active:scale-95 ${selectedIds.length > 0 ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 cursor-pointer shadow-sm" : "bg-slate-100 text-slate-300 border border-transparent cursor-not-allowed"}`}
                >
                    <Trash size={18} />
                    <span className="hidden sm:inline">ลบ ({selectedIds.length})</span>
                </button>
            </div>
          </div>

          {/* === Content Area === */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
              <p className="text-slate-400 animate-pulse font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          ) : filteredInterns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-4xl border-2 border-dashed border-slate-200 text-center backdrop-blur-sm">
              <div className="bg-slate-50 p-6 rounded-full mb-4 shadow-sm">
                <UserPlus size={48} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                {selectedGen === "all" ? "ไม่พบข้อมูลนักศึกษา" : `ยังไม่มีข้อมูลรุ่นที่ ${selectedGen}`}
              </h3>
              <p className="text-slate-500 mb-6 max-w-md">ยังไม่มีรายชื่อนักศึกษาในระบบ คุณสามารถเพิ่มข้อมูลใหม่ได้เลย</p>
              <Link href={`/addintern?gen=${selectedGen === "all" ? currentGen : selectedGen}`}>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-200 flex items-center gap-2">
                  + เพิ่มข้อมูล
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* === GRID VIEW === */}
              {viewType === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-6">
                  {filteredInterns.map((intern) => (
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
                        
                        {/* ✅ Gradient และ ข้อความ: เริ่มต้นซ่อนไว้ (opacity-0) แสดงตอน Hover */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-500 z-10"></div>

                        {/* Checkbox */}
                        <div className="absolute top-4 left-4 z-20">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(intern.id)}
                                onChange={() => toggleSelect(intern.id)}
                                className="w-5 h-5 rounded-md border-2 border-white/50 bg-black/20 checked:bg-orange-500 checked:border-orange-500 text-orange-600 focus:ring-orange-500 cursor-pointer shadow-sm backdrop-blur-sm"
                            />
                        </div>
                        
                        {/* ปุ่ม Edit/Delete (ซ่อนก่อน Hover) */}
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

                        {/* ✅ เนื้อหาข้อความ: เริ่มต้นซ่อน (opacity-0, translate-y) แสดงตอน Hover */}
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
                                    <button onClick={() => openModal(intern.portfolio)} className="hover:text-yellow-400 transition-colors">
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
                      {filteredInterns.map((intern) => (
                        <tr key={intern.id} className={`hover:bg-orange-50/30 transition-colors group ${selectedIds.includes(intern.id) ? "bg-orange-50/50" : ""}`}>
                          <td className="p-5 text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(intern.id)}
                              onChange={() => toggleSelect(intern.id)}
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
                                    <button onClick={() => openModal(intern.portfolio)} className="hover:text-yellow-500 transition-colors"><FolderKanban size={18} /></button>
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
          )}

          {/* === Modal === */}
          {modalUrl && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={closeModal}>
              <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center p-4 border-b bg-slate-50">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-slate-400 text-xs font-bold">SOURCE:</span>
                        <a href={modalUrl} target="_blank" className="text-orange-600 text-sm font-bold hover:underline truncate max-w-xs">{modalUrl}</a>
                    </div>
                    <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-500"/></button>
                 </div>
                 <div className="w-full h-full bg-slate-200 flex justify-center">
                    <iframe src={modalUrl} className="h-full w-full bg-white" frameBorder="0" />
                 </div>
              </div>
            </div>
          )}

          {showDeleteModal && (
            <ModalDelete
              message={`คุณแน่ใจหรือไม่ที่จะลบนักศึกษา ${selectedIds.length} คน?`}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={onConfirmDelete}
            />
          )}
        </div>
      </div>
    </Layouts>
  );
}