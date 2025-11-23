import React from 'react';
import { useRouter } from 'next/router';
import Layouts from "@/components/Layouts";
import ProjectBoard from "@/Container/WorkSpace/ProjectBoard";
import { ArrowLeft, Settings, Users, Filter } from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetail() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Layouts>
            <div className="h-[calc(100vh-64px)] flex flex-col">
                {/* Project Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/workspace" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                Project {id}
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">In Progress</span>
                            </h1>
                            <p className="text-sm text-gray-500">Last updated 2 hours ago</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2 mr-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600">JD</div>
                            <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-xs font-bold text-purple-600">AS</div>
                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">+3</div>
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                            <Users size={18} />
                            <span>Members</span>
                        </button>
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
                    <ProjectBoard />
                </div>
            </div>
        </Layouts>
    );
}
