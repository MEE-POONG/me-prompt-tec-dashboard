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
} from "lucide-react";
import { div } from "motion/react-client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface UserData {
  name: string;
  email: string;
}

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function SideBar({ isOpen, onClose }: SideBarProps) {
  const [open, setOpen] = useState(false);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    dashboard: false,
  });
  const [user, setUser] = useState<UserData | null>(null);

  const toggle = (key: string) =>
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/"; // refresh UI
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

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        type: "dropdown",
        key: "dashboard",
        label: "DashBoard",
        icon: ChartNoAxesCombined,
        children: [
          { key: "report", label: "Report", href: "/" },
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
        label: "Teams Member",
        href: "/teammember",
        icon: UserStar,
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
    ],
    []
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-linear-to-bl from-blue-800 via-purple-700 to-red-600 text-white transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 overflow-visible`} // ** เปลี่ยน overflow-x-hidden เป็น overflow-visible หรือลบออกเพื่อให้ dropdown ไม่โดนตัด **
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h2 className="text-xl font-bold">เมนู</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Close Sidebar"
            >
              <PanelLeftOpen className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;

                if (item.type === "dropdown") {
                  const isOpen = !!openMap[item.key];

                  return (
                    <div className=" relative overflow-hidden">
                      <li key={item.key}>
                        <button
                          onClick={() => toggle(item.key)}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/20 transition-all hover:translate-x-1 duration-300 w-full justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </div>

                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                              isOpen ? "rotate-180" : "rotate-0"
                            }`}
                          />
                        </button>

                        <div
                          className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                            isOpen
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <ul className="mt-1 ml-4  space-y-1 pt-1 pb-2">
                              {item.children.map((child) => (
                                <li key={child.key}>
                                  <Link
                                    href={child.href}
                                    className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/20 rounded-lg transition-all hover:translate-x-1 duration-300"
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </li>
                    </div>
                  );
                }

                // item.type === "link"
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/20 transition-all hover:translate-x-1 duration-300"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="relative p-4">
            {" "}
            {/* เพิ่ม Container wrapper เพื่อจัดการ padding */}
            <div className="relative w-full flex items-center space-x-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
              {/* Avatar */}
              <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center font-bold text-white shrink-0">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>

              {/* Text info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {user?.name || "ผู้ใช้งาน"}
                </p>
                <p className="text-xs text-gray-200 truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>

              {/* ปุ่ม Toggle */}
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/20 transition shrink-0"
              >
                <ChevronUp
                  className={`w-4 h-4 transition-transform duration-300 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* --- Dropdown Menu (ย้ายมาตรงนี้) --- */}
              {open && (
                <div className="absolute bottom-full left-0 w-full mb-2 z-50">
                  <div className="bg-white/20 text-gray-800 rounded-xl shadow-2xl border border-white/20 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
                    {/* Header เล็กๆ ใน Dropdown (Optional) */}
                    <div className="px-4 py-2 bg-white/20 border-b border-white/20 text-xs font-semibold text-white">
                      เมนูสมาชิก
                    </div>

                    <ul className="py-1 text-sm">
                      <li className="px-4 py-2 text-white hover:bg-fuchsia-50 hover:text-fuchsia-700 cursor-pointer transition-colors flex items-center gap-2">
                        <span>
                          <Settings size={20} />
                        </span>{" "}
                        ตั้งค่าบัญชี
                      </li>
                      <hr className="my-1 border-white/20" />
                      <li
                        className="px-4 py-2 text-white hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors flex items-center gap-2"
                        onClick={handleLogout}
                      >
                        <span>
                          <Power size={20} />
                        </span>{" "}
                        ออกจากระบบ
                      </li>
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
