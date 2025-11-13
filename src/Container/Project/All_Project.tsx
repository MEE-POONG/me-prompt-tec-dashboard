import Filterbutton from "@/components/ui/Filterbutton";
import Searchbar from "@/components/ui/Searchbar";
import { Project, projects } from "@/Data/Project_data";
import { Funnel, Search, SquarePen, Trash } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export default function All_Project() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // 🔹 รวม tag ทั้งหมดแบบ unique
  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags)));

  // 🔹 ฟังก์ชันกรอง
  const filteredProjects = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchTag = selectedTag ? p.tags.includes(selectedTag) : true;
    return matchSearch && matchTag;
  });

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

        {/* 🧱 Project List */}
        <div className="flex flex-col gap-6 mx-4 sm:mx-20">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="py-4 px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 bg-white"
              >
                <div className="flex flex-col gap-2 w-full md:w-3/4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {project.name}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {project.description}
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
                    href="/partnerships"
                    className="inline-block rounded-full p-2 text-yellow-500 hover:bg-yellow-50 transition-all hover:scale-110"
                  >
                    <SquarePen className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/partnerships"
                    className="inline-block rounded-full p-2 text-red-500 hover:bg-red-50 transition-all hover:scale-110"
                  >
                    <Trash className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-6">
              ไม่พบโปรเจกต์ที่ตรงกับการค้นหา
            </p>
          )}
        </div>
      </div>
    </section>
  );
}