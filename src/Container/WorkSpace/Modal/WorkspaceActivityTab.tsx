import React from "react";
import { Activity } from "lucide-react";
import { WorkspaceActivity } from "@/types/workspace";

interface WorkspaceActivityTabProps {
  activities: WorkspaceActivity[];
}

export default function WorkspaceActivityTab({
  activities,
}: WorkspaceActivityTabProps) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Activity size={18} className="text-orange-500" /> Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((act, idx) => (
          <div
            key={idx}
            className="flex gap-3 text-sm relative pl-4 border-l-2 border-gray-100"
          >
            <div>
              <p className="text-gray-800 text-xs">
                <span className="font-bold">
                  {typeof act.user === "object"
                    ? (act.user as any).name
                    : act.user}
                </span>{" "}
                <span className="font-medium text-blue-600">{act.target}</span>
              </p>
              <span className="text-[10px] text-gray-400">
                {act.createdAt && !isNaN(Date.parse(act.createdAt))
                  ? new Date(act.createdAt).toLocaleTimeString("th-TH")
                  : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
