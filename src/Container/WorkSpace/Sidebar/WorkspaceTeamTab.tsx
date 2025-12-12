import React from "react";
import { Users } from "lucide-react";
import { WorkspaceMember } from "@/types/workspace";

interface WorkspaceTeamTabProps {
  members: WorkspaceMember[];
}

export default function WorkspaceTeamTab({ members }: WorkspaceTeamTabProps) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Users size={18} className="text-purple-500" /> Team
        </h3>
        <button className="text-xs text-blue-600 font-medium hover:underline">
          Manage
        </button>
      </div>
      <div className="space-y-3">
        {members.map((member, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${member.color}`}>
              {member.avatar}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-800">{member.name}</h4>
              <p className="text-xs text-gray-500">{member.role}</p>
            </div>
          </div>
        ))}
        <button className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
          + Invite Member
        </button>
      </div>
    </div>
  );
}