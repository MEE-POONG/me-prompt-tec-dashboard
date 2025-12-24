import React, { useState } from "react"; // ✅ เพิ่ม useState
import { Filter, Users, Settings, ChevronLeft, RotateCw } from "lucide-react";
import { WorkspaceInfo } from "@/types/workspace";
import Link from "next/link";

interface WorkspaceHeaderProps {
  workspaceInfo: WorkspaceInfo;
  onToggleFilter: () => void;
  isFilterOpen: boolean;
  onOpenMembers: () => void;
  onOpenSettings: () => void;
  onRefresh?: () => Promise<void> | void;
}

export default function WorkspaceHeader({
  workspaceInfo,
  onToggleFilter,
  isFilterOpen,
  onOpenMembers,
  onOpenSettings,
  onRefresh,
}: WorkspaceHeaderProps) {
  // ✅ สร้าง State สำหรับเช็คสถานะการ Refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    if (!onRefresh) {
      // fallback: simple animation if no handler provided
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

  // 🔧 Compute latest activity & human-friendly "time ago"
  const timeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return "just now";
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} min${min > 1 ? "s" : ""} ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const latestActivity = workspaceInfo?.activities && workspaceInfo.activities.length > 0
    ? workspaceInfo.activities.reduce((a: any, b: any) => {
        const aTime = a.time ?? a.createdAt ?? a.updatedAt ?? null;
        const bTime = b.time ?? b.createdAt ?? b.updatedAt ?? null;
        const aDate = aTime ? new Date(aTime) : new Date(0);
        const bDate = bTime ? new Date(bTime) : new Date(0);
        return aDate > bDate ? a : b;
      })
    : null;

  // Prefer `time` property, otherwise fall back to `createdAt`/`updatedAt`
  const activityTimeStr = latestActivity ? (latestActivity.time ?? (latestActivity as any).createdAt ?? (latestActivity as any).updatedAt ?? null) : null;
  const activityDate = activityTimeStr ? new Date(activityTimeStr) : null;
  const hasValidDate = activityDate && !isNaN(activityDate.getTime());

  const lastActivityLabel = latestActivity
    ? hasValidDate
      ? `Last updated ${timeAgo(activityDate as Date)} by ${latestActivity.user}`
      : `Last updated by ${latestActivity.user}`
    : "No recent activity";

  return (
    <div className="px-6 py-4 border-b border-gray-200 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-20 shadow-sm">
      {/* Left: Project Info */}
      <div className="flex items-center gap-4">
        <Link
          href="/workspace"
          className="p-2 -ml-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to My Projects"
        >
          <ChevronLeft size={24} />
        </Link>

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">
              {workspaceInfo.name}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
              In Progress
            </span>

            {/* ✅ ปุ่ม Refresh พร้อม Animation */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh Content"
            >
              <RotateCw
                size={18}
                className={`transition-all duration-500 ${
                  isRefreshing ? "animate-spin text-blue-600" : "active:rotate-180"
                }`}
              />
            </button>
          </div>
          <p
            className="text-xs text-gray-400 mt-0.5"
            title={hasValidDate && activityDate ? (activityDate as Date).toLocaleString() : undefined}
          >
            {lastActivityLabel}
          </p>
        </div>
      </div>

      {/* Right: Actions (คงเดิม) */}
      <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
        <div className="flex -space-x-2 mr-2 md:mr-4 shrink-0">
          {workspaceInfo.members.slice(0, 3).map((m, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${m.color}`}
              title={m.name}
            >
              {m.avatar}
            </div>
          ))}
          <button
            onClick={onOpenMembers}
            className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500 hover:bg-gray-200 transition-colors"
          >
            + {workspaceInfo.members.length > 3 ? workspaceInfo.members.length - 3 : ""}
          </button>
        </div>

        <div className="hidden md:block h-6 w-px bg-gray-200 mx-1"></div>

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
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium border border-transparent hover:border-gray-200 transition-all shrink-0"
        >
          <Users size={16} />
          Members
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all shrink-0"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
}