import React, { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import {
  Filter,
  Users,
  Settings,
  ChevronLeft,
  RotateCw,
  Bell,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

import { WorkspaceInfo } from "@/types/workspace";
import Link from "next/link";
export interface NotificationItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: Date;
  type: "create" | "update" | "comment" | "delete" | "other";
}

interface WorkspaceHeaderProps {
  workspaceInfo: WorkspaceInfo;
  onToggleFilter: () => void;
  isFilterOpen: boolean;
  onOpenMembers: () => void;
  onOpenSettings: () => void;
  onRefresh?: () => Promise<void> | void;
  notifications?: NotificationItem[];
  onClearNotifications?: () => void;
}

export default function WorkspaceHeader({
  workspaceInfo,
  onToggleFilter,
  isFilterOpen,
  onOpenMembers,
  onOpenSettings,
  onRefresh,
  notifications = [],
  onClearNotifications,
}: WorkspaceHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const notiRef = useRef<HTMLDivElement>(null);


  const handleRefresh = async () => {
    if (!onRefresh) {
      setIsRefreshing(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsRefreshing(false);
      return;
    }
    try {
      setIsRefreshing(true);
      await onRefresh();
    } catch (e) {
      console.error("Refresh failed", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getIconByType = (type: string) => {
    switch (type) {
      case "create":
        return <Plus size={16} className="text-white" />;
      case "update":
        return <Edit size={16} className="text-white" />;
      case "comment":
        return <MessageSquare size={16} className="text-white" />;
      case "delete":
        return <Trash2 size={16} className="text-white" />;
      default:
        return <CheckCircle2 size={16} className="text-white" />;
    }
  };

  const getBgByType = (type: string) => {
    switch (type) {
      case "create":
        return "bg-green-500 shadow-green-200";
      case "update":
        return "bg-blue-500 shadow-blue-200";
      case "comment":
        return "bg-yellow-500 shadow-yellow-200";
      case "delete":
        return "bg-red-500 shadow-red-200";
      default:
        return "bg-gray-400 shadow-gray-200";
    }
  };

  return (

    <div className="px-6 py-4 border-b border-gray-200 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-20 shadow-sm font-sans">

      <div className="flex items-center gap-4">
        <Link
          href="/workspace"
          className="p-2 -ml-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
          title="Back to My Projects"
        >
          <ChevronLeft size={24} />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">
              {workspaceInfo.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
              In Progress
            </span>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <RotateCw
                size={18}
                className={`transition-all duration-500 ${
                  isRefreshing
                    ? "animate-spin text-blue-600"
                    : "active:rotate-180"
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">
            {(() => {
              const lastActivity = workspaceInfo.activities?.[0]?.createdAt;
              const lastTime = lastActivity || workspaceInfo.updatedAt;

              if (!lastTime) return "Last updated just now";

              return `Last updated ${formatDistanceToNow(new Date(lastTime), {
                addSuffix: true,
                locale: th,
              })}`;
            })()}
          </p>
        </div>
      </div>


      <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
        <div className="flex -space-x-3 mr-2 shrink-0 items-center">

          {workspaceInfo.members.slice(0, 3).map((m, i) => (
            <div
              key={i}
              className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                m.color || "bg-slate-400"
              }`}
              title={m.name}
            >
              {m.avatar || m.name.substring(0, 2)}
            </div>
          ))}
          <button
            onClick={onOpenMembers}
            className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors shadow-sm relative z-10"
            title="Invite Member"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>

        <div className="hidden md:block h-8 w-px bg-slate-200 mx-2"></div>

        <div className="relative" ref={notiRef}>
          <button
            onClick={() => setIsNotiOpen(!isNotiOpen)}
            className={`p-2.5 rounded-xl transition-all shrink-0 relative group ${
              isNotiOpen
                ? "bg-purple-50 text-purple-600 ring-2 ring-purple-100"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            <Bell size={20} className={isNotiOpen ? "fill-purple-600" : ""} />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm"></span>
            )}
          </button>

          {isNotiOpen && (
            <>
              <div
                className="fixed inset-0 z-998"
                onClick={() => setIsNotiOpen(false)}
              ></div>

              <div
                className="fixed top-[75px] right-6 w-[360px] bg-white rounded-3xl shadow-2xl shadow-purple-500/20 border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-999"
                style={{ top: "80px", right: "20px" }}
              >
                <div className="bg-linear-to-r from-purple-600 to-indigo-600 p-5 pb-8 relative overflow-hidden flex justify-between items-start">
                  <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

                  <div className="relative z-10">
                    <h3 className="font-bold text-white text-lg">
                      การแจ้งเตือน
                    </h3>
                    <p className="text-purple-100 text-xs mt-1">
                      คุณมี {notifications.length} รายการใหม่
                    </p>
                  </div>

                  {notifications.length > 0 && (
                    <button
                      onClick={() => onClearNotifications?.()}
                      className="relative z-10 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-lg transition-colors"
                      title="ล้างการแจ้งเตือนทั้งหมด"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-t-3xl -mt-4 relative z-20 px-2 pt-2 pb-2 min-h-[300px] flex flex-col">
                  <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-2 max-h-80">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2 animate-pulse">
                          <CheckCircle2 size={32} className="text-slate-300" />
                        </div>
                        <div>
                          <p className="text-slate-800 font-bold">
                            ไม่มีการแจ้งเตือนใหม่
                          </p>
                          <p className="text-slate-400 text-xs mt-1">
                            คุณติดตามทุกอย่างครบถ้วนแล้ว
                          </p>
                        </div>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-3 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group border border-transparent hover:border-slate-100 flex gap-4 items-start"
                        >
                          <div
                            className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ${getBgByType(
                              notif.type
                            )}`}
                          >
                            {getIconByType(notif.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 leading-snug">
                              <span className="font-bold text-slate-900">
                                {notif.user}
                              </span>
                              <span className="mx-1 text-slate-500">
                                {notif.action}
                              </span>
                              <span className="font-bold text-purple-600 wrap-break-word">
                                "{notif.target}"
                              </span>
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1 font-medium flex items-center gap-1">
                              {notif.timestamp.toLocaleTimeString("th-TH", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                              วันนี้
                            </p>
                          </div>

                          <div className="mt-2 w-2 h-2 rounded-full bg-purple-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 pb-1 border-t border-slate-50 mt-2 text-center">
                    <button className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline py-2 w-full flex items-center justify-center gap-1 transition-all">
                      ดูประวัติการแจ้งเตือนทั้งหมด
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onToggleFilter}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
            isFilterOpen
              ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200"
              : "text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
          }`}
        >
          <Filter size={16} />
          Filter
        </button>

        <button
          onClick={onOpenMembers}
          className="flex items-center gap-2 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold border border-slate-200/50 hover:border-slate-300 transition-all shrink-0"
        >
          <Users size={16} />
          Members
        </button>

        {/* ❌ เอา NotificationBell ออกแล้ว */}
        
        <button
          onClick={onOpenSettings}
          className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all shrink-0 border border-transparent hover:border-slate-200"
        >
          <Settings size={20} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}