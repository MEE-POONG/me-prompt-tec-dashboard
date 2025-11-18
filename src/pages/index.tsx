import React from "react";
import Layouts from "@/components/Layouts";
import Link from "next/link";
import Image from "next/image";
import { Intern } from "@/Data/dataintern"; // ข้อมูลจริง (Intern)
// ถ้ามี Project data ให้นำเข้าตรงนี้ แต่ถ้าไม่มีเดี๋ยวผม Mock ให้ในโค้ด
// import { Projects } from "@/data/project_data"; 

import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreHorizontal
} from "lucide-react";

export default function Home() {
  
  // --- 1. ข้อมูลจริง (Real Data) ---
  const totalInterns = Intern.length;
  
  // --- 2. ข้อมูลจำลอง (Mock Data - เพื่อให้เห็นภาพ Dashboard ธุรกิจ) ---
  // (ในอนาคตคุณต้องเขียน API ไปดึงจาก Database บัญชีจริงๆ)
  const financialStats = {
    revenue: "฿1,250,000",
    revenueGrowth: "+12.5%", // เทียบเดือนก่อน
    expense: "฿450,000",
    expenseGrowth: "-5.2%", // ลดลงถือว่าดี
    profit: "฿800,000",
  };

  const projectStats = {
    total: 12,
    completed: 8,
    inProgress: 3,
    delayed: 1
  };

  // จำลองข้อมูลโปรเจกต์ล่าสุด (เอามาจากหน้า Project ที่คุณส่งรูปมา)
  const recentProjects = [
    { id: 1, name: "AI Chatbot", department: "AI / NLP", status: "In Progress", progress: 75 },
    { id: 2, name: "E-commerce Platform", department: "Web Dev", status: "Completed", progress: 100 },
    { id: 3, name: "Social Media App", department: "Mobile / Flutter", status: "Pending", progress: 30 },
  ];

  return (
    <Layouts>
      <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-8 text-black">
        
        {/* === Header === */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Executive Dashboard</h1>
            <p className="text-gray-500 mt-1">ภาพรวมบริษัท Me Prompt Technology ประจำเดือนพฤศจิกายน</p>
          </div>
          <div className="flex gap-3">
             <button className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Download Report
             </button>
             <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                + สร้างโปรเจกต์ใหม่
             </button>
          </div>
        </div>

        {/* === Section 1: Financial & Overview (การเงิน & ภาพรวม) === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Revenue (รายรับ) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <Wallet size={24} />
              </div>
              <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {financialStats.revenueGrowth} <TrendingUp size={14} className="ml-1" />
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium">รายรับรวม (Revenue)</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-1">{financialStats.revenue}</h3>
          </div>

          {/* Card 2: Expense (รายจ่าย) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <Activity size={24} />
              </div>
              <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {/* Expense ลดลงคือเรื่องดี ให้เป็นสีเขียว */}
                <TrendingDown size={14} className="mr-1" /> {financialStats.expenseGrowth}
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium">รายจ่าย (Expense)</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-1">{financialStats.expense}</h3>
          </div>

          {/* Card 3: Total Interns (HR) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-300 transition-colors group">
            <Link href="/intern">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users size={24} />
                </div>
                <span className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={20} />
                </span>
              </div>
              <p className="text-gray-500 text-sm font-medium">พนักงาน & ฝึกงาน</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{totalInterns} <span className="text-lg text-gray-400 font-normal">คน</span></h3>
            </Link>
          </div>

           {/* Card 4: Active Projects */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-purple-300 transition-colors group">
            <Link href="/project">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Briefcase size={24} />
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium">โปรเจกต์ทั้งหมด</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{projectStats.total} <span className="text-lg text-gray-400 font-normal">งาน</span></h3>
            </Link>
          </div>
        </div>

        {/* === Section 2: Main Content (Grid 2 ส่วน) === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Left: Project Status Overview (KPIs & Operations) --- */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-blue-600"/> สถานะการดำเนินงาน (Project Status)
            </h3>

            {/* Project List with Progress Bars */}
            <div className="space-y-6">
              {recentProjects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h4 className="font-bold text-gray-800">{project.name}</h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{project.department}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full 
                        ${project.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                          project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${
                        project.status === 'Completed' ? 'bg-green-500' : 
                        project.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-400'
                      }`} 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-xs text-gray-400 mt-1">{project.progress}% Completed</p>
                </div>
              ))}
            </div>

            {/* Summary Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-3 text-center">
               <div>
                  <p className="text-gray-500 text-xs">เสร็จสิ้น</p>
                  <p className="text-green-600 font-bold text-xl">{projectStats.completed}</p>
               </div>
               <div>
                  <p className="text-gray-500 text-xs">กำลังทำ</p>
                  <p className="text-blue-600 font-bold text-xl">{projectStats.inProgress}</p>
               </div>
               <div>
                  <p className="text-gray-500 text-xs">ล่าช้า</p>
                  <p className="text-red-500 font-bold text-xl">{projectStats.delayed}</p>
               </div>
            </div>
          </div>

          {/* --- Right: Active Interns / HR Updates --- */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Users size={20} className="text-orange-500"/> ทีมงานล่าสุด (Active)
            </h3>
            
            <div className="space-y-4">
              {Intern.slice(0, 5).map((intern) => (
                <div key={intern.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  {/* Avatar */}
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
                    <Image src={intern.imageSrc} alt={intern.name} fill style={{objectFit: "cover"}} />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{intern.name}</p>
                    <p className="text-xs text-gray-500 truncate">{intern.title}</p>
                  </div>
                  {/* Status Indicator (สุ่มสถานะให้ดูสมจริง) */}
                  <div className="shrink-0">
                    {intern.id % 3 === 0 ? (
                       <span className="w-3 h-3 bg-gray-300 rounded-full block" title="Offline"></span>
                    ) : (
                       <span className="w-3 h-3 bg-green-500 rounded-full block shadow-sm shadow-green-200" title="Online"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Link href="/intern">
              <button className="w-full mt-6 py-2 text-sm text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
                ดูรายชื่อทั้งหมด
              </button>
            </Link>
          </div>

        </div>
      </div>
    </Layouts>
  );
}