import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Searchbar from "@/components/ui/Searchbar";
import FilterButton from "@/components/ui/Filterbutton"; 
import {
  LayoutGrid,
  List,
  SquarePen,
  Trash,
  ExternalLink,
  Search,
  Loader2,
  Plus,
  Briefcase, // ✅ เพิ่มไอคอนนี้
} from "lucide-react";

interface Project {
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

export default function All_Project() {
  // --- State ---
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Filter Handlers ---
  const setFilters = (filters: { tag: string | null; tech: string | null }) => {
    setSelectedTag(filters.tag);
    setSelectedTech(filters.tech);
  };

  // --- Fetch Projects ---
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/project?limit=100");

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const result = await response.json();
      setProjects(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };
    
  // --- Delete Handler ---
  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบโปรเจกต์นี้?")) return;

    try {
      const response = await fetch(`/api/project/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      fetchProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete project");
      console.error("Error deleting project:", err);
    }
  };

  // --- Logic ---
  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags)));
  const allTechStacks = Array.from(
    new Set(
      projects
        .flatMap(p => p.techStack)
        .filter((t): t is string => Boolean(t))
    )
  );

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
      (p.summary && p.summary.toLowerCase().includes(search.toLowerCase()));
    const matchTag = selectedTag ? p.tags.includes(selectedTag) : true;
    return matchSearch && matchTag;
  });

  const filteredStack = projects.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
      (p.summary && p.summary.toLowerCase().includes(search.toLowerCase()));
    const matchTag = selectedTag ? p.tags.includes(selectedTag) : true;
    const matchTech = selectedTech ? p.techStack && p.techStack.includes(selectedTech) : true;
    return matchSearch && matchTag && matchTech;
  });
  const filteredProjectsFinal = selectedTech ? filteredStack : filteredProjects;
  const filteredProjectsToShow = filteredProjectsFinal; 

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
    <div className="min-h-screen bg-[#f8f9fc] py-8 font-sans text-slate-800 relative overflow-hidden">
      
      {/* --- 🌟 Background Aurora --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
           <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
           <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-pink-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
           <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-7xl">
        
        {/* === Header === */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          
          {/* ✅ ปรับส่วนหัวข้อ: เพิ่มไอคอนกล่องสีม่วง */}
          <div className="flex items-center gap-4">
             <div className="p-3.5 bg-linear-to-br from-violet-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-violet-500/30">
                <Briefcase size={32} strokeWidth={1.5} />
             </div>
             <div>
                <h2 className="text-4xl font-black tracking-tight bg-linear-to-r from-slate-800 via-violet-800 to-slate-800 bg-clip-text text-transparent">
                  จัดการโปรเจกต์
                </h2>
                <p className="text-slate-500 mt-1 font-medium">
                  ผลงานทั้งหมด <span className="font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md ml-1">{loading ? "..." : filteredProjectsToShow.length} โปรเจกต์</span>
                </p>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             {/* Add Button */}
             <Link href="/project_create">
                <button className="flex items-center justify-center gap-2 bg-[#1e1b4b] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-violet-900 transition-all shadow-lg shadow-violet-900/20 hover:-translate-y-1 w-full sm:w-auto">
                  <Plus size={18} />
                  <span>เพิ่มโปรเจกต์</span>
                </button>
             </Link>
          </div>
        </div>

        {/* === Controls (Search & Filter) === */}
        <div className="relative z-50 bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50 mb-8 flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={20} className="text-slate-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="ค้นหาโปรเจกต์..." 
                        className="pl-11 pr-4 py-3 w-full bg-white/50 border border-white rounded-xl focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-100 transition-all text-slate-800 placeholder-slate-400 font-medium outline-none shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <FilterButton
                    tags={allTags}
                    techStacks={allTechStacks}
                    onFilterChange={setFilters}
                />
            </div>

            {/* View Toggle */}
            <div className="flex bg-slate-100/50 p-1 rounded-xl border border-white/50">
                <button
                    onClick={() => setViewType("grid")}
                    className={`p-2.5 rounded-lg transition-all ${viewType === "grid" ? "bg-white text-violet-600 shadow-sm scale-105" : "text-slate-400 hover:text-slate-600"}`}
                >
                    <LayoutGrid size={20} />
                </button>
                <button
                    onClick={() => setViewType("list")}
                    className={`p-2.5 rounded-lg transition-all ${viewType === "list" ? "bg-white text-violet-600 shadow-sm scale-105" : "text-slate-400 hover:text-slate-600"}`}
                >
                    <List size={20} />
                </button>
            </div>
        </div>

        {/* === Content Area === */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-violet-600 animate-spin mb-4" />
            <p className="text-slate-400 animate-pulse font-medium">กำลังโหลดโปรเจกต์...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-red-50/50 rounded-3xl border border-red-100 text-center">
            <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
              <Search size={32} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-red-900">เกิดข้อผิดพลาด</h3>
            <p className="text-red-500 mt-1 mb-4 text-sm">{error}</p>
            <button onClick={fetchProjects} className="px-6 py-2 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-medium text-sm transition-colors">
              ลองใหม่อีกครั้ง
            </button>
          </div>
        ) : filteredProjectsToShow.length > 0 ? (
          <>
            {/* 🟢 VIEW: GRID */}
            {viewType === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
                {filteredProjectsToShow.map((project) => (
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
                        <button onClick={() => handleDelete(project.id)} className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-slate-600 hover:text-red-600 hover:bg-white shadow-lg transition-colors">
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
                {filteredProjectsToShow.map((project) => (
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
                      <button onClick={() => handleDelete(project.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="bg-white p-6 rounded-full shadow-sm mb-6 border border-slate-100">
              <Search size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">ไม่พบโปรเจกต์</h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">
              ลองเปลี่ยนคำค้นหา หรือล้างตัวกรองเพื่อดูข้อมูลทั้งหมด
            </p>
            <button onClick={() => {setSearch(""); setSelectedTag(null); setSelectedTech(null);}} className="mt-6 text-violet-600 font-bold hover:underline text-sm">
                ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>
    </div>
  );
}