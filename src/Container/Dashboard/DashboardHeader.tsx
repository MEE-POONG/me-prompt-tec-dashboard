import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router"; 
import { Bell, Mail, Clock, CheckCircle2 } from "lucide-react";

// --- Type Definitions ---
interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message?: string;
  status: string;
  createdAt: string;
}

export default function DashboardHeader() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<ContactMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      // ดึง 5 ข้อความใหม่
      const resNew = await fetch(`/api/contact/contacts?status=new&limit=5`);
      const dataNew = await resNew.json();

      // ดึง 3 ข้อความเก่า
      const resOld = await fetch(`/api/contact/contacts?status=in-progress&limit=3`);
      const dataOld = await resOld.json();

      const combined = [...(dataNew.data || []), ...(dataOld.data || [])];

      setNotifications(combined);
      setUnreadCount(dataNew.data?.length || 0);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleClickNotification = async (id: number) => {
    try {
      // ✅ แก้ไขการเรียก API ให้ถูกต้อง
      // เปลี่ยน URL เป็น /api/contact/${id} (สำหรับอัปเดตรายการเดียว)
      // เปลี่ยน Method เป็น PUT (ตาม API ฝั่ง Backend)
      await fetch(`/api/contact/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in-progress" }),
      });

      setIsOpen(false);
      router.push(`/message?id=${id}`);
      
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "in-progress" } : n))
      );

    } catch (err) {
      console.error(err);
    }
  };

  // ... (ส่วน useEffect และ render เหมือนเดิม)
  
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
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "เมื่อสักครู่";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชม. ที่แล้ว`;
    return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
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
        <button
          className={`relative p-2.5 rounded-full transition-all duration-200 ${
            isOpen ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
            <div className="px-5 py-4 border-b border-gray-50 bg-white flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                การแจ้งเตือน
                {unreadCount > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} ใหม่
                    </span>
                )}
              </h3>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {notifications.map((noti) => (
                    <div
                      key={noti.id}
                      onClick={() => handleClickNotification(noti.id)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors group relative flex gap-4 items-start
                        ${noti.status === "new" ? "bg-blue-50/30" : "bg-white"}
                      `}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
                          noti.status === "new" ? "bg-blue-100 border-blue-200 text-blue-600" : "bg-gray-100 border-gray-200 text-gray-500"
                      }`}>
                          <Mail size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <p className={`text-sm truncate pr-2 ${noti.status === "new" ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                                {noti.name}
                            </p>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 whitespace-nowrap">
                                <Clock size={10} />
                                {getTimeAgo(noti.createdAt)}
                            </span>
                        </div>
                        <p className={`text-xs mb-1 truncate ${noti.status === "new" ? "text-gray-800 font-medium" : "text-gray-500"}`}>
                            {noti.subject || "ไม่มีหัวข้อ"}
                        </p>
                        <p className="text-[11px] text-gray-400 line-clamp-1">
                            {noti.message || "คลิกเพื่อดูรายละเอียดข้อความ..."}
                        </p>
                      </div>
                      {noti.status === "new" && (
                        <div className="absolute top-1/2 right-3 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-sm shadow-blue-200"></div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center flex flex-col items-center justify-center text-gray-400">
                  <div className="bg-gray-50 p-4 rounded-full mb-3">
                    <CheckCircle2 size={32} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">ไม่มีการแจ้งเตือนใหม่</p>
                </div>
              )}
            </div>

            <Link href="/message">
                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                    <span className="text-xs font-semibold text-blue-600 hover:underline">
                        ดูประวัติการแจ้งเตือนทั้งหมด
                    </span>
                </div>
            </Link>
          </div>
        )}

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