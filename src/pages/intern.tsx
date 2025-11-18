import Layouts from "@/components/Layouts";
import React, { useState } from 'react'; 
import Image from 'next/image'; 
import { Intern, Dataintern } from '@/Data/dataintern'; // ข้อมูลเริ่มต้น
import Link from "next/link";

// Import ไอคอน
import { FaInstagram, FaGithub } from 'react-icons/fa';
import { FolderKanban, X, Smartphone, Monitor, Trash2 } from 'lucide-react'; // เพิ่ม Trash2

export default function InternPage() {
  // --- State สำหรับจัดการข้อมูล ---
  // 1. แปลงข้อมูลจากไฟล์ Static มาใส่ใน State เพื่อให้มันเปลี่ยนแปลงได้ (ลบได้)
  const [internList, setInternList] = useState<Dataintern[]>(Intern);

  // 2. State สำหรับเก็บ ID ของคนที่ถูกติ๊กเลือก (Checkbox)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // State สำหรับ Modal (ของเดิม)
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  // --- ฟังก์ชันจัดการ Checkbox ---
  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      // ถ้ามีอยู่แล้ว ให้เอาออก (Uncheck)
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      // ถ้ายังไม่มี ให้เพิ่มเข้าไป (Check)
      setSelectedIds([...selectedIds, id]);
    }
  };

  // --- ฟังก์ชันสำหรับปุ่ม "ลบ" ---
  const handleDelete = () => {
    if (selectedIds.length === 0) {
      alert("กรุณาเลือกรายการที่ต้องการลบ");
      return;
    }

    if (confirm(`คุณต้องการลบข้อมูลจำนวน ${selectedIds.length} รายการใช่หรือไม่?`)) {
      // กรองเอาเฉพาะคนที่ ID "ไม่อยู่" ในรายการที่ถูกเลือก (selectedIds)
      const newList = internList.filter(item => !selectedIds.includes(item.id));
      
      setInternList(newList); // อัปเดตหน้าจอ
      setSelectedIds([]); // เคลียร์ checkbox
    }
  };

  // ฟังก์ชัน Modal (ของเดิม)
  const openModal = (url: string | undefined | null) => {
    setModalUrl(url ?? null);
    setViewMode('desktop'); 
  };
  const closeModal = () => {
    setModalUrl(null);
  };

  return (
    <Layouts>
      <div className="p-6 md:p-8 text-black w-full">
        
        {/* === ส่วนหัวข้อและปุ่ม === */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-4 md:mb-0">
            จัดการข้อมูลนักศึกษาฝึกงาน 
            <span className="text-sm font-normal text-gray-500 ml-3">
              (ทั้งหมด {internList.length} คน)
            </span>
          </h1>
          <div className="flex space-x-3">
            <Link href="/addintern" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-lg transition-colors shadow-md">
              + เพิ่มข้อมูล
            </Link>
            
            {/* ปุ่มลบ: จะกดได้เมื่อมีการติ๊กเลือก */}
            <button 
              onClick={handleDelete}
              disabled={selectedIds.length === 0}
              className={`font-bold py-2 px-5 rounded-lg transition-colors shadow-md flex items-center gap-2
                ${selectedIds.length > 0 
                  ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              <Trash2 size={18} />
              ลบ ({selectedIds.length})
            </button> 
          </div>
        </div>

        {/* === ส่วนของการ์ดข้อมูล === */}
        {internList.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            ไม่มีข้อมูลนักศึกษาฝึกงาน
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* เปลี่ยนจาก Intern.map เป็น internList.map (ใช้ State แทน) */}
            {internList.map((intern) => (
              
              <div 
                key={intern.id} 
                className={`relative aspect-[9/12] rounded-2xl overflow-hidden shadow-xl w-full transition-all duration-300 ease-in-out group
                  ${selectedIds.includes(intern.id) ? 'ring-4 ring-red-500 scale-95' : 'hover:-translate-y-2 hover:shadow-2xl'}
                `}
              >
                
                {/* รูปภาพ */}
                <Image
                  className="transition-transform duration-500 ease-in-out group-hover:scale-110"
                  src={intern.imageSrc} 
                  alt={intern.name}     
                  fill 
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={intern.id <= 4}
                />

                {/* ส่วน Admin UI (Checkbox & ปุ่มแก้ไข) */}
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
                  
                  {/* Checkbox ที่ใช้งานได้จริง */}
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(intern.id)}
                    onChange={() => toggleSelect(intern.id)}
                    className="form-checkbox h-6 w-6 text-red-600 rounded border-gray-400 focus:ring-red-500 bg-white/90 backdrop-blur-sm cursor-pointer transition-all hover:scale-110" 
                  />

                  <div className="flex space-x-2">
                    {/* ลิงก์ไปยังหน้าแก้ไข (ส่ง ID ไปด้วย) */}
                    {/* สมมติว่ามีหน้า /editintern/[id] */}
                    <Link href={`/editintern/${intern.id}`}>
                      <span className="bg-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-full shadow-lg cursor-pointer hover:bg-yellow-300 transition-colors">
                        แก้ไข
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Overlay แสดงชื่อ */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm text-white transition-all duration-500 ease-in-out translate-y-full group-hover:translate-y-0">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {intern.name}
                  </h2>
                  <p className="text-md font-medium text-blue-300 mb-4">
                    {intern.title}
                  </p>

                  {/* Social Icons */}
                  <div className="flex justify-center gap-5 mt-4">
                    {intern.instagram && (
                      <a href={intern.instagram} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white hover:-translate-y-1 transition-all">
                        <FaInstagram size={24} />
                      </a>
                    )}
                    {intern.github && (
                      <a href={intern.github} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white hover:-translate-y-1 transition-all">
                        <FaGithub size={24} />
                      </a>
                    )}
                    {intern.portfolio && (
                      <button onClick={() => openModal(intern.portfolio)} className="text-white/80 hover:text-white hover:-translate-y-1 transition-all">
                        <FolderKanban size={24} />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
            
          </div> 
        )}

        {/* === Modal (ส่วนเดิม ไม่ได้แก้) === */}
        {modalUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
             <div className="relative z-10 w-full max-w-6xl h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
                <div className="flex justify-between items-center p-3 border-b bg-gray-50 rounded-t-lg">
                   <span className="text-gray-600 text-sm truncate hidden md:block">{modalUrl}</span>
                   <div className="flex items-center gap-2">
                      <button onClick={() => setViewMode('desktop')} className={`p-2 rounded-md ${viewMode === 'desktop' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} transition-colors`}><Monitor size={18} /></button>
                      <button onClick={() => setViewMode('mobile')} className={`p-2 rounded-md ${viewMode === 'mobile' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} transition-colors`}><Smartphone size={18} /></button>
                      <button onClick={closeModal} className="text-gray-500 hover:text-gray-900 ml-2"><X size={24} /></button>
                   </div>
                </div>
                <div className="w-full h-full p-4 bg-gray-300 rounded-b-lg overflow-auto flex justify-center">
                  <iframe src={modalUrl} className={`h-full rounded-lg shadow-xl transition-all duration-300 ${viewMode === 'desktop' ? 'w-full' : 'w-[375px] max-w-full'}`} frameBorder="0" />
                </div>
             </div>
          </div>
        )}

      </div>
    </Layouts>
  );
}