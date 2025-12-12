import React from "react";
import { Clock } from "lucide-react";
import { ActivityItem } from "./types";

interface ActivitySectionProps {
  activities: ActivityItem[];
}

export function ActivitySection({ activities }: ActivitySectionProps) {
  return (
    <div className="space-y-0 relative border-l-2 border-slate-100 ml-4">
      {activities.map((act) => (
        <div key={act.id} className="flex gap-4 mb-6 relative pl-6 group">
          {/* Timeline Dot */}
          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-slate-200 group-hover:border-blue-400 transition-colors"></div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-700">
              <span className="font-bold text-black">{act.user}</span>
              <span className="text-gray-500">{act.action}</span>
              {act.target && (
                <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {act.target}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
              <Clock size={12} />
              {act.timestamp.toLocaleString("th-TH")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
