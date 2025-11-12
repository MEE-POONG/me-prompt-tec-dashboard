import Link from "next/link";
import React from "react";

interface NavBarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function NavBar({ onToggleSidebar, isSidebarOpen }: NavBarProps) {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-30">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            
            {/* Hamburger Menu Button */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle Sidebar"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isSidebarOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Logo */}
            <div className="shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <img src="/img/logo/logo.png" alt="logo" className=" transition-all duration-300 hover:scale-110" height={70} width={70}/>
                <span className="text-xl font-bold text-blue-600">
                  ME PROMPT <span className="text-orange-400">DashBoard</span>
                </span>
              </Link>
            </div>
          </div>

          <div className="shrink-0">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-yellow-500 transition-all duration-300 hover:scale-110"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
