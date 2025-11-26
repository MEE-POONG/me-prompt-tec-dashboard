import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function WelcomeBanner() {
  return (
    <div className="relative w-full overflow-hidden rounded-[2.5rem] shadow-2xl shadow-violet-500/20 group">
      
      {/* --- 1. Dynamic Background (แก้สีตรงนี้ให้สว่างขึ้น) --- */}
      {/* ใช้ Violet (ม่วงแกมน้ำเงิน) ไล่ไป Fuchsia (บานเย็น) แบบสดใส */}
      <div className="absolute inset-0 bg-linear-to-r from-violet-600 via-purple-600 to-fuchsia-500"></div>
      
      {/* --- 2. Decorative Shapes --- */}
      {/* ปรับสีลูกเล่นพื้นหลังให้เข้ากัน */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 mix-blend-overlay"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4 mix-blend-overlay"></div>
      
      {/* Pattern Dot */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* --- 3. Content --- */}
      <div className="relative z-10 px-8 py-10 md:px-12 md:py-12 flex flex-col md:flex-row justify-between items-center gap-8">
        
        <div className="max-w-2xl space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium mb-2">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-300"></span>
             </span>
             System Updated v2.4
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            สวัสดีผู้ดูแลระบบ <span className="inline-block animate-bounce">👋</span>
          </h2>
          <p className="text-lg text-purple-50 font-medium leading-relaxed max-w-lg">
            ยินดีต้อนรับสู่ระบบจัดการหลังบ้าน <span className="text-white font-bold">Me Prompt Technology</span> ศูนย์กลางการจัดการข้อมูลโปรเจกต์และบุคลากรแบบครบวงจร
          </p>
        </div>

        {/* --- 4. Glass Button --- */}
        <div className="shrink-0">
          <Link href="/project_create">
            <button className="group relative px-8 py-4 bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/25 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)]">
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative flex items-center gap-3 text-white font-bold text-lg">
                <Sparkles size={20} className="text-yellow-300" />
                เพิ่มผลงานใหม่
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}