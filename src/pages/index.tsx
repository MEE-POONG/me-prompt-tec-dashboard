import React from "react";
import Layouts from "@/components/Layouts";
import { Intern } from "@/Data/data_intern";

// Import Components
import DashboardHeader from "@/Container/Dashboard/DashboardHeader";
import WelcomeBanner from "@/Container/Dashboard/WelcomeBanner";
import DashboardStats from "@/Container/Dashboard/DashboardStats";
import ProjectStatus from "@/Container/Dashboard/ProjectStatus";
import DashboardRightPanel from "@/Container/Dashboard/DashboardRightPanel";

export default function Home() {
  return (
    <Layouts>
      <div className="relative min-h-screen bg-[#f9fafb] overflow-hidden text-black font-sans">

        {/* --- 🌟 Background Aurora (ปรับให้สว่างและสดใสขึ้น) --- */}
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
          {/* สีม่วงอ่อน (Violet) */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-400/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>

          {/* สีชมพูอ่อน (Pink) */}
          <div className="absolute top-[10%] right-[-10%] w-[45%] h-[45%] bg-pink-400/20 rounded-full blur-[100px] mix-blend-multiply"></div>

          {/* สีฟูเชีย (Fuchsia) */}
          <div className="absolute bottom-[-10%] left-[10%] w-[50%] h-[50%] bg-fuchsia-400/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>

          {/* สีฟ้าอ่อนๆ แซมนิดหน่อย */}
          <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-blue-300/20 rounded-full blur-[120px] mix-blend-multiply"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 p-6 md:p-8 w-full max-w-7xl mx-auto space-y-8">

          <DashboardHeader />
          <WelcomeBanner />

          <div className="space-y-8">
            <div className="py-2">
              <DashboardStats />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ProjectStatus />
            </div>
            <div className="lg:col-span-1">
              <DashboardRightPanel />
            </div>
          </div>

        </div>
      </div>
    </Layouts>
  );
}