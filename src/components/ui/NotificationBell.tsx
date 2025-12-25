import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Clock } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

// Types
interface Notification {
  id: number;
  user: string;
  avatarColor: string;
  action: string;
  target: string;
  time: string;
  isRead: boolean;
  type: 'comment' | 'move' | 'update' | 'upload';
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const socketHook = useSocket();
  const socket = socketHook ? socketHook.socket : null;

  useEffect(() => {
    // Mock Data เริ่มต้น เพื่อทดสอบ UI
    setNotifications([
        {
          id: Date.now(),
          user: "System",
          avatarColor: "bg-green-500",
          action: "Welcome",
          target: "to Workspace",
          time: "Just now",
          isRead: false,
          type: 'update'
        }
    ]);

    if (!socket) return;

    socket.on("receive-notification", (newNotif: any) => {
        console.log("🔔 Notification Received:", newNotif); // Log ดูว่าได้รับข้อมูลไหม
        const notifObj: Notification = {
            id: Date.now(),
            user: newNotif.user || "System",
            avatarColor: newNotif.avatarColor || "bg-blue-500",
            action: newNotif.action || "updated something",
            target: newNotif.target || "",
            time: new Date().toLocaleTimeString(), 
            isRead: false,
            type: newNotif.type || 'update'
        };
        
        setNotifications(prev => [notifObj, ...prev]);
    });

    return () => {
        socket.off("receive-notification");
    };
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  const markAsRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-all relative ${isOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-9999 animate-in fade-in zoom-in-95 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
            {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"><Check size={14}/> Mark all read</button>}
          </div>
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? <div className="py-8 text-center text-slate-400 text-sm">No new notifications</div> : 
               notifications.map((n) => (
                 <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-3 border-b border-slate-50 flex gap-3 hover:bg-slate-50 cursor-pointer ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm ${n.avatarColor}`}>{n.user.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 leading-snug"><span className="font-bold text-slate-900">{n.user}</span> {n.action} <span className="font-medium text-slate-800">"{n.target}"</span></p>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Clock size={10}/> {n.time}</p>
                    </div>

                    +++
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"></div>}
                 </div>
               ))
            }
          </div>
        </div>
      )}
    </div>
  );
}