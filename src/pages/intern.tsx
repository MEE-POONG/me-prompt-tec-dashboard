import Layouts from "@/components/Layouts";
import React, { useState } from 'react'; 
import Image from 'next/image'; // 🚨 Import เพิ่ม
import { Intern, Dataintern } from '@/data/dataintern'; 
import Link from "next/link";

// 🚨 Import ไอคอนที่ต้องใช้ทั้งหมด
import { FaInstagram, FaGithub } from 'react-icons/fa';
import { FolderKanban, X, Smartphone, Monitor } from 'lucide-react';
import addintern from "@/pages/addintern";

export default function InternPage() {
  // State สำหรับ Modal (จากโค้ดตัวอย่าง)
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  // ฟังก์ชันสำหรับเปิด Modal (จากโค้ดตัวอย่าง)
  const openModal = (url: string | undefined | null) => {
    setModalUrl(url ?? null);
    setViewMode('desktop'); 
  };

  // ฟังก์ชันสำหรับปิด Modal (จากโค้ดตัวอย่าง)
  const closeModal = () => {
    setModalUrl(null);
  };

  return (
    <Layouts>
      {/* ส่วนเนื้อหาหลัก */}
      <div className="p-6 md:p-8 text-black w-full">
        
        {/* === ส่วนหัวข้อและปุ่ม (จากโค้ดเดิม) === */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-4 md:mb-0">
            จัดการข้อมูลนักศึกษาฝึกงาน
          </h1>
          <div className="flex space-x-3">
            <Link href="/addintern" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-lg transition-colors">
              เพิ่มข้อมูล
              </Link>
            <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg transition-colors">
              ลบ
            </button>
          </div>
        </div>

        {/* === ส่วนของการ์ดข้อมูล (แบบรวมร่าง) === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* (แก้ไข) วนลูปข้อมูล Intern
            ผมเปลี่ยนชื่อตัวแปรจาก Dataintern เป็น intern (ตัวเล็ก) 
            เพื่อกันชื่อชนกับ Type ที่ import มาครับ
          */}
          {Intern.map((intern: Dataintern) => (
            
            // ใช้การ์ดสไตล์จากโค้ดตัวอย่าง
            <div 
              key={intern.id} 
              className="relative aspect-[9/12] rounded-2xl overflow-hidden shadow-xl w-full transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl group"
            >
              
              {/* รูปภาพ (จากโค้ดตัวอย่าง) */}
              <Image
                className="transition-transform duration-500 ease-in-out group-hover:scale-110"
                src={intern.imageSrc} // 🚨 ต้องแน่ใจว่า data ของคุณมี field 'imageSrc'
                alt={intern.name}     // 🚨 ต้องแน่ใจว่า data ของคุณมี field 'name'
                fill 
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={intern.id <= 4}
              />

              {/* ส่วน Admin UI (Checkbox & ปุ่มแก้ไข) (จากโค้ดเดิม) */}
              {/* ผมย้ายมาไว้ด้านบนสุด และใช้ absolute z-10 ให้ลอยทับรูปครับ */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
                <input 
                  type="checkbox" 
                  className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-400 focus:ring-blue-500 bg-white/70 backdrop-blur-sm" 
                />
                <div className="flex space-x-2">
                  <span className="bg-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-full shadow-lg cursor-pointer hover:bg-yellow-300 transition-colors">
                    แก้ไข
                  </span>
                </div>
              </div>

              {/* Overlay (จากโค้ดตัวอย่าง) */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/60 to-transparent backdrop-blur-sm text-white transition-all duration-500 ease-in-out translate-y-full group-hover:translate-y-0"
              >
                <h2 className="text-2xl font-bold text-white mb-1">
                  {intern.name}
                </h2>
                <p className="text-md font-medium text-blue-300 mb-4">
                  {intern.title} {/* 🚨 ต้องแน่ใจว่า data ของคุณมี field 'title' */}
                </p>

                {/* ไอคอน Social (จากโค้ดตัวอย่าง) */}
                <div className="flex justify-center gap-5 mt-4">
                  {intern.instagram && (
                    <a href={intern.instagram} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-all duration-300 ease-in-out hover:-translate-y-1">
                      <FaInstagram size={24} />
                    </a>
                  )}
                  {intern.github && (
                    <a href={intern.github} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-all duration-300 ease-in-out hover:-translate-y-1">
                      <FaGithub size={24} />
                    </a>
                  )}
                  {intern.portfolio && (
                    <button onClick={() => openModal(intern.portfolio)} className="text-white/80 hover:text-white transition-all duration-300 ease-in-out hover:-translate-y-1">
                      <FolderKanban size={24} />
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
          
        </div> {/* ปิด grid */}
        {/* === Modal (จากโค้ดตัวอย่าง) === */}
        {modalUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop (คลิกเพื่อปิด) */}
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
              onClick={closeModal} 
            />
            
            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-6xl h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
              
              {/* Modal Header (เพิ่มปุ่มสลับจอ) */}
              <div className="flex justify-between items-center p-3 border-b bg-gray-50 rounded-t-lg">
                
                {/* (ซ้าย) URL */}
                <span className="text-gray-600 text-sm truncate hidden md:block">{modalUrl}</span>

                {/* (ขวา) ปุ่มสลับ PC / Mobile และ ปุ่มปิด */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setViewMode('desktop')}
                    className={`p-2 rounded-md ${viewMode === 'desktop' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'} transition-colors`}
                    aria-label="Desktop View"
                  >
                    <Monitor size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('mobile')}
                    className={`p-2 rounded-md ${viewMode === 'mobile' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'} transition-colors`}
                    aria-label="Mobile View"
                  >
                    <Smartphone size={18} />
                  </button>
                  
                  {/* (ปุ่มปิด "กากบาท") */}
                  <button 
                    onClick={closeModal} 
                    className="text-gray-500 hover:text-gray-900 transition-colors ml-2"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              {/* Iframe Container */}
              <div className="w-full h-full p-4 bg-gray-300 rounded-b-lg overflow-auto flex justify-center">
                <iframe 
                  src={modalUrl} 
                  // (กำหนดขนาด iframe ตาม viewMode)
                  className={`
                    h-full rounded-lg shadow-xl transition-all duration-300 ease-in-out
                    ${viewMode === 'desktop' ? 'w-full' : 'w-[375px] max-w-full'} 
                  `}
                  title="Portfolio Preview"
                  frameBorder="0"
                />
              </div>
            </div>
          </div>
        )}

      </div> {/* ปิด ส่วนเนื้อหาหลัก */}
    </Layouts>
  );
}