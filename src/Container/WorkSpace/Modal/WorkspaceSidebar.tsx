import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Tag as TagIcon, CheckCircle2 } from "lucide-react";
import { updateTask } from "@/lib/api/workspace";
import WorkspaceDetailsTab from "./WorkspaceDetailsTab";
import WorkspaceTeamTab from "./WorkspaceTeamTab";
import WorkspaceActivityTab from "./WorkspaceActivityTab";
import { WorkspaceInfo } from "@/types/workspace";

interface WorkspaceSidebarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: (value: boolean) => void;
  isTabBarCollapsed: boolean;
  onTabBarToggle: (value: boolean) => void;
  activeTab: "details" | "team" | "activity";
  onTabChange: (tab: "details" | "team" | "activity") => void;
  workspaceInfo: WorkspaceInfo;
  // optional: operate on a specific task (makes Labels act on this task)
  taskId?: string;
  onTaskUpdated?: (taskId: string, data: any) => void;
}

export default function WorkspaceSidebar({
  isSidebarOpen,
  onSidebarToggle,
  isTabBarCollapsed,
  onTabBarToggle,
  activeTab,
  onTabChange,
  workspaceInfo,
  taskId,
  onTaskUpdated,
}: WorkspaceSidebarProps) {
  const [showLabels, setShowLabels] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const TAG_OPTIONS = [
    { id: '1', name: 'High Priority', bg: 'bg-red-100', text: 'text-red-700', color: 'red' },
    { id: '2', name: 'Design', bg: 'bg-purple-100', text: 'text-purple-700', color: 'purple' },
    { id: '3', name: 'Dev', bg: 'bg-blue-100', text: 'text-blue-700', color: 'blue' },
    { id: '4', name: 'Low', bg: 'bg-green-100', text: 'text-green-700', color: 'green' },
  ];

  const handleSelectLabel = async (label: any) => {
    if (!taskId) { alert('No task selected to apply label.'); return; }
    try {
      // update task with single label (task model has `tag` and `tagColor`)
      await updateTask(String(taskId), { tag: label.name, tagColor: label.color });
      setSelectedLabel(label.id);
      setShowLabels(false);
      if (onTaskUpdated) onTaskUpdated(String(taskId), { tag: label.name, tagColor: label.color });
    } catch (err) {
      console.error('Failed to set label on task', err);
      alert('Failed to set label');
    }
  };
  return (
    <>
      {!isSidebarOpen && (
        <button
          onClick={() => onSidebarToggle(true)}
          className="lg:hidden fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg z-30 transition-all"
        >
          ☰
        </button>
      )}

      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-20"
          onClick={() => onSidebarToggle(false)}
        />
      )}

      <div
        className={`fixed lg:relative inset-y-0 right-0 h-full flex flex-col bg-white border-l border-gray-200 transition-all duration-300 z-20 ${
          isSidebarOpen
            ? "translate-x-0 opacity-100 visible"
            : "translate-x-full opacity-0 invisible lg:translate-x-0 lg:opacity-100 lg:visible"
        } ${isTabBarCollapsed ? "lg:w-16 w-full" : "w-full lg:w-80"}`}
      >
        <div className="flex border-b border-gray-200 sticky top-0 z-10 bg-white items-center">
          {!isTabBarCollapsed ? (
            <>
              <button
                onClick={() => onTabChange("details")}
                className={`flex-1 py-3 px-4 text-sm font-semibold text-center transition-all whitespace-nowrap ${
                  activeTab === "details"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Details
              </button>
              <button
                onClick={() => onTabChange("team")}
                className={`flex-1 py-3 px-4 text-sm font-semibold text-center transition-all whitespace-nowrap ${
                  activeTab === "team"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Team
              </button>
              <button
                onClick={() => onTabChange("activity")}
                className={`flex-1 py-3 px-4 text-sm font-semibold text-center transition-all whitespace-nowrap ${
                  activeTab === "activity"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Activity
              </button>
            </>
          ) : null}

          <button
            onClick={() => onTabBarToggle(!isTabBarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors hidden lg:flex"
          >
            {isTabBarCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>

          <button
            onClick={() => onSidebarToggle(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-300 ${
            isTabBarCollapsed ? "hidden lg:block p-0" : "p-5 space-y-6"
          }`}
        >
          {activeTab === "details" && !isTabBarCollapsed && (
            <WorkspaceDetailsTab workspaceInfo={workspaceInfo} />
          )}
          {activeTab === "team" && !isTabBarCollapsed && (
            <WorkspaceTeamTab members={workspaceInfo.members} />
          )}
          {activeTab === "activity" && !isTabBarCollapsed && (
            <WorkspaceActivityTab activities={workspaceInfo.activities} />
          )}
          {/* Labels section (per-task) */}
          {!isTabBarCollapsed && (
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2 px-1 tracking-wider">Labels (Task)</p>
              <div className="flex gap-2">
                <button onClick={() => setShowLabels(s => !s)} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-semibold flex items-center gap-2">
                  <TagIcon size={16} /> Labels
                </button>
                {selectedLabel && <div className="px-3 py-2 rounded-lg bg-slate-50 text-sm font-medium">Selected</div>}
              </div>
              {showLabels && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {TAG_OPTIONS.map(t => (
                    <button key={t.id} onClick={() => handleSelectLabel(t)} className={`px-3 py-2 rounded-lg text-sm font-medium border ${t.bg} ${t.text}`}>
                      {t.name}
                      {selectedLabel === t.id && <CheckCircle2 size={14} className="inline-block ml-2 text-white"/>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}