import React, { useState } from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
import ProjectBoard from "@/Container/WorkSpace/WorkspaceBoard";
const ProjectBoardAny = ProjectBoard as any;
import { ArrowLeft, Settings, Users, Filter, Plus, X } from "lucide-react";
import Link from "next/link";

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [members, setMembers] = useState([
    {
      id: "1",
      name: "John Doe",
      role: "Owner",
      avatar: "JD",
      color: "bg-blue-100 text-blue-600",
    },
  ]);

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter((m) => m.id !== memberId));
  };

  return (
    <Layouts>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* Project Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/workspace"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Project {id}
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  In Progress
                </span>
              </h1>
              <p className="text-sm text-gray-500">Last updated 2 hours ago</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 mr-2">
              {members.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className={`w-8 h-8 rounded-full ${member.color} border-2 border-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm`}
                  title={member.name}
                >
                  {member.avatar}
                </div>
              ))}
              {members.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500 font-medium ring-2 ring-white">
                  +{members.length - 3}
                </div>
              )}
            </div>
            {/* Members Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMembersOpen(!isMembersOpen)}
                className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors ${
                  isMembersOpen ? "bg-gray-100 text-gray-900" : "text-gray-600"
                }`}
              >
                <Users size={18} />
                <span>Members</span>
              </button>

              {isMembersOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMembersOpen(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-900">
                        Project Members
                      </h3>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {members.length}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm`}
                            >
                              {member.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {member.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {member.role}
                              </p>
                            </div>
                          </div>
                          {member.role !== "Owner" && (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-50 rounded"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button className="w-full py-2 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors">
                      <Plus size={16} />
                      <span>Invite Member</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
              <Filter size={18} />
              <span>Filter</span>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Kanban Board Area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-gray-50">
          <ProjectBoardAny projectId={typeof id === "string" ? id : ""} />
        </div>
      </div>
    </Layouts>
  );
}
