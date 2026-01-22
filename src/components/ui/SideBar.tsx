import {
  ChartNoAxesCombined,
  FolderGit2,
  PanelLeftOpen,
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
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface UserData {
  name: string;
  email: string;
  avatar?: string;
}

// ✅ 1. เพิ่ม userRole ใน Interface (ใส่ ? เผื่อไว้กรณีไม่ส่งมา)
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

// ✅ 2. รับ props userRole เข้ามา
export default function SideBar({
  isOpen,
  onClose,
  userRole = "viewer",
}: SideBarProps) {
  const [open, setOpen] = useState(false);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    dashboard: true,
  });
  const [user, setUser] = useState<UserData | null>(null);

  const toggle = (key: string) =>
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser) as UserData);
        } catch (e) {
          console.error("Error parsing user from storage", e);
        }
      }
    };

    loadUser();

    // Listen for storage changes (for multiple tabs)
    window.addEventListener("storage", loadUser);
    // Listen for custom event (for same tab updates)
    window.addEventListener("user-updated", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("user-updated", loadUser);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => document.body.classList.remove("no-scroll");
  }, [isOpen]);

  // ✅ 3. ใช้ Logic กรองเมนูตาม Role (แต่ใช้ดีไซน์ใหม่)
  const menuItems: MenuItem[] = useMemo(() => {
    // รายการเมนูทั้งหมด (Master List)
    const allItems: MenuItem[] = [
      {
        type: "dropdown",
        key: "dashboard",
        label: "Dashboard",
        icon: ChartNoAxesCombined,
        children: [
          { key: "report", label: "Overview", href: "/" },
          { key: "message", label: "Message", href: "/message" },
          { key: "newsletter", label: "Newsletter", href: "/newsletter" },
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

    // --- Logic การกรอง ---

    // 1. ADMIN / HR -> เห็นทุกอย่าง
    if (role === "ADMIN" || role === "HR") {
      return allItems;
    }

    // 2. STUDENT -> Dashboard (บางส่วน), Project, Workspace
    if (role === "STUDENT") {
      return allItems
        .filter((item) =>
          ["dashboard", "project", "workspace"].includes(item.key)
        )
        .map((item) => {
          if (item.key === "dashboard" && item.type === "dropdown") {
            return {
              ...item,
              children: item.children.filter(
                (child) =>
                  !["message", "program", "newsletter"].includes(child.key)
              ),
            };
          }
          return item;
        });
    }

    // 3. STAFF -> เห็นทุกอย่าง ยกเว้น Account และ Partnerships
    if (role === "STAFF") {
      return allItems.filter(
        (item) => !["account", "partnerships"].includes(item.key)
      );
    }

    // 4. VIEWER -> Dashboard (Overview only)
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
  }, [userRole]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 
          /* Theme: Pastel Gradient + Glassmorphism */
          bg-linear-to-b from-white via-purple-50/50 to-blue-50/50
          backdrop-blur-xl border-r border-white/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
          text-slate-600 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          overflow-visible flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            {/* Logo Box */}
            <div className="w-8 h-8 bg-linear-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-200">
              M
            </div>
            <h2 className="text-xl font-bold text-slate-700 tracking-tight">
              MENU
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-purple-400 hover:bg-purple-300 hover:text-purple-700 transition-all lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu List */}
        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;

              if (item.type === "dropdown") {
                const isDropdownOpen = !!openMap[item.key];

                return (
                  <li key={item.key}>
                    <button
                      onClick={() => toggle(item.key)}
                      className={`flex items-center justify-between w-full p-3 rounded-2xl transition-all duration-300 font-medium group
                        ${isDropdownOpen
                          ? "bg-white shadow-sm text-violet-700 border border-violet-100"
                          : "text-slate-600 hover:bg-white/60 hover:text-violet-700"
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          className={`w-5 h-5 transition-colors ${isDropdownOpen
                              ? "text-violet-600"
                              : "text-slate-400 group-hover:text-violet-500"
                            }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen
                            ? "rotate-180 text-violet-600"
                            : "text-slate-400 group-hover:text-violet-500"
                          }`}
                      />
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isDropdownOpen
                          ? "grid-rows-[1fr] opacity-100 pt-1"
                          : "grid-rows-[0fr] opacity-0"
                        }`}
                    >
                      <div className="overflow-hidden">
                        <ul className="mt-1 ml-4 space-y-1 pl-3 border-l border-violet-200/50">
                          {item.children.map((child) => (
                            <li key={child.key}>
                              <Link
                                href={child.href}
                                className="block px-4 py-2.5 text-sm rounded-xl transition-all text-slate-500 hover:text-violet-700 hover:bg-white/60 font-medium relative -left-px"
                              >
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

              // Link Item
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="flex items-center space-x-3 p-3 rounded-2xl text-slate-600 hover:bg-white/80 hover:text-violet-700 hover:shadow-sm border border-transparent hover:border-violet-100 transition-all duration-200 font-medium group"
                  >
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-violet-500 transition-colors" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-100/50 bg-white/30 backdrop-blur-sm">
          <div className="relative">
            {/* User Card */}
            <div
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 border cursor-pointer ${open
                  ? "bg-white border-violet-100 shadow-lg shadow-violet-100/50"
                  : "bg-white/60 border-white/60 hover:bg-white hover:shadow-sm"
                }`}
              onClick={() => setOpen(!open)}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover shadow-md shadow-violet-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-violet-400 to-fuchsia-400 flex items-center justify-center text-white font-bold shadow-md shadow-violet-200">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-700 truncate">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email || "admin@example.com"}
                </p>
              </div>
              <button
                className={`p-1.5 rounded-xl transition-all ${open
                    ? "bg-violet-50 text-violet-600"
                    : "text-slate-400 hover:bg-slate-50"
                  }`}
              >
                <ChevronUp
                  className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""
                    }`}
                />
              </button>
            </div>

            {/* Dropdown User Menu */}
            {open && (
              <div className="absolute bottom-full left-0 w-full mb-3 z-50 px-1">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/80 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200 p-1.5">
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors font-medium"
                      >
                        <Settings size={18} className="text-slate-400" />{" "}
                        ตั้งค่าบัญชี
                      </Link>
                    </li>
                    <li className="border-t border-slate-100 my-1 mx-2"></li>
                    <li
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl cursor-pointer transition-colors font-medium"
                    >
                      <Power size={18} className="text-red-400" /> ออกจากระบบ
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
