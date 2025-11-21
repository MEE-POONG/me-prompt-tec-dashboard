import React from 'react';
import Image from 'next/image';
import Link from "next/link";
import { Globe, SquarePen, ExternalLink, Building2, GraduationCap } from 'lucide-react';

// --- 1. Type สำหรับ Project ---
export interface PartnerProject {
  name: string;
  link?: string;
}

// --- 2. PartnerData ---
export interface PartnerData {
  id: string;
  name: string;       
  type: string;       
  website?: string;   
  logoSrc: string;    
  description?: string;
  projects?: PartnerProject[]; 
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
      {/* ================= GRID VIEW ================= */}
      {viewType === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
          {partners.map((partner) => (
            <div 
              key={partner.id} 
              className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                ${selectedIds.includes(partner.id) ? 'ring-2 ring-blue-500 shadow-md' : 'shadow-sm border border-gray-100'}
              `}
            >
              {/* 1. ส่วนปกด้านบน */}
              <div className="h-24 w-full bg-linear-to-r from-blue-600 to-indigo-600 relative">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -mr-5 -mt-5"></div>
                 <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full blur-xl -ml-5 -mb-5"></div>
                 
                 {/* Checkbox */}
                 <div className="absolute top-3 left-3 z-20">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(partner.id)}
                      onChange={() => onToggleSelect(partner.id)}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded border-white/50 cursor-pointer bg-white focus:ring-offset-0" 
                    />
                 </div>

                 {/* ปุ่มแก้ไข */}
                 <div className="absolute top-3 right-3 z-20">
                    <Link href={`/manage_partners/edit/${partner.id}`}>
                      <button className="p-2 bg-white/20 hover:bg-white text-white hover:text-blue-600 rounded-lg backdrop-blur-sm transition-all shadow-sm">
                        <SquarePen size={16} />
                      </button>
                    </Link>
                 </div>
              </div>

              {/* 2. ส่วนโลโก้ */}
              <div className="flex justify-center -mt-12 px-4 relative z-10">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300">
                   <div className="relative w-full h-full">
                      <Image
                        src={partner.logoSrc} 
                        alt={partner.name}
                        fill
                        className="object-contain"
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/png?text=No+Img' }} 
                      />
                   </div>
                </div>
              </div>

              {/* 3. ส่วนเนื้อหา */}
              <div className="p-5 pt-3 text-center flex flex-col grow">
                <div className="mb-3 flex justify-center">
                   <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${partner.type.includes('ศึกษา') ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}
                   `}>
                      {partner.type.includes('ศึกษา') ? <GraduationCap size={12}/> : <Building2 size={12}/>}
                      {partner.type}
                   </span>
                </div>

                <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2 h-12 flex items-center justify-center leading-tight">
                    {partner.name}
                </h3>

                {/* --- ตัดส่วน Projects ออกไปแล้ว --- */}

                <div className="w-full border-t border-gray-50 my-3 mt-auto"></div>

                <div className="mt-auto">
                    {partner.website ? (
                        <a href={partner.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-blue-600 text-xs font-medium transition-colors py-1 px-3 rounded-lg hover:bg-blue-50">
                           <Globe size={14}/> 
                           <span className="truncate max-w-[150px]">{partner.website.replace(/^https?:\/\//, '')}</span>
                           <ExternalLink size={10} />
                        </a>
                    ) : (
                        <span className="text-gray-300 text-xs italic">- ไม่มีเว็บไซต์ -</span>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= LIST VIEW ================= */}
      {viewType === 'list' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="p-4 w-14 text-center">เลือก</th>
                <th className="p-4">รายชื่อพันธมิตร</th>
                {/* ตัด Header คอลัมน์ Projects ออก */}
                <th className="p-4 text-center">ช่องทาง</th>
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
                      <div className="w-10 h-10 relative rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-white p-1">
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
                  
                  {/* ตัด Data Cell คอลัมน์ Projects ออก */}

                  <td className="p-4 text-center">
                    {partner.website ? (
                        <a href={partner.website} target="_blank" className="text-gray-400 hover:text-blue-600 inline-flex p-2 rounded-full hover:bg-blue-50 transition-colors">
                           <Globe size={18} />
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