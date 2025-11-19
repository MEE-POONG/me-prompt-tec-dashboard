import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Filterbutton from "@/components/ui/Filterbutton";
import Searchbar from "@/components/ui/Searchbar";
import {
  LayoutGrid,
  List,
  SquarePen,
  Trash,
  ExternalLink,
  Search,
  Loader2,
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
  startDate?: string | null;
  endDate?: string | null;
  clientName?: string | null;
  clientSector?: string | null;
  memberLinks?: any[];
  internLinks?: any[];
  createdAt: string;
  updatedAt: string;
}

export default function All_Project() {
  // --- State ---
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Refresh the project list
      fetchProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete project");
      console.error("Error deleting project:", err);
    }
  };

  // --- Logic ---
  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags)));

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(search.toLowerCase())) ||
      (p.summary &&
        p.summary.toLowerCase().includes(search.toLowerCase()));
    const matchTag = selectedTag ? p.tags.includes(selectedTag) : true;
    return matchSearch && matchTag;
  });

  // --- Get project link ---
  const getProjectLink = (project: Project) => {
    if (project.links && project.links.length > 0) {
      const mainLink = project.links.find((link: any) => link.type === "website" || link.type === "demo");
      return mainLink?.url || project.links[0]?.url || "#";
    }
    return "#";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* === Header & Controls === */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Projects</h2>
            <p className="text-gray-500 mt-1">
              ผลงานและโปรเจกต์ทั้งหมด ({loading ? "..." : filteredProjects.length})
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search & Filter Group */}
            <div className="flex gap-2">
              <Searchbar value={search} onSearch={setSearch} />
              <Filterbutton tags={allTags} onFilterChange={setSelectedTag} />
            </div>

            {/* View Toggle & Add Button Group */}
            <div className="flex gap-3">
              {/* ปุ่มสลับมุมมอง */}
              <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                <button
                  onClick={() => setViewType("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewType === "grid"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setViewType("list")}
                  className={`p-2 rounded-md transition-all ${
                    viewType === "list"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <List size={20} />
                </button>
              </div>

              {/* ปุ่มเพิ่มโปรเจกต์ */}
              <Link
                href="/project_create"
                className="flex items-center justify-center rounded-xl px-4 py-2 bg-blue-600 font-bold text-white hover:bg-blue-700 transition-all shadow-md whitespace-nowrap"
              >
                + เพิ่มโปรเจกต์
              </Link>
            </div>
          </div>
        </div>

        {/* === Content Area === */}
        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500">กำลังโหลดโปรเจกต์...</p>
          </div>
        ) : error ? (
          // Error State
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-red-200 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4">
              <Search size={40} className="text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">เกิดข้อผิดพลาด</h3>
            <p className="text-red-500 mt-1">{error}</p>
            <button
              onClick={fetchProjects}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ลองอีกครั้ง
            </button>
          </div>
        ) : filteredProjects.length > 0 ? (
          <>
            {/* 🟢 VIEW: GRID */}
            {viewType === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group"
                  >
                    <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
                      {project.cover ? (
                        <Image
                          src={project.cover}
                          alt={project.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No Image
                        </div>
                      )}

                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Link
                          href={`/project/edit/${project.id}`}
                          className="p-2 bg-white/90 rounded-full text-yellow-500 hover:text-yellow-600 shadow-sm backdrop-blur-sm"
                        >
                          <SquarePen size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-2 bg-white/90 rounded-full text-red-500 hover:text-red-600 shadow-sm backdrop-blur-sm"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3
                          className="text-xl font-bold text-gray-900 line-clamp-1"
                          title={project.title}
                        >
                          {project.title}
                        </h3>
                        <a
                          href={getProjectLink(project)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <ExternalLink size={18} />
                        </a>
                      </div>

                      <p className="text-gray-500 text-sm line-clamp-2 mb-4 grow">
                        {project.summary || project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-50">
                        {project.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 🟢 VIEW: LIST */}
            {viewType === "list" && (
              <div className="flex flex-col gap-4">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 items-center group"
                  >
                    <div className="relative w-full sm:w-48 aspect-video rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {project.cover && (
                        <Image
                          src={project.cover}
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    <div className="grow w-full text-center sm:text-left">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {project.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                        {project.summary || project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        {project.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <Link
                        href={`/project/edit/${project.id}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors"
                      >
                        <SquarePen size={16} /> <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(project.id)}
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
        ) : (
          // กรณีไม่เจอข้อมูล
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <Search size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">ไม่พบโปรเจกต์</h3>
            <p className="text-gray-500 mt-1">
              ลองค้นหาด้วยคำอื่น หรือเปลี่ยนตัวกรอง
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
