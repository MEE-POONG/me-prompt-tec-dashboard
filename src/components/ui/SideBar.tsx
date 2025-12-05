"use client";

import {
  ChartNoAxesCombined,
  FolderGit2,
  UserRoundPen,
  UserStar,
  Handshake,
  ChevronDown,
  LucideIcon,
  ChevronsLeftRightEllipsis,
  ChevronUp,
  Settings,
  Power,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

// --- Config ดาว ---
const randomStars = (count: number, color: string) => {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 600 - 300;
    const y = Math.random() * 2000 - 1000;
    arr.push(`${x}px ${y}px ${color}`);
  }
  return arr.join(", ");
};

interface UserData {
  name: string;
  email: string;
}

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

type LinkItem = {
  type: "link";
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

type DropdownItem = {
  type: "dropdown";
  key: string;
  label: string;
  icon: LucideIcon;
  children: {
    key: string;
    label: string;
    href: string;
  }[];
};

type MenuItem = LinkItem | DropdownItem;

export default function SideBar({ isOpen, onClose, userRole = "viewer" }: SideBarProps) {
  const [open, setOpen] = useState(false);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    dashboard: true,
  });
  const [user, setUser] = useState<UserData | null>(null);

  // ดาวพื้นหลัง
  const [stars1] = useState(randomStars(100, "rgba(139, 92, 246, 0.4)"));
  const [stars2] = useState(randomStars(50, "rgba(99, 102, 241, 0.4)"));
  const [stars3] = useState(randomStars(30, "rgba(236, 72, 153, 0.3)"));

  const toggle = (key: string) =>
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser) as UserData);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => document.body.classList.remove("no-scroll");
  }, [isOpen]);

  // ✅ ส่วนจัดการเมนูตาม Role (แก้ไขแล้ว)
  const menuItems: MenuItem[] = useMemo(
    () => {
      // 1. รายการเมนูทั้งหมด (Master List)
      const allItems: MenuItem[] = [
        {
          type: "dropdown",
          key: "dashboard",
          label: "Dashboard",
          icon: ChartNoAxesCombined,
          children: [
            { key: "report", label: "Overview", href: "/" },
            { key: "message", label: "Message", href: "/message" },
            { key: "program", label: "Program", href: "/program" },
          ],
        },
        {
          type: "link",
          key: "project",
          label: "Project",
          href: "/project",
          icon: FolderGit2,
        },
        {
          type: "link",
          key: "partnerships",
          label: "Partnerships",
          href: "/manage_partners",
          icon: Handshake,
        },
        {
          type: "link",
          key: "internships",
          label: "Internships",
          href: "/intern",
          icon: UserStar,
        },
        {
          type: "link",
          key: "teams",
          label: "Team Members",
          href: "/teammember",
          icon: UserRoundPen,
        },
        {
          type: "link",
          key: "account",
          label: "Account",
          href: "/account",
          icon: UserRoundPen,
        },
        {
          type: "link",
          key: "workspace",
          label: "Workspace",
          href: "/workspace",
          icon: ChevronsLeftRightEllipsis,
        },
      ];

      const role = userRole?.toUpperCase() || "VIEWER";

      // -----------------------------------------------------------
      // ✅ LOGIC การกรองเมนู (แก้ใหม่เพื่อซ่อนลูกของ Dashboard)
      // -----------------------------------------------------------

      // 1. ADMIN / HR -> เห็นทุกอย่าง
      if (role === "ADMIN" || role === "HR") {
        return allItems;
      }

      // 2. STUDENT -> เห็นแค่ Dashboard (Overview only), Project, Workspace
      if (role === "STUDENT") {
        return allItems
          .filter((item) => ["dashboard", "project", "workspace"].includes(item.key))
          .map((item) => {
            // 🔥 เพิ่มตรงนี้: ถ้าเป็น Dashboard ให้เข้าไปกรอง children ข้างในอีกที
            if (item.key === "dashboard" && item.type === "dropdown") {
              return {
                ...item,
                children: item.children.filter((child) => 
                  !["message", "program"].includes(child.key) // ซ่อน Message และ Program
                ),
              };
            }
            return item;
          });
      }

      // 3. STAFF -> เห็นทุกอย่าง ยกเว้น Account และ Partnerships
      if (role === "STAFF") {
        return allItems.filter((item) =>
          !["account", "partnerships"].includes(item.key)
        );
      }

      // 4. อื่นๆ (VIEWER) -> เห็นแค่ Dashboard (Overview only)
      return allItems
        .filter((item) => ["dashboard"].includes(item.key))
        .map((item) => {
            if (item.key === "dashboard" && item.type === "dropdown") {
              return {
                ...item,
                children: item.children.filter((child) => child.key === "report"),
              };
            }
            return item;
        });
    },
    [userRole]
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 
          bg-linear-to-b from-white via-violet-50 to-indigo-100
          border-r border-white/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
          text-slate-600 
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          overflow-hidden flex flex-col`}
      >
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <motion.div
            className="absolute w-full h-[2000px]"
            animate={{ y: [0, -2000] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            style={{ boxShadow: stars1, width: "2px", height: "2px", background: "transparent" }}
          />
          <motion.div
            className="absolute w-full h-[2000px]"
            animate={{ y: [0, -2000] }}
            transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
            style={{ boxShadow: stars2, width: "3px", height: "3px", background: "transparent" }}
          />
          <motion.div
            className="absolute w-full h-[2000px]"
            animate={{ y: [0, -2000] }}
            transition={{ repeat: Infinity, duration: 80, ease: "linear" }}
            style={{ boxShadow: stars3, width: "2px", height: "2px", background: "transparent" }}
          />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-200">
                M
              </div>
              <h2 className="text-xl font-bold text-slate-700 tracking-tight">MENU</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-purple-400 hover:bg-purple-300 hover:text-purple-700 transition-all ">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                if (item.type === "dropdown") {
                  const isDropdownOpen = !!openMap[item.key];
                  return (
                    <li key={item.key}>
                      <button
                        onClick={() => toggle(item.key)}
                        className={`flex items-center justify-between w-full p-3 rounded-2xl transition-all duration-300 font-medium group
                            ${isDropdownOpen ? "bg-white shadow-sm text-violet-700" : "text-slate-600 hover:bg-white/50 hover:text-violet-700"}`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 transition-colors ${isDropdownOpen ? "text-violet-600" : "text-slate-400 group-hover:text-violet-500"}`} />
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-violet-600" : "text-slate-400 group-hover:text-violet-500"}`} />
                      </button>
                      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isDropdownOpen ? "grid-rows-[1fr] opacity-100 pt-1" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden">
                          <ul className="mt-1 ml-4 space-y-1 pl-3 border-l border-violet-200/50">
                            {item.children.map((child) => (
                              <li key={child.key}>
                                <Link href={child.href} className="block px-4 py-2.5 text-sm rounded-xl transition-all text-slate-500 hover:text-violet-700 hover:bg-white/60 font-medium relative -left-px">
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={item.key}>
                    <Link href={item.href} className="flex items-center space-x-3 p-3 rounded-2xl text-slate-600 hover:bg-white/60 hover:text-violet-700 transition-all duration-200 font-medium group hover:shadow-sm">
                      <Icon className="w-5 h-5 text-slate-400 group-hover:text-violet-500 transition-colors" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4">
            <div className="relative">
              <div className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 border ${open ? 'bg-white border-white shadow-lg' : 'bg-white/40 border-white/60 hover:bg-white/60'}`}>
                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-md shadow-rose-200">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700 truncate">{user?.name || "Admin"}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || "admin@example.com"}</p>
                </div>
                <button onClick={() => setOpen(!open)} className={`p-1.5 rounded-xl transition-all ${open ? "bg-violet-50 text-violet-600" : "text-slate-400 hover:bg-white hover:text-slate-600"}`}>
                  <ChevronUp className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                </button>
              </div>
              {open && (
                <div className="absolute bottom-full left-0 w-full mb-3 z-50 px-1">
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/50 overflow-hidden animate-in slide-in-from-bottom-1 fade-in duration-200 p-1.5">
                    <ul className="space-y-1">
                      <li><Link href="/account" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors font-medium"><Settings size={18} className="text-slate-400" /> ตั้งค่าบัญชี</Link></li>
                      <li className="border-t border-slate-100 my-1 mx-2"></li>
                      <li onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl cursor-pointer transition-colors font-medium"><Power size={18} className="text-rose-400" /> ออกจากระบบ</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}