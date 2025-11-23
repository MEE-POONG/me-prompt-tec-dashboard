import React from 'react';
import Link from 'next/link';
import { Folder, MoreVertical, Clock, Users } from 'lucide-react';

// Mock Data for Projects
const projects = [
    {
        id: 'PROJ-001',
        name: 'Website Redesign',
        description: 'Redesigning the corporate website for better UX/UI.',
        members: 5,
        updated: '2h ago',
        color: 'bg-blue-100 text-blue-600',
        status: 'In Progress'
    },
    {
        id: 'PROJ-002',
        name: 'Mobile App Development',
        description: 'Developing the new customer-facing mobile application.',
        members: 8,
        updated: '1d ago',
        color: 'bg-purple-100 text-purple-600',
        status: 'Planning'
    },
    {
        id: 'PROJ-003',
        name: 'Marketing Campaign',
        description: 'Q4 Marketing strategy and asset creation.',
        members: 3,
        updated: '3d ago',
        color: 'bg-orange-100 text-orange-600',
        status: 'Review'
    },
    {
        id: 'PROJ-004',
        name: 'Internal HR System',
        description: 'Employee management dashboard updates.',
        members: 4,
        updated: '5d ago',
        color: 'bg-green-100 text-green-600',
        status: 'Done'
    },
    {
        id: 'PROJ-005',
        name: 'Client Portal',
        description: 'Secure portal for client document sharing.',
        members: 6,
        updated: '1w ago',
        color: 'bg-pink-100 text-pink-600',
        status: 'In Progress'
    }
];

interface WorkListProps {
    // We can keep these optional if we want to avoid breaking parent immediately, 
    // or remove them if we update parent. I'll remove them and update parent.
}

export default function WorkList({ }: WorkListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
                <Link key={project.id} href={`/workspace/${project.id}`}>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group h-full flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${project.color}`}>
                                <Folder size={24} fill="currentColor" className="opacity-20" />
                                <Folder size={24} className="absolute top-3 left-3" />
                                {/* Using a simple Folder icon for now, the above trick is just for visual depth if needed, but let's stick to simple */}
                                <Folder size={28} strokeWidth={1.5} />
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors" onClick={(e) => e.preventDefault()}>
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                                {project.name}
                            </h3>
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
                    </div>
                </Link>
            ))}

            {/* Add New Project Card */}
            <button className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all min-h-[200px] group">
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                    <Folder size={24} className="group-hover:text-blue-600" />
                </div>
                <span className="font-semibold">Create New Project</span>
            </button>
        </div>
    );
}