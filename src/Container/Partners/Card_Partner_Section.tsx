import React from 'react';
import Image from 'next/image';
import Link from "next/link";
import { Globe, SquarePen, Building2, Facebook, ExternalLink } from 'lucide-react';

export interface PartnerData {
  id: string;
  name: string;       
  type: string;       
  website?: string;   
  logoSrc: string;    
  description?: string;
}

interface CardPartnerSectionProps {
  partners: PartnerData[];    
  viewType: 'grid' | 'list';  
  selectedIds: string[];      
  onToggleSelect: (id: string) => void; 
}

export default function Card_Partner_Section({ 
  partners, 
  viewType, 
  selectedIds, 
  onToggleSelect 
}: CardPartnerSectionProps) {

  if (partners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 backdrop-blur-sm">
        <Building2 size={48} className="mb-4 opacity-20" />
        <p>ไม่พบข้อมูลพันธมิตร</p>
      </div>
    );
  }

  return (
    <>
      {/* ================= GRID VIEW ================= */}
      {viewType === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10 relative z-0">
          {partners.map((partner) => (
            <div 
              key={partner.id} 
              className={`
                group relative flex flex-col bg-white rounded-4xl overflow-hidden transition-all duration-500 
                hover:-translate-y-2 hover:shadow-xl hover:shadow-pink-500/10 border
                ${selectedIds.includes(partner.id) ? 'ring-2 ring-pink-500 shadow-md border-transparent' : 'shadow-sm border-slate-100'}
              `}
            >
              {/* 1. ส่วนรูปภาพ */}
              <div className="w-full h-56 relative bg-slate-50 group-hover:bg-white transition-colors duration-500">
                  <div className="absolute top-4 left-4 z-10">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(partner.id)}
                      onChange={() => onToggleSelect(partner.id)}
                      className="w-5 h-5 rounded-md border-2 border-slate-300 text-pink-600 focus:ring-pink-500 cursor-pointer shadow-sm" 
                    />
                  </div>
                  
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <Link href={`/manage_partners/edit/${partner.id}`}>
                        <button className="p-2 bg-white/90 hover:bg-pink-500 hover:text-white text-slate-600 rounded-xl backdrop-blur-md transition-all shadow-lg hover:shadow-pink-500/30">
                          <SquarePen size={18} />
                        </button>
                      </Link>
                  </div>

                  <div className="absolute inset-4 flex items-center justify-center">
                    <div className="relative w-full h-full">
                        <Image
                            src={partner.logoSrc} 
                            alt={partner.name}
                            fill
                            className="object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-500" 
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/png?text=No+Img' }} 
                        />
                    </div>
                  </div>
              </div>

              {/* 2. ส่วนเนื้อหาด้านล่าง */}
              <div className="p-6 flex flex-col items-center text-center grow bg-white relative z-20 border-t border-slate-50">
                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 leading-tight group-hover:text-pink-600 transition-colors">
                    {partner.name}
                </h3>
                
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full mb-6 border border-slate-200">
                  {partner.type}
                </span>

                <div className="mt-auto w-full flex justify-center">
                  {partner.website ? (
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-2 text-sm font-bold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-4 py-2 rounded-xl transition-all w-full justify-center"
                      >
                          {partner.website.includes('facebook') ? <Facebook size={18}/> : <Globe size={18}/>}
                          <span>เยี่ยมชมเว็บไซต์</span>
                      </a>
                  ) : (
                      <span className="text-slate-300 text-sm flex items-center gap-2 justify-center w-full py-2 border border-dashed border-slate-200 rounded-xl cursor-not-allowed">
                        <Globe size={16} /> ไม่มีเว็บไซต์
                      </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= LIST VIEW (Responsive Fix) ================= */}
      {viewType === 'list' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-sm overflow-hidden border border-white/60 relative z-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4 md:p-5 w-10 text-center">เลือก</th>
                <th className="p-4 md:p-5">รายชื่อพันธมิตร</th>
                {/* ✅ ซ่อนคอลัมน์ในมือถือ */}
                <th className="p-5 hidden md:table-cell">ประเภท</th>
                <th className="p-5 text-center hidden md:table-cell">เว็บไซต์</th>
                <th className="p-4 md:p-5 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {partners.map((partner) => (
                <tr key={partner.id} className={`hover:bg-pink-50/30 transition-colors group ${selectedIds.includes(partner.id) ? 'bg-pink-50/50' : ''}`}>
                  <td className="p-4 md:p-5 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(partner.id)}
                      onChange={() => onToggleSelect(partner.id)}
                      className="w-4 h-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500 cursor-pointer" 
                    />
                  </td>
                  <td className="p-4 md:p-5">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-14 md:h-14 relative rounded-xl overflow-hidden border border-slate-100 shrink-0 bg-white p-2 shadow-sm">
                        <Image 
                           src={partner.logoSrc} 
                           alt={partner.name} 
                           fill 
                           className="object-contain"
                           onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/png?text=No+Img' }} 
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm md:text-base group-hover:text-pink-600 transition-colors line-clamp-2 md:line-clamp-1">
                            {partner.name}
                        </div>
                        {/* ✅ แสดงประเภทเป็นตัวเล็กๆ ในมือถือแทน */}
                        <div className="text-xs text-slate-500 md:hidden mt-1">{partner.type}</div>
                      </div>
                    </div>
                  </td>
                  {/* ✅ ซ่อนคอลัมน์ในมือถือ */}
                  <td className="p-5 hidden md:table-cell">
                    <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg font-medium border border-slate-200">
                        {partner.type}
                    </span>
                  </td>
                  <td className="p-5 text-center hidden md:table-cell">
                    {partner.website ? (
                        <a href={partner.website} target="_blank" className="text-slate-400 hover:text-pink-600 inline-flex p-2 rounded-full hover:bg-pink-50 transition-colors">
                           <ExternalLink size={20} />
                        </a>
                    ) : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="p-4 md:p-5 text-right">
                    <Link href={`/manage_partners/edit/${partner.id}`}>
                      <button className="text-xs font-bold bg-white border border-slate-200 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 text-slate-600 px-3 py-2 md:px-4 md:py-2 rounded-xl shadow-sm transition-all inline-flex items-center gap-2">
                        <SquarePen size={16}/> 
                        <span className="hidden md:inline">แก้ไข</span>
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