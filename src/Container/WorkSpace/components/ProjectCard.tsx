import React, { useRef, useEffect } from "react";
import {
    Folder,
    Globe,
    Lock,
    MoreVertical,
    Trash2,
    Calendar as CalendarIcon,
} from "lucide-react";
import { Project } from "@/types/workspace";
import { AvatarStack } from "../AvatarStack";

interface ProjectCardProps {
    project: Project;
    viewType: "grid" | "list";
    isOwner: boolean;
    isActiveDropdown: boolean;
    setActiveDropdownId: (id: string | null) => void;
    onEdit: () => void;
    onDelete: () => void;
    onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
    project,
    viewType,
    isOwner,
    isActiveDropdown,
    setActiveDropdownId,
    onEdit,
    onDelete,
    onClick,
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                if (isActiveDropdown) {
                    setActiveDropdownId(null);
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isActiveDropdown, setActiveDropdownId]);

    const calculateProgress = (project: Project) => {
        if (!project.columns) return 0;
        const allTasks = project.columns.flatMap((col) => col.tasks);
        if (allTasks.length === 0) return 0;
        const completedTasks = allTasks.filter((t) => (t as any).isDone).length;
        return Math.round((completedTasks / allTasks.length) * 100);
    };

    const progress = calculateProgress(project);
    const dateFormatted = new Date(project.createdAt).toLocaleDateString();

    // Check if updated in last 24 hours
    const isNew = (() => {
        const lastUpdate = project.updatedAt
            ? new Date(project.updatedAt)
            : new Date(project.createdAt);
        const diff = new Date().getTime() - lastUpdate.getTime();
        return diff < 24 * 60 * 60 * 1000;
    })();

    return (
        <div
            className={`relative group block h-full transition-all duration-300 hover:-translate-y-1 ${isActiveDropdown ? "z-50" : "z-0"
                }`}
        >
            <div
                className="absolute inset-0 z-0 cursor-pointer"
                onClick={onClick}
            />

            <div
                className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-200 group-hover:shadow-xl group-hover:border-blue-400/50 transition-all h-full relative z-10 pointer-events-none ${viewType === "grid"
                        ? "flex flex-col"
                        : "flex flex-row items-center gap-6"
                    }`}
            >
                {isNew && (
                    <div className="absolute -top-1.5 -right-1.5 z-20 flex items-center gap-1.5 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg shadow-lg shadow-blue-200 animate-in zoom-in duration-300">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-100 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                        </span>
                        NEW
                    </div>
                )}

                <div
                    className={`flex w-full ${viewType === "grid"
                            ? "justify-between items-start mb-4"
                            : "items-center gap-4 flex-1"
                        }`}
                >
                    {viewType === "grid" ? (
                        <div className="w-full">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <h3 className="text-lg font-bold text-gray-900 truncate flex-1">
                                    {project.name}
                                </h3>
                                {project.visibility === "PUBLIC" ? (
                                    <div
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold shrink-0 border border-blue-200"
                                        title="Public Workspace"
                                    >
                                        <Globe size={12} />
                                        <span>Public</span>
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold shrink-0 border border-gray-200"
                                        title="Private Workspace"
                                    >
                                        <Lock size={12} />
                                        <span>Private</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 h-10 mt-1">
                                {project.description}
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 w-full min-w-0">
                            <div
                                className="p-3 rounded-xl shrink-0"
                                style={{
                                    backgroundColor: `${project.color}20`,
                                    color: project.color,
                                }}
                            >
                                <Folder size={28} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-gray-900 truncate">
                                        {project.name}
                                    </h3>
                                    {project.visibility === "PUBLIC" ? (
                                        <Globe size={14} className="text-blue-500" />
                                    ) : (
                                        <Lock size={14} className="text-gray-400" />
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                    {project.description}
                                </p>
                            </div>
                        </div>
                    )}

                    {isOwner && (
                        <div className="relative pointer-events-auto ml-auto">
                            <button
                                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActiveDropdownId(isActiveDropdown ? null : project.id);
                                }}
                            >
                                <MoreVertical size={20} />
                            </button>
                            {isActiveDropdown && (
                                <div
                                    ref={dropdownRef}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right cursor-default z-50"
                                >
                                    <button
                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onEdit();
                                        }}
                                    >
                                        <Folder size={16} className="text-blue-500" />
                                        <span>Edit Details</span>
                                    </button>
                                    <div className="h-px bg-gray-100 my-1"></div>
                                    <button
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                        onClick={onDelete}
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete Project</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {viewType === "grid" ? (
                    <div className="flex items-center justify-between mt-auto w-full pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <CalendarIcon size={14} />
                            <span>{dateFormatted}</span>
                        </div>
                        <AvatarStack members={project.members || []} />
                    </div>
                ) : (
                    <div className="flex items-center gap-6 ml-auto whitespace-nowrap">
                        <AvatarStack members={project.members || []} />
                        <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
