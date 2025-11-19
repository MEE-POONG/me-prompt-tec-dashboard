import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

interface DashboardHeaderProps {
  unreadCount: number;
}

export default function DashboardHeader({ unreadCount }: DashboardHeaderProps) {
  
  // 1. State สำหรับเปิด/ปิด เมนูแจ้งเตือน
  const [isOpen, setIsOpen] = useState(false);
  
  // 2. Ref สำหรับตรวจจับการคลิกนอกพื้นที่เมนู
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 3. ฟังก์ชันปิดเมนูเมื่อคลิกที่อื่น
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // 4. ข้อมูลแจ้งเตือนจำลอง (Mock Data)
  const notifications = [
    { id: 1, text: "มีข้อความใหม่จากคุณสมชาย", time: "10 นาทีที่แล้ว", read: false },
    { id: 2, text: "บริษัท เอบีซี ส่งข้อเสนอ MOU", time: "2 ชั่วโมงที่แล้ว", read: false },
    { id: 3, text: "น้องแนน ส่งใบสมัครฝึกงาน", time: "เมื่อวาน", read: true },
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-40">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Executive Dashboard</h1>
        <p className="text-gray-500 mt-1">ภาพรวมบริษัท Me Prompt Technology ประจำเดือนพฤศจิกายน</p>
      </div>
      
      <div className="flex items-center gap-4">
         
         {/* === 🔔 ส่วนปุ่มแจ้งเตือน (Dropdown) === */}
         <div className="relative" ref={dropdownRef}>
            {/* ตัวปุ่มกระดิ่ง */}
            <div 
              className={`cursor-pointer p-2 rounded-full transition-colors relative ${isOpen ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
              onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={24} />
                {/* จุดแดงแจ้งเตือน */}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
            </div>

            {/* ตัวเมนูที่จะเด้งลงมา (แสดงเมื่อ isOpen = true) */}
            {isOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                 {/* หัวข้อ */}
                 <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 text-sm">การแจ้งเตือน</h3>
                    <button className="text-xs text-blue-600 hover:underline">อ่านทั้งหมด</button>
                 </div>

                 {/* รายการแจ้งเตือน */}
                 <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((noti) => (
                        <div key={noti.id} className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex gap-3 items-start ${!noti.read ? 'bg-blue-50/30' : ''}`}>
                           {/* จุดสีบอกสถานะ */}
                           <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!noti.read ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                           <div>
                              <p className={`text-xs ${!noti.read ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                                {noti.text}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1">{noti.time}</p>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-400 text-xs">ไม่มีการแจ้งเตือนใหม่</div>
                    )}
                 </div>

                 {/* Footer */}
                 <div className="p-2 text-center border-t border-gray-100 bg-gray-50">
                    <Link href="#" className="text-xs text-gray-500 hover:text-blue-600 block py-1">
                       ดูประวัติการแจ้งเตือนทั้งหมด
                    </Link>
                 </div>
              </div>
            )}
         </div>

         {/* ปุ่มอื่นๆ */}
         <div className="flex gap-3">
            <button className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
               Download Report
            </button>
            <Link href="/project">
               <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                   + สร้างโปรเจกต์ใหม่
               </button>
            </Link>
         </div>
      </div>
    </div>
  );
}