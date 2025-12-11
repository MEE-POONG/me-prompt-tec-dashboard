import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Folder,
  MoreVertical,
  Clock,
  Users,
  Trash2,
  Palette,
  LogOut,
  Star,
} from "lucide-react";

// Mock Data for Projects
const projects = [
  {
    id: "PROJ-001",
    name: "Website Redesign",
    description: "Redesigning the corporate website for better UX/UI.",
    members: 5,
    updated: "2h ago",
    color: "bg-blue-100 text-blue-600",
    status: "In Progress",
  },
  {
    id: "PROJ-002",
    name: "Mobile App Development",
    description: "Developing the new customer-facing mobile application.",
    members: 8,
    updated: "1d ago",
    color: "bg-purple-100 text-purple-600",
    status: "Planning",
  },
  {
    id: "PROJ-003",
    name: "Marketing Campaign",
    description: "Q4 Marketing strategy and asset creation.",
    members: 3,
    updated: "3d ago",
    color: "bg-orange-100 text-orange-600",
    status: "Review",
  },
  {
    id: "PROJ-004",
    name: "Internal HR System",
    description: "Employee management dashboard updates.",
    members: 4,
    updated: "5d ago",
    color: "bg-green-100 text-green-600",
    status: "Done",
  },
  {
    id: "PROJ-005",
    name: "Client Portal",
    description: "Secure portal for client document sharing.",
    members: 6,
    updated: "1w ago",
    color: "bg-pink-100 text-pink-600",
    status: "In Progress",
  },
];

interface WorkListProps {
  viewType?: "grid" | "list";
  searchItem?: string;
}

export default function WorkList({
  viewType = "grid",
  searchItem = "",
}: WorkListProps) {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter projects based on search
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchItem.toLowerCase()) ||
      project.description.toLowerCase().includes(searchItem.toLowerCase())
  );
  return (
    <div className="space-y-8">
      {/* โปรเจกต์ของฉัน */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">แผนงานทั้งหมด</h2>
        <div
          className={
            viewType === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-6"
          }
        >
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              <p>ไม่พบแผนงานที่ค้นหา</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Link key={project.id} href={`/workspace/${project.id}`}>
                <div
                  className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group h-full ${
                    viewType === "grid"
                      ? "flex flex-col"
                      : "flex flex-row items-center gap-6"
                  }`}
                >
                  <div
                    className={`flex ${
                      viewType === "grid"
                        ? "justify-between items-start mb-4 w-full"
                        : "items-center gap-4"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-3 rounded-xl ${project.color} ${
                          viewType === "list" ? "shrink-0" : "max-w-max"
                        }`}
                      >
                        <Folder size={28} strokeWidth={1.5} />
                      </div>
                      {viewType === "list" && (
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {project.name}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {project.description}
                          </p>
                        </div>
                      )}
                    </div>
                    {viewType === "grid" && (
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 h-8 mt-3">
                        {project.name}
                      </h3>
                    )}
                    <div
                      className={`relative ${
                        viewType === "list" ? "ml-auto" : ""
                      }`}
                    >
                      <button
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors mt-3"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveDropdownId(
                            activeDropdownId === project.id ? null : project.id
                          );
                        }}
                      >
                        <MoreVertical size={20} />
                      </button>

                      {activeDropdownId === project.id && (
                        <div
                          ref={dropdownRef}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200"
                        >
                          <button
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            onClick={() => {
                              console.log("Mark project", project.id);
                              setActiveDropdownId(null);
                            }}
                          >
                            <Star size={16} className="text-gray-400" />
                            <span>Mark as Important</span>
                          </button>
                          {/* Change Color with Submenu */}
                          <div className="relative group/color">
                            <button
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-2">
                                <Palette size={16} className="text-gray-400" />
                                <span>Change Color</span>
                              </div>
                              <div className="opacity-0 group-hover/color:opacity-100 transition-opacity">
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="m9 18 6-6-6-6" />
                                </svg>
                              </div>
                            </button>

                            {/* Color Submenu */}
                            <div className="absolute left-full top-0 ml-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-50 invisible group-hover/color:visible animate-in fade-in slide-in-from-left-2 duration-200 grid grid-cols-5 gap-1">
                              {[
                                {
                                  value: "bg-blue-100 text-blue-600",
                                  color: "bg-blue-500",
                                },
                                {
                                  value: "bg-purple-100 text-purple-600",
                                  color: "bg-purple-500",
                                },
                                {
                                  value: "bg-orange-100 text-orange-600",
                                  color: "bg-orange-500",
                                },
                                {
                                  value: "bg-green-100 text-green-600",
                                  color: "bg-green-500",
                                },
                                {
                                  value: "bg-pink-100 text-pink-600",
                                  color: "bg-pink-500",
                                },
                                {
                                  value: "bg-red-100 text-red-600",
                                  color: "bg-red-500",
                                },
                                {
                                  value: "bg-yellow-100 text-yellow-600",
                                  color: "bg-yellow-500",
                                },
                                {
                                  value: "bg-indigo-100 text-indigo-600",
                                  color: "bg-indigo-500",
                                },
                                {
                                  value: "bg-teal-100 text-teal-600",
                                  color: "bg-teal-500",
                                },
                                {
                                  value: "bg-cyan-100 text-cyan-600",
                                  color: "bg-cyan-500",
                                },
                              ].map((colorOption) => (
                                <button
                                  key={colorOption.value}
                                  className={`w-8 h-8 rounded-full ${colorOption.color} hover:scale-110 transition-transform ring-2 ring-white shadow-sm`}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Stop scrolling/closing
                                    console.log(
                                      "Selected color:",
                                      colorOption.value,
                                      "for project:",
                                      project.id
                                    );
                                    // Here you would handle the actual color update logic
                                    setActiveDropdownId(null);
                                  }}
                                  title={colorOption.value}
                                />
                              ))}
                            </div>
                          </div>
                          <button
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            onClick={() => {
                              console.log("Leave project", project.id);
                              setActiveDropdownId(null);
                            }}
                          >
                            <LogOut size={16} className="text-gray-400" />
                            <span>Leave Project</span>
                          </button>
                          <div className="h-px bg-gray-100 my-1"></div>
                          <button
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            onClick={() => {
                              console.log("Delete project", project.id);
                              setActiveDropdownId(null);
                            }}
                          >
                            <Trash2 size={16} />
                            <span>Delete Project</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {viewType === "grid" && (
                    <>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                          {project.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Users size={14} />
                          <span>{project.members} members</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} />
                          <span>{project.updated}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {viewType === "list" && (
                    <div className="flex items-center gap-6 ml-auto text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Users size={14} />
                        <span>{project.members} members</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{project.updated}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}

          {/* Add New Project Card */}
          <Link href="/workspace/add">
            <div
              className={`border-2 border-dashed border-gray-300 rounded-2xl p-6 flex items-center text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all group cursor-pointer ${
                viewType === "grid"
                  ? "flex-col justify-center min-h-[200px]"
                  : "flex-row gap-4 h-full min-h-[88px]"
              }`}
            >
              <div
                className={`rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors ${
                  viewType === "grid" ? "w-12 h-12 mb-3" : "w-10 h-10"
                }`}
              >
                <Folder
                  size={viewType === "grid" ? 24 : 20}
                  className="group-hover:text-blue-600"
                />
              </div>
              <span className="font-semibold">Create New Project</span>
            </div>
          </Link>
        </div>
      </div>

      {/* งานที่มีส่วนร่วม */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          แผนงานที่มีส่วนร่วม
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Placeholder for collaborative projects */}
          <div className="col-span-full text-center py-12 text-gray-400">
            <p>ยังไม่มีแผนงานที่มีส่วนร่วม</p>
          </div>
        </div>
      </div>
    </div>
  );
}
