import { ChartNoAxesCombined, FolderGit2, PanelLeftClose, PanelLeftOpen, UserRoundPen, UserStar } from 'lucide-react';
import Link from 'next/link';

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideBar({ isOpen, onClose }: SideBarProps) {
  return (
    <>
      {/* Overlay - แสดงเมื่อ sidebar เปิดบนมือถือ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-linear-to-b from-blue-600 to-blue-800 text-white transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-blue-500">
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
              <li>
                <Link
                  href="/"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <ChartNoAxesCombined />
                  </svg>
                  <span>Report</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/project"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <FolderGit2 />
                  </svg>
                  <span>Project</span>
                </Link>
              </li>
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
                  href="/intern"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <UserStar />
                  </svg>
                  <span>Teams Member</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <UserRoundPen />
                  </svg>
                  <span>Account</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-blue-500">
            <div className="flex items-center space-x-3 p-3 bg-blue-700 rounded-lg">
              <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center font-bold">
                U
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">ผู้ใช้งาน</p>
                <p className="text-xs text-blue-200">user@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
