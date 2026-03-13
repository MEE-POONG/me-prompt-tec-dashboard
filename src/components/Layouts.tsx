import Head from "next/head";
import React, { ReactNode, useState, useEffect } from "react"; // ✅ เพิ่ม useEffect
import NavBar from "./ui/NavBar";
import SideBar from "./ui/SideBar";
import { StarsBackground } from "./animate-ui/components/backgrounds/stars";
import ProtectedRoute from "./auth/ProtectedRoute";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layouts({
  children,
  title = "DashBoard",
  description = "Dashboard ใช้ในเว็บ Me-Prompt-Tec",
}: LayoutProps) {
  // ดึงค่า sidebar จาก localStorage เมื่อเริ่มต้น
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarOpen");
      return saved === "true";
    }
    return false;
  });

  // ✅ 1. เพิ่ม State สำหรับเก็บ Role (ค่าเริ่มต้นเป็น viewer กันเหนียว)
  const [userRole, setUserRole] = useState<string>("viewer");

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    // บันทึกค่าลง localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarOpen", String(newState));
    }
  };

  // ✅ 2. ดึงข้อมูล Role และ Sidebar state จาก LocalStorage เมื่อหน้าเว็บโหลดเสร็จ
  useEffect(() => {
    // เช็คว่ารันบน Browser (client-side)
    if (typeof window !== "undefined") {
      // ดึงค่า sidebar state
      const savedSidebar = localStorage.getItem("sidebarOpen");
      if (savedSidebar !== null) {
        setIsSidebarOpen(savedSidebar === "true");
      }

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          // ถ้ามี role ให้ set เข้า state, ถ้าไม่มีให้เป็น viewer
          setUserRole(userObj.role || "viewer");
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Head>
      <ProtectedRoute>
      <div className="flex min-h-screen bg-white">
        {/* Sidebar */}
        {/* ✅ 3. ส่ง userRole ไปให้ Sidebar */}
        <SideBar 
            isOpen={isSidebarOpen} 
            onClose={toggleSidebar} 
            userRole={userRole} 
        />

        {/* Main Content Area */}
        <div
          className={`flex flex-col min-h-screen w-full transition-all duration-300 ${
            isSidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <NavBar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          <main className="grow">{children}</main>
        </div>
      </div>
      </ProtectedRoute>
    </>
  );
}