import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, GraduationCap } from 'lucide-react';

interface PersonData {
  id: string;
  name: {
    first: string;
    last: string;
    display?: string;
  };
  title?: string;     // ของพนักงาน
  coopType?: string;  // ของนักศึกษา
  photo?: string;     // รูปพนักงาน
  avatar?: string;    // รูปนักศึกษา
  gen?: string;       // รุ่น
}

export default function DashboardRightPanel() {
  const [members, setMembers] = useState<PersonData[]>([]);
  const [interns, setInterns] = useState<PersonData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. ดึงข้อมูลพนักงาน "ทั้งหมด" (ตั้ง limit 100)
        const resMember = await fetch('/api/member?limit=100&sortBy=createdAt&order=desc');
        const jsonMember = await resMember.json();
        if (resMember.ok) setMembers(jsonMember.data);

        // 2. ดึงข้อมูลนักศึกษา "รุ่นที่ 6" ทั้งหมด (เพื่อแสดงเป็นชุดปัจจุบัน)
        const resIntern = await fetch('/api/intern?limit=100&sortBy=createdAt&order=desc&gen=6');
        const jsonIntern = await resIntern.json();
        if (resIntern.ok) setInterns(jsonIntern.data);

      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* ------------------------------------------ */}
      {/* 🧑‍💼 ส่วนที่ 1: พนักงาน (Team Members) */}
      {/* ------------------------------------------ */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
               <Users size={18} className="text-blue-600" /> พนักงาน
            </h3>
            {/* แสดงจำนวนพนักงานแทนลิงก์ */}
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {members.length} คน
            </span>
        </div>

        {/* แสดงพนักงานทั้งหมด (มี Scrollbar) */}
        <div className="space-y-3 max-h-[300px] pr-1 custom-scrollbar overflow-hidden">
          {isLoading ? (
            <div className="text-center text-gray-400 text-xs py-4">กำลังโหลด...</div>
          ) : members.length > 0 ? (
            members.map((person) => (
                <Link href={`/teammember/edit/${person.id}`} key={person.id}>
                    <div className="flex items-center gap-3 p-2 hover:bg-blue-50/50 hover:scale-105 duration-300 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-blue-100">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-200 shrink-0">
                            <Image 
                                src={person.photo || '/default-avatar.png'} 
                                alt={person.name.display || ''} 
                                fill 
                                style={{ objectFit: 'cover' }} 
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-700 group-hover:text-blue-700 truncate">
                                {person.name.display || `${person.name.first} ${person.name.last}`}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">{person.title || 'No Title'}</p>
                        </div>
                        
                        {/* ❌ เอาจุดเขียว (Status) ออกแล้ว */}
                        
                    </div>
                </Link>
            ))
          ) : (
            <div className="text-center text-gray-400 text-xs py-4 border border-dashed border-gray-200 rounded-lg">ไม่พบข้อมูล</div>
          )}
        </div>
        
        <Link href="/teammember">
            <button className="w-full mt-4 py-2 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-semibold">
                ดูข้อมูลทั้งหมด
            </button>
        </Link>
      </div>

      {/* ------------------------------------------ */}
      {/* 🎓 ส่วนที่ 2: เด็กฝึกงาน (Interns) */}
      {/* ------------------------------------------ */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
            {/* ❌ เอาคำว่า (รุ่น 6) ออก */}
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
               <GraduationCap size={18} className="text-orange-500" /> เด็กฝึกงาน
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {interns.length} คน
            </span>
        </div>

        <div className="space-y-3 max-h-[300px] pr-1 custom-scrollbar overflow-hidden">
          {isLoading ? (
            <div className="text-center text-gray-400 text-xs py-4">กำลังโหลด...</div>
          ) : interns.length > 0 ? (
            interns.map((person) => (
                <Link href={`/editintern/${person.id}`} key={person.id}>
                    <div className="flex items-center gap-3 p-2 hover:bg-orange-50/50 hover:scale-105 duration-300 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-orange-100">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-200 shrink-0">
                            <Image 
                                src={person.avatar || '/default-avatar.png'} 
                                alt={person.name.display || ''} 
                                fill 
                                style={{ objectFit: 'cover' }} 
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-700 group-hover:text-orange-700 truncate">
                                {person.name.display || `${person.name.first} ${person.name.last}`}
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-[11px] text-gray-500 truncate">
                                    {person.coopType === 'coop' ? 'สหกิจศึกษา' : 'ฝึกงาน'}
                                </p>
                            </div>
                        </div>
                        
                        {/* ❌ เอาป้าย G6 ออกแล้ว */}
                        
                    </div>
                </Link>
            ))
          ) : (
            <div className="text-center text-gray-400 text-xs py-8 border-2 border-dashed border-gray-100 rounded-xl">
                <p>ยังไม่มีข้อมูล</p>
            </div>
          )}
        </div>

        {/* เปลี่ยนปุ่มเป็น ดูข้อมูลทั้งหมด */}
        <Link href="/intern">
            <button className="w-full mt-4 py-2 text-xs text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors font-semibold">
                ดูข้อมูลทั้งหมด
            </button>
        </Link>
      </div>

    </div>
  );
}