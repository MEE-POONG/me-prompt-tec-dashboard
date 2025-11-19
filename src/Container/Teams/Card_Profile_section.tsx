import React from 'react';
import Image from 'next/image';
import Link from "next/link";
import { FaInstagram, FaGithub, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { FolderKanban } from 'lucide-react';

// กำหนด Type ของข้อมูลพนักงาน
export interface MemberData {
  id: string;
  name: string;
  title: string; // ตำแหน่ง
  department: string; // แผนก
  imageSrc: string;
  instagram?: string;
  facebook?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

interface CardProfileSectionProps {
  members: MemberData[];      // ข้อมูลที่ผ่านการกรองแล้ว
  viewType: 'grid' | 'list';  // รูปแบบการแสดงผล
  selectedIds: string[];      // ID ที่ถูกเลือก
  onToggleSelect: (id: string) => void; // ฟังก์ชันเมื่อกดเลือก
}

export default function Card_Profile_section({ 
  members, 
  viewType, 
  selectedIds, 
  onToggleSelect 
}: CardProfileSectionProps) {

  if (members.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        ไม่พบข้อมูลพนักงาน
      </div>
    );
  }

  return (
    <>
      {/* === GRID VIEW === */}
      {viewType === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {members.map((member) => (
            <div 
              key={member.id} 
              className={`relative aspect-9/12 rounded-2xl overflow-hidden shadow-xl w-full transition-all duration-300 ease-in-out group
                ${selectedIds.includes(member.id) ? 'ring-4 ring-blue-500 scale-95' : 'hover:-translate-y-2 hover:shadow-2xl'}
              `}
            >
              {/* รูปภาพ */}
              <Image
                className="transition-transform duration-500 ease-in-out group-hover:scale-110"
                src={member.imageSrc} 
                alt={member.name}     
                fill 
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* Admin UI (Checkbox & Edit) */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(member.id)}
                  onChange={() => onToggleSelect(member.id)}
                  className="form-checkbox h-6 w-6 text-blue-600 rounded border-gray-400 focus:ring-blue-500 bg-white/90 backdrop-blur-sm cursor-pointer hover:scale-110 transition-transform" 
                />
                <Link href={`/editmember/${member.id}`}>
                  <span className="bg-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-full shadow-lg cursor-pointer hover:bg-yellow-300 transition-colors">
                    แก้ไข
                  </span>
                </Link>
              </div>

              {/* Overlay Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm text-white transition-all duration-500 ease-in-out translate-y-full group-hover:translate-y-0">
                <h2 className="text-xl font-bold text-white mb-1">{member.name}</h2>
                <p className="text-sm text-gray-300">{member.department}</p>
                <p className="text-md font-medium text-blue-300 mb-4">{member.title}</p>
                
                <div className="flex justify-center gap-4 mt-4">
                   {/* Social Icons (Grid View) */}
                   {member.facebook && <a href={member.facebook} target="_blank" className="hover:text-blue-400"><FaFacebook size={20} /></a>}
                   {member.instagram && <a href={member.instagram} target="_blank" className="hover:text-pink-400"><FaInstagram size={20} /></a>}
                   {member.github && <a href={member.github} target="_blank" className="hover:text-gray-400"><FaGithub size={20} /></a>}
                   {member.linkedin && <a href={member.linkedin} target="_blank" className="hover:text-blue-500"><FaLinkedin size={20} /></a>}
                   {member.portfolio && <a href={member.portfolio} target="_blank" className="hover:text-green-400"><FolderKanban size={20} /></a>}
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
                <th className="p-4">พนักงาน</th>
                <th className="p-4 hidden md:table-cell">แผนก/ตำแหน่ง</th>
                <th className="p-4 text-center">ช่องทางติดต่อ</th>
                <th className="p-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member) => (
                <tr key={member.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(member.id) ? 'bg-blue-50' : ''}`}>
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(member.id)}
                      onChange={() => onToggleSelect(member.id)}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" 
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 relative rounded-full overflow-hidden border border-gray-200 shrink-0">
                        <Image src={member.imageSrc} alt={member.name} fill style={{ objectFit: "cover" }} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{member.name}</div>
                        <div className="text-xs text-gray-500 md:hidden">{member.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                     <div className="text-gray-800 font-medium">{member.department}</div>
                     <div className="text-xs text-gray-500">{member.title}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-3 text-gray-400">
                       {/* ✅ แก้ไขตรงนี้: เพิ่มเงื่อนไขให้ครบทุกช่องทางเหมือน Grid View */}
                       {member.facebook && <a href={member.facebook} target="_blank" className="hover:text-blue-600 transition-colors"><FaFacebook size={18} /></a>}
                       {member.instagram && <a href={member.instagram} target="_blank" className="hover:text-pink-500 transition-colors"><FaInstagram size={18} /></a>}
                       {member.github && <a href={member.github} target="_blank" className="hover:text-gray-800 transition-colors"><FaGithub size={18} /></a>}
                       {member.linkedin && <a href={member.linkedin} target="_blank" className="hover:text-blue-700 transition-colors"><FaLinkedin size={18} /></a>}
                       {member.portfolio && <a href={member.portfolio} target="_blank" className="hover:text-green-600 transition-colors"><FolderKanban size={18} /></a>}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/editmember/${member.id}`}>
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
  );
}