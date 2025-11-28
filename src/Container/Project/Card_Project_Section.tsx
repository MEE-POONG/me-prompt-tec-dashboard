import React from 'react';
import Image from 'next/image';
import Link from "next/link";
import { SquarePen, Trash, ExternalLink } from "lucide-react";

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  description?: string | null;
  status: string;
  cover?: string | null;
  gallery?: string[];
  tags: string[];
  techStack?: string[];
  links?: any[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CardProjectSectionProps {
  projects: Project[];
  viewType: 'grid' | 'list';
  onDeleteClick: (id: string) => void;
}

export default function Card_Project_Section({
  projects,
  viewType,
  onDeleteClick
}: CardProjectSectionProps) {

  const getProjectLink = (project: Project) => {
    if (project.links && project.links.length > 0) {
      const mainLink = project.links.find(
        (link: any) => link.type === "website" || link.type === "demo"
      );
      return mainLink?.url || project.links[0]?.url || "#";
    }
    return "#";
  };

  return (
    <>
      {/* 🟢 VIEW: GRID */}
      {viewType === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group bg-white rounded-4xl p-3 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col h-full"
            >
              {/* Cover Image */}
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-100 mb-4">
                {project.cover ? (
                  <Image
                    src={project.cover}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300 bg-slate-50">No Image</div>
                )}
                
                {/* Action Buttons (Overlay) */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <Link href={`/editproject/${project.id}`} className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-slate-600 hover:text-violet-600 hover:bg-white shadow-lg transition-colors">
                    <SquarePen size={18} />
                  </Link>
                  <button
                    onClick={() => onDeleteClick(project.id)}
                    className="p-2 bg-white/90 rounded-full text-red-500 hover:text-red-600 shadow-sm backdrop-blur-sm"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-3 pb-3 flex flex-col grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-violet-700 transition-colors" title={project.title}>{project.title}</h3>
                  <a href={getProjectLink(project)} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-violet-500 transition-colors">
                    <ExternalLink size={18} />
                  </a>
                </div>
                
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed h-10">
                  {project.summary || project.description || "ไม่มีรายละเอียด"}
                </p>

                <div className="mt-auto flex flex-wrap gap-2">
                  {project.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="bg-violet-50 text-violet-600 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-violet-100">
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                      <span className="text-[10px] text-slate-400 px-1 py-1">+{project.tags.length - 3}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🟢 VIEW: LIST */}
      {viewType === "list" && (
        <div className="flex flex-col gap-4 relative z-0">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-100 transition-all flex flex-col sm:flex-row gap-5 items-center"
            >
              <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden bg-slate-100 shrink-0">
                {project.cover ? (
                  <Image src={project.cover} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300">No Image</div>
                )}
              </div>

              <div className="grow w-full text-center sm:text-left min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                  <h3 className="text-lg font-bold text-slate-800 truncate group-hover:text-violet-700 transition-colors">{project.title}</h3>
                  <a href={getProjectLink(project)} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink size={16} />
                  </a>
                </div>
                
                <p className="text-slate-500 text-sm line-clamp-1 mb-3">{project.summary || project.description}</p>
                
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="bg-slate-50 text-slate-600 border border-slate-100 text-xs px-2 py-1 rounded-lg font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                <Link href={`/editproject/${project.id}`} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                  <SquarePen size={20} />
                </Link>
                <button
                  onClick={() => onDeleteClick(project.id)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  <Trash size={16} /> <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}