import {
  ChartNoAxesCombined,
  FolderGit2,
  PanelLeftClose,
  PanelLeftOpen,
  UserRoundPen,
  UserStar,
  Handshake,
  ChevronDown,
  Briefcase, // เพิ่มไอคอนสำหรับเมนูย่อย (Optional)
  Users      // เพิ่มไอคอนสำหรับเมนูย่อย (Optional)
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GradientBackground } from "../animate-ui/components/backgrounds/gradient";

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideBar({ isOpen, onClose }: SideBarProps) {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isPartnershipsOpen, setIsPartnershipsOpen] = useState(false); // ✅ 1. เพิ่ม State สำหรับ Partnerships

  // ฟังก์ชัน Toggle Dashboard
  const toggleDashboard = () => {
    setIsDashboardOpen(!isDashboardOpen);
  };

  // ✅ 2. ฟังก์ชัน Toggle Partnerships
  const togglePartnerships = () => {
    setIsPartnershipsOpen(!isPartnershipsOpen);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-linear-to-bl from-blue-800 via-purple-700 to-red-600 text-white transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-white">
            <h2 className="text-xl font-bold">เมนู</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Close Sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <PanelLeftOpen />
              </svg>
            </button>
          </div>

          {/* Sidebar Content */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              
              {/* --- 1. DASHBOARD DROPDOWN --- */}
              <li>
                <button
                  onClick={toggleDashboard}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-blue-700 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <ChartNoAxesCombined className="w-5 h-5" />
                    <span>DashBoard</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                      isDashboardOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    isDashboardOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <ul className="mt-1 ml-4 border-l-2 border-blue-500/30 space-y-1 pt-1 pb-2">
                      <li>
                        <Link
                          href="/"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-blue-700/50 rounded-r-lg transition-colors"
                        >
                          Report
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/message"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-blue-700/50 rounded-r-lg transition-colors"
                        >
                          Message
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/program"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-blue-700/50 rounded-r-lg transition-colors"
                        >
                          Program
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>

              {/* --- 2. PROJECT (Link ปกติ) --- */}
              <li>
                <Link
                  href="/project"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FolderGit2 className="w-5 h-5" />
                  <span>Project</span>
                </Link>
              </li>

              {/* --- 3. PARTNERSHIPS DROPDOWN (เพิ่มใหม่ตามที่ขอ) --- */}
             
              <li>
                <Link
                  href="/manage_partners"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <Handshake size={16} />
                  </svg>
                  <span>Partnerships</span>
                </Link>
              </li>

              {/* --- 4. OTHER MENUS --- */}
              <li>
                <Link
                  href="/intern"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Internships</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/teammember"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserStar className="w-5 h-5" />
                  <span>Teams Member</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserRoundPen className="w-5 h-5" />
                  <span>Account</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Sidebar Footer */}
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