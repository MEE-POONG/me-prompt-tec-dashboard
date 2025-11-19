import { Menu, PanelLeft, PanelLeftClose } from "lucide-react";
import Link from "next/link";
import React from "react";

interface NavBarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function NavBar({
  onToggleSidebar,
  isSidebarOpen,
}: NavBarProps) {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 w-full">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 w-full">
          {/* LEFT SIDE (Hamburger + Logo) */}
          <div className="flex items-center space-x-4">
            {/* Hamburger Menu Button */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
              aria-label="Toggle Sidebar"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isSidebarOpen ? (
                  <PanelLeft className="hidden" />
                ) : (
                  <PanelLeftClose />
                )}
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/img/logo/logo.png"
                alt="logo"
                className="transition-all duration-300 hover:scale-110"
                height={70}
                width={70}
              />
              <span className="hidden md:block text-xl font-bold text-blue-600">
                ME PROMPT <span className="text-orange-400">DashBoard</span>
              </span>
            </Link>
          </div>

          {/* RIGHT SIDE (Login Button) */}
          <div>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-yellow-500 transition-all duration-300 hover:scale-110"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
