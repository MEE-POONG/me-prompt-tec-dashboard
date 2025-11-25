import Head from "next/head";
import React, { ReactNode, useState } from "react";
import NavBar from "./ui/NavBar";
import SideBar from "./ui/SideBar";
import { StarsBackground } from "./animate-ui/components/backgrounds/stars";
import ProtectedRoute from "./auth/ProtectedRoute";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layouts({
  children,
  title = "DashBoard",
  description = "Dashboard ใช้ในเว็บ Me-Prompt-Tec",
}: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Head>
      <ProtectedRoute>
      <div className="flex min-h-screen bg-white">
        {/* Sidebar */}
        <SideBar isOpen={isSidebarOpen} onClose={toggleSidebar} />

        {/* Main Content Area - จะถูกดันเมื่อ sidebar เปิด */}
        <div
          className={`flex flex-col min-h-screen w-full transition-all duration-300 ${
            isSidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <NavBar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          <main className="grow">{children}</main>
        </div>
      </div>
      </ProtectedRoute>
    </>
  );
}
