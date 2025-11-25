import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { GradientBackground } from "@/components/animate-ui/components/backgrounds/gradient";

export default function WelcomeBanner() {
  return (
    <div className=" rounded-2xl p-8 text-white shadow-lg mb-8 relative ">
      <GradientBackground className="absolute inset-0 rounded-2xl" />
      {/* Background Pattern (ตกแต่งพื้นหลัง) */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            สวัสดีผู้ดูแลระบบ
            <div className="relative">
              {/* Glow Effect */}
              <div className="relative animate-heartbeat">
                <div className="absolute inset-0 blur-xl bg-yellow-300 opacity-60 rounded-full"></div>
                <Sparkles
                  size={24}
                  className="text-yellow-300 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]"
                />
              </div>
            </div>
          </h2>
          <p className="text-white max-w-2xl text-lg">
            ยินดีต้อนรับสู่ระบบจัดการหลังบ้าน Me Prompt Technology
            ศูนย์กลางการจัดการข้อมูลโปรเจกต์ บุคลากร และนักศึกษาฝึกงาน
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/project_create">
            <button className="bg-white text-blue-700 font-bold py-3 px-6 rounded-xl shadow-md hover:bg-blue-50 hover:text-fuchsia-600 duration-300 transition-transform hover:scale-105 active:scale-95">
              + เพิ่มผลงานใหม่
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
