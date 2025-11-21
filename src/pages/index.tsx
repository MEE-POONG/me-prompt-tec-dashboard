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
  // State: ข้อความติดต่อจำลอง
  const [contactMessages, setContactMessages] = useState([
    {
      id: 1,
      name: "คุณสมชาย ขายดี",
      email: "somchai@example.com",
      subject: "สนใจจ้างทำเว็บ E-commerce",
      message: "อยากสอบถามราคาทำเว็บขายของออนไลน์ครับ มีระบบตะกร้าสินค้า...",
      date: "10 นาทีที่แล้ว",
      status: "new",
    },
    {
      id: 2,
      name: "คณะบริหารธุรกิจ มทร.อีสาน",
      email: "admin@rmuti.ac.th",
      subject: "ส่งหนังสือขอความอนุเคราะห์ฝึกงาน",
      message: "ขอส่งรายชื่อนักศึกษาฝึกงานประจำภาคเรียนที่ 1/2568...",
      date: "2 ชั่วโมงที่แล้ว",
      status: "new",
    },
    {
      id: 3,
      name: "น้องแนน",
      email: "nan@student.com",
      subject: "สอบถามเรื่องฝึกงาน",
      message: "ปีนี้รับสมัครช่วงเดือนไหนคะ?",
      date: "เมื่อวาน",
      status: "read",
    },
  ]);

  const unreadCount = contactMessages.filter((m) => m.status === "new").length;

  const handleReadMessage = (id: number) => {
    setContactMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "read" } : m))
    );
  };

  return (
    <Layouts>
      <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 text-black">
        {/* 1. ส่วนหัว (Header) */}
        <DashboardHeader />

        {/* 2. แบนเนอร์ต้อนรับ (Welcome Banner) */}
        <WelcomeBanner />

        {/* 3. การ์ดสถิติองค์กร (Stats) */}
        <DashboardStats totalInterns={Intern.length} />

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
