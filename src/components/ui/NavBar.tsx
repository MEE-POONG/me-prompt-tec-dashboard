"use client";

import { Menu, PanelLeft, PanelLeftClose } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface NavBarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function NavBar({ onToggleSidebar, isSidebarOpen }: NavBarProps) {
  const [user, setUser] = useState<any>(null);

  // ดึงข้อมูล user จาก localStorage ตอนโหลดหน้าเว็บ
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    }
  }, []);

  // ปุ่ม Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/"; // refresh UI หลัง logout
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 w-full">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 w-full">
          {/* LEFT side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110 text-purple-800"
              aria-label="Toggle Sidebar"
            >
              {isSidebarOpen ? <Menu  className="text-white"/> : <Menu  />}
            </button>

            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/img/logo/logo.png"
                alt="logo"
                className="transition-all duration-300 hover:scale-110"
                height={70}
                width={70}
              />
              <span className="hidden md:block text-xl font-bold text-blue-600">
                ME PROMPT <span className="text-orange-400">DashBoard</span>
              </span>
            </Link>
          </div>

          {/* RIGHT side */}
          <div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="font-bold text-gray-800">
                  สวัสดี {user.email}
                </span>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-blue-600 transition-all duration-300 hover:scale-110"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
