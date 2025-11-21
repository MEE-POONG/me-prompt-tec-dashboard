import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

// --- Type Definitions ---
interface HandledBy {
  name: string;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message?: string;
  status: string;
  createdAt: string;
  handledBy: HandledBy | null;
}

export default function DashboardHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<ContactMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      // ดึง 5 ข้อความใหม่ล่าสุด
      const resNew = await fetch(`/api/contact/contacts?status=new&limit=5`);
      const dataNew = await resNew.json();

      // ดึง 2 ข้อความเก่าที่อ่านแล้ว
      const resOld = await fetch(`/api/contact/contacts?status=in-progress&limit=2`);
      const dataOld = await resOld.json();

      // รวมกัน: ใหม่ + เก่า
      const combined = [...(dataNew.data || []), ...(dataOld.data || [])];

      setNotifications(combined);
      setUnreadCount(dataNew.data?.length || 0);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleClickNotification = async (id: number) => {
    try {
      const res = await fetch(`/api/contact/contacts?id=${id}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "in-progress" } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
    }
  };

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // update ทุก 1 นาที
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-40">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Executive Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          ภาพรวมบริษัท Me Prompt Technology ประจำเดือนพฤศจิกายน
        </p>
      </div>

      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {/* 🔔 Bell */}
        <div
          className="relative cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-sm">การแจ้งเตือน</h3>
              <Link href="/message" className="text-xs text-blue-600 hover:underline">
                อ่านทั้งหมด
              </Link>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((noti) => (
                  <div
                    key={noti.id}
                    className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex gap-3 items-start ${
                      noti.status === "new" ? "bg-blue-50/30" : ""
                    }`}
                    onClick={() => handleClickNotification(noti.id)}
                  >
                    <div
                      className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                        noti.status === "new" ? "bg-red-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <div>
                      <p
                        className={`text-xs ${
                          noti.status === "new"
                            ? "font-semibold text-gray-800"
                            : "text-gray-500"
                        }`}
                      >
                        {noti.subject || noti.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {formatDate(noti.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-xs">
                  ไม่มีการแจ้งเตือนใหม่
                </div>
              )}
            </div>

            <div className="p-2 text-center border-t border-gray-100 bg-gray-50">
              <Link
                href="/message"
                className="text-xs text-gray-500 hover:text-blue-600 block py-1"
              >
                ดูประวัติการแจ้งเตือนทั้งหมด
              </Link>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 ml-4">
          <button className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Download Report
          </button>
          <Link href="/project">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
              + สร้างโปรเจกต์ใหม่
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
  