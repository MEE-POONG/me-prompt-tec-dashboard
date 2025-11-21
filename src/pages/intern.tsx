import Layouts from "@/components/Layouts";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from "next/link";

import { FaInstagram, FaGithub, FaFacebook } from 'react-icons/fa';
import {
  FolderKanban,
  X,
  Smartphone,
  Monitor,
  Trash2,
  Search,       
  LayoutGrid,   
  List,
  ExternalLink // ✅ เพิ่มไอคอนนี้สำหรับปุ่มเปิดแยก (เผื่อไว้)
} from 'lucide-react';

interface InternData {
  id: string;
  name: {
    first: string;
    last: string;
    display?: string;
  };
  avatar?: string;
  portfolioSlug: string;
  contact?: {
    email?: string;
    phone?: string;
  };
  resume?: {
    summary?: string;
    links?: Array<{ label: string; url: string }>;
  };
  coopType: string;
  status: string;
  title?: string;
  imageSrc?: string;
  instagram?: string;
  facebook?: string;
  github?: string;
  portfolio?: string;
}

export default function InternPage() {
  // --- State ข้อมูล ---
  const [internList, setInternList] = useState<InternData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- State ใหม่สำหรับ Search & Layout ---
  const [searchTerm, setSearchTerm] = useState(""); 
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid'); 

  // State Modal
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  // --- ดึงข้อมูลจาก API ---
  useEffect(() => {
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/intern?limit=100');
      const result = await response.json();

      if (response.ok) {
        const formattedInterns = result.data.map((intern: any) => {
          // ✅ 1. ดึงลิงก์ Portfolio จริงๆ ออกมา (แก้จุดที่ทำให้ลิงก์พัง)
          const links = intern.resume?.links || [];
          const pfLink = links.find((l: any) => l.label.toLowerCase().includes('portfolio'))?.url;

          return {
            id: intern.id,
            name: intern.name,
            title: intern.coopType === 'coop' ? 'นักศึกษาฝึกงาน' : 'Intern',
            imageSrc: intern.avatar || '/default-avatar.png',
            avatar: intern.avatar,
            portfolioSlug: intern.portfolioSlug,
            instagram: links.find((l: any) => l.label.toLowerCase().includes('instagram'))?.url,
            facebook: links.find((l: any) => l.label.toLowerCase().includes('facebook'))?.url,
            github: links.find((l: any) => l.label.toLowerCase().includes('github'))?.url,
            
            // ✅ 2. ใช้ลิงก์จริง (ไม่เติม prefix มั่วซั่วแล้ว)
            portfolio: pfLink || "", 

            contact: intern.contact,
            resume: intern.resume,
            coopType: intern.coopType,
            status: intern.status,
          };
        });
        setInternList(formattedInterns);
      }
    } catch (error) {
      console.error('Error fetching interns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- ฟังก์ชัน Checkbox ---
  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // --- ฟังก์ชันลบ ---
  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`คุณต้องการลบข้อมูลจำนวน ${selectedIds.length} รายการใช่หรือไม่?`)) {
      try {
        await Promise.all(
          selectedIds.map(id =>
            fetch(`/api/intern/${id}`, { method: 'DELETE' })
          )
        );
        await fetchInterns();
        setSelectedIds([]);
        alert('ลบข้อมูลเรียบร้อย');
      } catch (error) {
        console.error('Error deleting interns:', error);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  // --- ฟังก์ชัน Modal ---
  const openModal = (url: string | undefined | null) => {
    if (!url) return;
    setModalUrl(url);
    setViewMode('desktop'); 
  };
  const closeModal = () => setModalUrl(null);

  // --- 🔍 Logic การค้นหา ---
  const filteredInterns = internList.filter((intern) => {
    const displayName = intern.name.display || `${intern.name.first} ${intern.name.last}`;
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Layouts>
      <div className="p-6 md:p-8 text-black w-full">
        
        {/* === ส่วนหัวข้อ === */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-4">
            จัดการข้อมูลนักศึกษาฝึกงาน 
            <span className="text-sm font-normal text-gray-500 ml-3">
              (ทั้งหมด {internList.length} คน)
            </span>
          </h1>

          {/* === Control Bar === */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            
            {/* ช่องค้นหา */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="ค้นหาชื่อ..." 
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
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

              {/* ปุ่มเพิ่ม & ลบ */}
              <Link href="/addintern" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
                + เพิ่ม
              </Link>
              
              <button 
                onClick={handleDelete}
                disabled={selectedIds.length === 0}
                className={`font-bold py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap
                  ${selectedIds.length > 0 
                    ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline">ลบ ({selectedIds.length})</span>
              </button> 
            </div>
          </div>
        </div>

        {/* === ส่วนแสดงผลข้อมูล === */}
        {filteredInterns.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            ไม่พบข้อมูลที่ค้นหา
          </div>
        ) : (
          <>
            {/* === GRID VIEW === */}
            {viewType === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredInterns.map((intern) => (
                  <div 
                    key={intern.id} 
                    className={`relative aspect-9/12 rounded-2xl overflow-hidden shadow-xl w-full transition-all duration-300 ease-in-out group
                      ${selectedIds.includes(intern.id) ? 'ring-4 ring-red-500 scale-95' : 'hover:-translate-y-2 hover:shadow-2xl'}
                    `}
                  >
                    <Image
                      className="transition-transform duration-500 ease-in-out group-hover:scale-110"
                      src={intern.imageSrc || '/default-avatar.png'}
                      alt={intern.name.display || `${intern.name.first} ${intern.name.last}`}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(intern.id)}
                        onChange={() => toggleSelect(intern.id)}
                        className="form-checkbox h-6 w-6 text-red-600 rounded border-gray-400 focus:ring-red-500 bg-white/90 backdrop-blur-sm cursor-pointer hover:scale-110 transition-transform" 
                      />
                      <Link href={`/editintern/${intern.id}`}>
                        <span className="bg-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-full shadow-lg cursor-pointer hover:bg-yellow-300 transition-colors">
                          แก้ไข
                        </span>
                      </Link>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm text-white transition-all duration-500 ease-in-out translate-y-full group-hover:translate-y-0">
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {intern.name.display || `${intern.name.first} ${intern.name.last}`}
                      </h2>
                      <p className="text-md font-medium text-blue-300 mb-4">{intern.title}</p>
                      <div className="flex justify-center gap-5 mt-4">
                        {intern.instagram && <a href={intern.instagram} target="_blank" className="hover:text-red-400 transition-colors"><FaInstagram size={24} /></a>}
                        {intern.facebook && <a href={intern.facebook} target="_blank" className="hover:text-blue-400 transition-colors"><FaFacebook size={24} /></a>}
                        {intern.github && <a href={intern.github} target="_blank" className="hover:text-gray-400 transition-colors"><FaGithub size={24} /></a>}
                        {/* ปุ่ม Portfolio เรียกใช้ Modal */}
                        {intern.portfolio && <button onClick={() => openModal(intern.portfolio)} className="hover:text-green-400 transition-colors"><FolderKanban size={24} /></button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* === LIST VIEW === */}
            {viewType === 'list' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-600 uppercase text-sm font-bold">
                    <tr>
                      <th className="p-4 w-10 text-center">#</th>
                      <th className="p-4">ข้อมูลส่วนตัว</th>
                      <th className="p-4 hidden md:table-cell">ตำแหน่ง</th>
                      <th className="p-4 text-center">Socials</th>
                      <th className="p-4 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredInterns.map((intern) => (
                      <tr 
                        key={intern.id} 
                        className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(intern.id) ? 'bg-red-50' : ''}`}
                      >
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(intern.id)}
                            onChange={() => toggleSelect(intern.id)}
                            className="form-checkbox h-5 w-5 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer" 
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 relative rounded-full overflow-hidden border border-gray-200 shrink-0">
                              <Image
                                src={intern.imageSrc || '/default-avatar.png'}
                                alt={intern.name.display || `${intern.name.first} ${intern.name.last}`}
                                fill
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                            <div>
                              <div className="font-bold text-gray-800">
                                {intern.name.display || `${intern.name.first} ${intern.name.last}`}
                              </div>
                              <div className="text-xs text-gray-500 md:hidden">{intern.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell text-gray-600">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {intern.title}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-3 text-gray-400">
                            {intern.instagram && <a href={intern.instagram} target="_blank" className="hover:text-pink-600 transition-colors"><FaInstagram size={18} /></a>}
                            {intern.facebook && <a href={intern.facebook} target="_blank" className="hover:text-blue-400 transition-colors"><FaFacebook size={18} /></a>}
                            {intern.github && <a href={intern.github} target="_blank" className="hover:text-black transition-colors"><FaGithub size={18} /></a>}
                            {intern.portfolio && <button onClick={() => openModal(intern.portfolio)} className="hover:text-yellow-600 transition-colors"><FolderKanban size={18} /></button>}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Link href={`/editintern/${intern.id}`}>
                            <button className="text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-md shadow-sm transition-colors">
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
        )}

        {/* === ✅ ส่วน Modal ที่ปรับปรุงแล้ว (ป้องกันจอเทา) === */}
        {modalUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             {/* พื้นหลังดำ */}
             <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal} />
             
             <div className="relative z-10 w-full max-w-6xl h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
                
                {/* Header ของ Modal: แสดงลิงก์ + ปุ่มเปิดแยก */}
                <div className="flex justify-between items-center p-3 border-b bg-gray-100">
                   <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-gray-500 text-xs font-bold whitespace-nowrap">Source:</span>
                      <a href={modalUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline truncate max-w-[200px] md:max-w-md">
                          {modalUrl}
                      </a>
                      <a href={modalUrl} target="_blank" rel="noreferrer" className="p-1.5 bg-white border border-gray-300 rounded text-gray-500 hover:text-blue-600" title="Open in new tab">
                          <ExternalLink size={14}/>
                      </a>
                   </div>
                   <div className="flex items-center gap-2">
                      <button onClick={() => setViewMode('desktop')} className={`p-2 rounded-md ${viewMode === 'desktop' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}><Monitor size={18} /></button>
                      <button onClick={() => setViewMode('mobile')} className={`p-2 rounded-md ${viewMode === 'mobile' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}><Smartphone size={18} /></button>
                      <button onClick={closeModal} className="text-gray-500 hover:text-red-600 ml-2"><X size={24} /></button>
                   </div>
                </div>

                {/* พื้นที่แสดงเว็บ (Iframe) */}
                <div className="w-full h-full bg-gray-200 flex justify-center relative">
                   {/* ตัว Iframe */}
                   <iframe 
                       src={modalUrl} 
                       className={`h-full bg-white shadow-xl transition-all duration-300 ${viewMode === 'desktop' ? 'w-full' : 'w-[375px] border-x-8 border-gray-800'}`} 
                       frameBorder="0" 
                       // เพิ่มสิทธิ์ให้ iframe เพื่อลดโอกาสจอเทา
                       sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                   />
                </div>
             </div>
          </div>
        )}

      </div>
    </Layouts>
  );
}