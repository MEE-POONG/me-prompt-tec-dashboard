import Filterbutton from "@/components/ui/Filterbutton";
import Searchbar from "@/components/ui/Searchbar";
import { SquarePen, Trash } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";

interface ProjectData {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  status: string;
  tags: string[];
  techStack: string[];
  cover?: string;
  featured: boolean;
  memberLinks?: any[];
  internLinks?: any[];
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  data: ProjectData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function All_Project() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  // 🔹 ดึงข้อมูลจาก API
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/project?limit=100'); // ดึงทั้งหมด

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const result: ApiResponse = await response.json();
      setProjects(result.data);

      // รวม tag ทั้งหมดแบบ unique
      const tags = Array.from(new Set(result.data.flatMap((p) => p.tags)));
      setAllTags(tags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 ฟังก์ชันกรอง
  const filteredProjects = projects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                       (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchTag = selectedTag ? p.tags.includes(selectedTag) : true;
    return matchSearch && matchTag;
  });

  // 🔹 ฟังก์ชันลบโปรเจกต์
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`คุณต้องการลบโปรเจกต์ "${title}" หรือไม่?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/project/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // รีเฟรชข้อมูล
      fetchProjects();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบโปรเจกต์');
      console.error(err);
    }
  };

  return (
    <section className="bg-white min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Search + Filter */}
        <div className="flex items-center justify-between px-4 sm:px-10 py-6 flex-wrap gap-4">
          <h2 className="text-2xl font-extrabold text-gray-900">Projects</h2>

          <div className="flex items-center gap-3 flex-1 justify-center sm:justify-center">
            <Searchbar value={search} onSearch={setSearch} />
            <Filterbutton tags={allTags} onFilterChange={setSelectedTag} />
          </div>

          <Link
            href="/project_create"
            className="inline-block rounded-2xl py-2 px-4 bg-yellow-400 font-semibold text-white hover:bg-yellow-500 hover:scale-105 transition-all duration-200 whitespace-nowrap"
          >
            เพิ่มโปรเจกต์ใหม่
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mx-4 sm:mx-20 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-semibold">เกิดข้อผิดพลาด:</p>
            <p>{error}</p>
          </div>
        )}

        {/* 🧱 Project List */}
        {!loading && !error && (
          <div className="flex flex-col gap-6 mx-4 sm:mx-20">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="py-4 px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 bg-white"
                >
                  <div className="flex flex-col gap-2 w-full md:w-3/4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {project.title}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {project.description || project.summary || 'ไม่มีคำอธิบาย'}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 self-end md:self-center">
                    <Link
                      href={`/project_edit/${project.id}`}
                      className="inline-block rounded-full p-2 text-yellow-500 hover:bg-yellow-50 transition-all hover:scale-110"
                    >
                      <SquarePen className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id, project.title)}
                      className="inline-block rounded-full p-2 text-red-500 hover:bg-red-50 transition-all hover:scale-110"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 mt-6">
                ไม่พบโปรเจกต์ที่ตรงกับการค้นหา
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}