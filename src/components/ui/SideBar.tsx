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
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

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
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    dashboard: false,
  });

  const toggle = (key: string) =>
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));

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
        className={`fixed top-0 left-0 z-50 h-screen bg-linear-to-bl from-blue-800 via-purple-700 to-red-600 text-white transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } w-64`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-white">
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
                    <li key={item.key}>
                      <button
                        onClick={() => toggle(item.key)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-blue-700 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>

                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : "rotate-0"
                            }`}
                        />
                      </button>

                      <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                          }`}
                      >
                        <div className="overflow-hidden">
                          <ul className="mt-1 ml-4 border-l-2 border-blue-500/30 space-y-1 pt-1 pb-2">
                            {item.children.map((child) => (
                              <li key={child.key}>
                                <Link
                                  href={child.href}
                                  className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-blue-700/50 rounded-r-lg transition-colors"
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

                // item.type === "link"
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg">
              <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center font-bold">
                U
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">ผู้ใช้งาน</p>
                <p className="text-xs text-white">user@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
