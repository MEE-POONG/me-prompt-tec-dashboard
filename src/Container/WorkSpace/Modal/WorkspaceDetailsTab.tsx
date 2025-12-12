import React from "react";
import { PieChart, Calendar } from "lucide-react";
import { WorkspaceInfo } from "@/types/workspace";

interface WorkspaceDetailsTabProps {
  workspaceInfo: WorkspaceInfo;
}

export default function WorkspaceDetailsTab({ workspaceInfo }: WorkspaceDetailsTabProps) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
      <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
        <PieChart size={18} className="text-blue-500" /> Workspace Details
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-4">
        {workspaceInfo.description}
      </p>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
            <span>Progress</span>
            <span>{workspaceInfo.progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${workspaceInfo.progress}%` }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={16} />
            <span className="text-xs font-semibold">Due Date</span>
          </div>
          <span className="text-xs font-bold text-gray-800">
            {workspaceInfo.dueDate}
          </span>
        </div>
      </div>
    </div>
  );
}