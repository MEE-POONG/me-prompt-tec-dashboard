import React, { useState } from "react";
import Layouts from "@/components/Layouts";
// ตรวจสอบ path นี้ให้ตรงกับโฟลเดอร์จริงของคุณ
import { Intern } from "@/Data/dataintern";

// Import Components ที่เราแยกไว้
import DashboardHeader from "@/Container/Dashboard/DashboardHeader";
import DashboardStats from "@/Container/Dashboard/DashboardStats";
import ProjectStatus from "@/Container/Dashboard/ProjectStatus";
import DashboardRightPanel from "@/Container/Dashboard/DashboardRightPanel";
import WelcomeBanner from "@/Container/Dashboard/WelcomeBanner"; // ✅ เพิ่มตัวใหม่

export default function Home() {
  return (
    <Layouts>
      <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 text-black">
        {/* 1. ส่วนหัว (Header) */}
        <DashboardHeader />

        {/* 2. แบนเนอร์ต้อนรับ (Welcome Banner) */}
        <WelcomeBanner />

        {/* 3. การ์ดสถิติองค์กร (Stats) */}
        <DashboardStats totalInterns={Intern.length} totalMembers={0} />

        {/* 4. เนื้อหาหลัก (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
          {/* ฝั่งซ้าย: สถานะโปรเจกต์ */}
          <div className="lg:col-span-2">
            <ProjectStatus />
          </div>

          {/* ฝั่งขวา: ข้อความ & ทีมงาน */}
          <div className="lg:col-span-1">
            <DashboardRightPanel />
          </div>
        </div>
      </div>
    </Layouts>
  );
}
