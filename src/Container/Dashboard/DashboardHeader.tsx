import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router"; 
import { Bell, Mail, Clock, CheckCircle2, Download, Plus, X, MessageSquare } from "lucide-react";

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

  // --- State สำหรับ Popup แจ้งเตือน ---
  const [showPopup, setShowPopup] = useState(false);
  const [latestMsg, setLatestMsg] = useState<ContactMessage | null>(null);
  // ใช้ Ref เก็บ ID ล่าสุดเพื่อเปรียบเทียบ (ไม่ให้เด้งซ้ำ)
  const lastMsgIdRef = useRef<number | null>(null); 

  // --- Logic การดึงข้อมูล ---
  const fetchNotifications = useCallback(async () => {
    try {
      const resNew = await fetch(`/api/contact/contacts?status=new&limit=5`);
      const dataNew = await resNew.json();

      const resOld = await fetch(`/api/contact/contacts?status=in-progress&limit=3`);
      const dataOld = await resOld.json();

      const combined = [...(dataNew.data || []), ...(dataOld.data || [])];
      setNotifications(combined);
      setUnreadCount(dataNew.data?.length || 0);

      // --- 🔔 Logic ตรวจจับข้อความใหม่เพื่อเด้ง Popup ---
      if (dataNew.data && dataNew.data.length > 0) {
        const newest = dataNew.data[0]; // ข้อความล่าสุด (ตัวแรกใน array)

        // ถ้าเป็นครั้งแรกที่โหลดหน้าเว็บ ให้จำ ID ไว้เฉยๆ ไม่ต้องเด้ง (กันรำคาญตอน refresh)
        if (lastMsgIdRef.current === null) {
            lastMsgIdRef.current = newest.id;
        } 
        // ถ้ามี ID ใหม่ ที่ไม่ตรงกับอันเดิม -> แสดง Popup!
        else if (newest.id !== lastMsgIdRef.current) {
            setLatestMsg(newest);
            setShowPopup(true);
            lastMsgIdRef.current = newest.id;
            
            // เล่นเสียงแจ้งเตือน (Optional)
            const audio = new Audio('/notification.mp3'); // ต้องมีไฟล์เสียงใน public
            audio.play().catch(() => {}); // กัน error ถ้า browser บล็อก
        }
      }

    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  // --- Logic เมื่อคลิกอ่าน ---
  const handleClickNotification = async (id: number) => {
    try {
      await fetch(`/api/contact/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in-progress" }),
      });

      setIsOpen(false);
      setShowPopup(false); // ปิด Popup ด้วยถ้ากดอ่าน
      router.push(`/message?id=${id}`);
      
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "in-progress" } : n))
      );

    } catch (err) {
      console.error(err);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "เมื่อสักครู่";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชม. ที่แล้ว`;
    return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  };

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
    const interval = setInterval(fetchNotifications, 60000); // เช็คทุก 1 นาที
    return () => clearInterval(interval);
  }, [fetchNotifications]);


  return (
    <>
      {/* --- CSS Animation --- */}
      <style>{`
        @keyframes bell-shake {
          0% { transform: rotate(0); }
          15% { transform: rotate(15deg); }
          30% { transform: rotate(-15deg); }
          45% { transform: rotate(10deg); }
          60% { transform: rotate(-10deg); }
          75% { transform: rotate(5deg); }
          85% { transform: rotate(-5deg); }
          100% { transform: rotate(0); }
        }
        .animate-bell {
          animation: bell-shake 1.2s cubic-bezier(.36,.07,.19,.97) both infinite;
          transform-origin: top center;
        }
        @keyframes popup-bounce {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* --- 🔔 New Message Popup (Modal) --- */}
      {showPopup && latestMsg && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300">
           <div 
             className="bg-white/90 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden"
             style={{ animation: 'popup-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
           >
              {/* Background Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl"></div>

              <div className="relative z-10 text-center">
                 <div className="w-16 h-16 bg-linear-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30 animate-bell">
                    <MessageSquare className="text-white" size={32} />
                 </div>
                 
                 <h3 className="text-2xl font-bold text-slate-800 mb-1">มีข้อความใหม่!</h3>
                 <p className="text-slate-500 text-sm mb-6">คุณได้รับการติดต่อใหม่จากหน้าเว็บไซต์</p>

                 <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-100 mb-6">
                    <p className="text-xs text-slate-400 mb-1">ผู้ส่ง: <span className="text-slate-700 font-bold">{latestMsg.name}</span></p>
                    <p className="text-xs text-slate-400 mb-1">หัวข้อ: <span className="text-slate-700 font-medium">{latestMsg.subject}</span></p>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2 italic">"{latestMsg.message}"</p>
                 </div>

                 <div className="flex gap-3">
                    <button 
                      onClick={() => setShowPopup(false)}
                      className="flex-1 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors"
                    >
                      ไว้ทีหลัง
                    </button>
                    <button 
                      onClick={() => handleClickNotification(latestMsg.id)}
                      className="flex-1 py-3 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 text-white font-bold shadow-lg shadow-violet-500/30 hover:scale-105 transition-transform"
                    >
                      อ่านข้อความ
                    </button>
                 </div>
              </div>

              <button 
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={20}/>
              </button>
           </div>
        </div>
      )}


      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-40 mb-2">
        
        {/* Title Section */}
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-violet-700 via-fuchsia-600 to-violet-700 bg-clip-text text-transparent">
            Executive Dashboard
          </h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            ภาพรวมบริษัท Me Prompt Technology ประจำเดือนพฤศจิกายน
          </p>
        </div>

        {/* Action Section */}
        <div className="flex items-center gap-4" ref={dropdownRef}>
          
          {/* Notification Bell */}
          <div className="relative">
              <button
              className={`relative p-3 rounded-2xl transition-all duration-300 border ${
                  isOpen 
                  ? "bg-violet-50 text-violet-600 border-violet-200" 
                  : "bg-white text-slate-400 border-white hover:border-violet-100 hover:text-violet-600 hover:shadow-md"
              }`}
              onClick={() => setIsOpen(!isOpen)}
              >
              <Bell size={22} className={unreadCount > 0 ? "animate-bell text-violet-600" : ""} />
              {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-ping"></span>
              )}
              {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
              <div className="absolute right-0 top-full mt-4 w-96 bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-700">การแจ้งเตือน</h3>
                      {unreadCount > 0 && (
                          <span className="bg-red-100 text-red-600 text-[10px] px-2 py-1 rounded-full font-bold">
                          {unreadCount} ใหม่
                          </span>
                      )}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                          <div className="divide-y divide-slate-100">
                              {notifications.map((noti) => (
                                  <div
                                      key={noti.id}
                                      onClick={() => handleClickNotification(noti.id)}
                                      className={`p-4 hover:bg-violet-50/50 cursor-pointer transition-colors flex gap-4 items-start ${
                                          noti.status === "new" ? "bg-blue-50/30" : "bg-transparent"
                                      }`}
                                  >
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
                                          noti.status === "new" ? "bg-violet-100 border-violet-200 text-violet-600" : "bg-slate-100 border-slate-200 text-slate-500"
                                      }`}>
                                          <Mail size={18} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-start mb-1">
                                              <p className={`text-sm truncate pr-2 ${noti.status === "new" ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                                                  {noti.name}
                                              </p>
                                              <span className="text-[10px] text-slate-400 flex items-center gap-1 whitespace-nowrap">
                                                  <Clock size={10} />
                                                  {getTimeAgo(noti.createdAt)}
                                              </span>
                                          </div>
                                          <p className={`text-xs mb-1 truncate ${noti.status === "new" ? "text-slate-800 font-medium" : "text-slate-500"}`}>
                                              {noti.subject || "ไม่มีหัวข้อ"}
                                          </p>
                                          <p className="text-[11px] text-slate-400 line-clamp-1">
                                              {noti.message || "คลิกเพื่อดูรายละเอียดข้อความ..."}
                                          </p>
                                      </div>
                                      {noti.status === "new" && (
                                          <div className="w-2 h-2 bg-violet-500 rounded-full shadow-sm mt-2"></div>
                                      )}
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="p-8 text-center text-slate-400">
                              <CheckCircle2 size={48} className="mx-auto mb-3 text-slate-200" />
                              <p>ไม่มีการแจ้งเตือนใหม่</p>
                          </div>
                      )}
                  </div>

                  <Link href="/message">
                      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center hover:bg-slate-100 transition-colors cursor-pointer">
                          <span className="text-xs font-bold text-violet-600 hover:underline">
                              ดูประวัติการแจ้งเตือนทั้งหมด
                          </span>
                      </div>
                  </Link>
              </div>
              )}
          </div>

          {/* Buttons Group */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md">
              <Download size={18} />
              <span className="hidden sm:inline">Download Report</span>
            </button>
            
            <Link href="/project">
              <button className="flex items-center gap-2 bg-violet-600 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/30 hover:-translate-y-1">
                <Plus size={18} />
                <span>สร้างโปรเจกต์ใหม่</span>
              </button>
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}