import React from 'react';
import Link from 'next/link';
import { Users, Briefcase, GraduationCap, Building2, ArrowRight } from 'lucide-react';

interface DashboardStatsProps {
  totalInterns: number;
}

export default function DashboardStats({ totalInterns }: DashboardStatsProps) {
  
  // ข้อมูลจำลองสำหรับองค์กร
  const stats = [
    {
      label: "โปรเจกต์ทั้งหมด (Portfolio)",
      value: 12,
      unit: "งาน",
      icon: <Briefcase size={24} />,
      color: "bg-purple-50 text-purple-600",
      link: "/project",
      desc: "+3 งานในเดือนนี้"
    },
    {
      label: "พนักงานประจำ (Full-time)",
      value: 8,
      unit: "คน",
      icon: <Users size={24} />,
      color: "bg-blue-50 text-blue-600",
      link: "/teammember",
      desc: "ทีมพัฒนา & ดีไซน์"
    },
    {
      label: "นักศึกษาฝึกงาน (Interns)",
      value: totalInterns,
      unit: "คน",
      icon: <GraduationCap size={24} />,
      color: "bg-orange-50 text-orange-600",
      link: "/intern",
      desc: "กำลังฝึกงานอยู่"
    },
    {
      label: "สถาบันพันธมิตร (Partners)",
      value: 5,
      unit: "แห่ง",
      icon: <Building2 size={24} />,
      color: "bg-pink-50 text-pink-600",
      link: "#", // ใส่ลิงก์หน้า Partner ถ้ามี
      desc: "MOU และความร่วมมือ"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Link key={index} href={stat.link}>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group h-full">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.color} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <span className="text-gray-300 group-hover:text-blue-500 transition-colors">
                <ArrowRight size={20} />
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {stat.value} <span className="text-base font-normal text-gray-400">{stat.unit}</span>
              </h3>
              <p className="text-xs text-gray-400 mt-2">{stat.desc}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}