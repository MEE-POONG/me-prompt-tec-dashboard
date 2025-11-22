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
      <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400">
        <Building2 size={48} className="mb-4 opacity-20" />
        <p>ไม่พบข้อมูลพันธมิตร</p>
      </div>
    );
  }

  return (
    <>
      {/* ================= GRID VIEW (แบบรูปเต็มกรอบ Full Frame) ================= */}
      {viewType === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
          {partners.map((partner) => (
            <div 
              key={partner.id} 
              className={`group flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border
                ${selectedIds.includes(partner.id) ? 'ring-2 ring-blue-500 shadow-md border-transparent' : 'shadow-sm border-gray-200'}
              `}
            >
              {/* 1. ส่วนรูปภาพ (เต็มกรอบ) */}
              <div className="w-full h-64 relative bg-gray-50">
                  {/* ปุ่ม Admin ลอยอยู่บนรูป */}
                  <div className="absolute top-3 left-3 z-10">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(partner.id)}
                      onChange={() => onToggleSelect(partner.id)}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 bg-white/80 backdrop-blur-sm cursor-pointer" 
                    />
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                     <Link href={`/manage_partners/edit/${partner.id}`}>
                       <button className="p-1.5 bg-white/80 hover:bg-blue-600 hover:text-white text-gray-600 rounded-lg backdrop-blur-sm transition-all shadow-sm">
                         <SquarePen size={16} />
                       </button>
                     </Link>
                  </div>

                  {/* ตัวรูปภาพ */}
                  <Image
                    src={partner.logoSrc} 
                    alt={partner.name}
                    fill
                    // ใช้ object-contain และเอา padding ออกเพื่อให้ใหญ่ที่สุดเท่าที่จะทำได้โดยไม่เสียสัดส่วน
                    className="object-contain" 
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/png?text=No+Img' }} 
                  />
              </div>

              {/* 2. ส่วนเนื้อหาด้านล่าง */}
              <div className="p-5 flex flex-col items-center text-center grow bg-white relative z-20">
                <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2 leading-tight">
                    {partner.name}
                </h3>
                
                <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mb-4">
                  {partner.type}
                </span>

                <div className="mt-auto w-full flex justify-center pt-2 border-t border-gray-50">
                  {partner.website ? (
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-all hover:underline"
                      >
                         {partner.website.includes('facebook') ? <Facebook size={16}/> : <Globe size={16}/>}
                         <span>เยี่ยมชมเว็บไซต์</span>
                      </a>
                  ) : (
                      <span className="text-gray-300 text-sm flex items-center gap-1 cursor-default">
                        <Globe size={16} /> ไม่มีเว็บไซต์
                      </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= LIST VIEW (เหมือนเดิม) ================= */}
      {viewType === 'list' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="p-4 w-14 text-center">เลือก</th>
                <th className="p-4">รายชื่อพันธมิตร</th>
                <th className="p-4">ประเภท</th>
                <th className="p-4 text-center">เว็บไซต์</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {partners.map((partner) => (
                <tr key={partner.id} className={`hover:bg-blue-50/30 transition-colors ${selectedIds.includes(partner.id) ? 'bg-blue-50' : ''}`}>
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(partner.id)}
                      onChange={() => onToggleSelect(partner.id)}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" 
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-white p-1">
                        <Image 
                           src={partner.logoSrc} 
                           alt={partner.name} 
                           fill 
                           className="object-contain"
                           onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/png?text=No+Img' }} 
                        />
                      </div>
                      <div className="font-semibold text-gray-800">{partner.name}</div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">
                    {partner.type}
                  </td>
                  <td className="p-4 text-center">
                    {partner.website ? (
                        <a href={partner.website} target="_blank" className="text-gray-400 hover:text-blue-600 inline-flex p-2 rounded-full hover:bg-blue-50 transition-colors">
                           <ExternalLink size={18} />
                        </a>
                    ) : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/manage_partners/edit/${partner.id}`}>
                      <button className="text-xs font-medium bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-600 px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-2 ml-auto">
                        <SquarePen size={14}/> แก้ไข
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