import React, { useState, useEffect } from "react";
import Layouts from "@/components/Layouts";
import { Loader2, Search } from "lucide-react";
// Components
import Projects_Menu_Section from "@/Container/Project/Projects_Menu_Section";
import Card_Project_Section, { Project } from "@/Container/Project/Card_Project_Section";
// Modals
import ModalDelete from "@/components/ui/Modals/ModalsDelete";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";
import ModalError from "@/components/ui/Modals/ModalError";

export default function ProjectPage() {
  // --- State ---
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  // --- Handlers ---
  const setFilters = (filters: { tag: string | null; tech: string | null }) => {
    setSelectedTag(filters.tag);
    setSelectedTech(filters.tech);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/project/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      await fetchProjects();
      setShowDeleteModal(false);
      setShowSuccessModal(true);
      setDeleteId(null);
    } catch (err) {
      console.error("Error deleting project:", err);
      setShowDeleteModal(false);
      setShowErrorModal(true);
    }
  };

  // --- Derived Data (Filter Logic) ---
  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags)));
  const allTechStacks = Array.from(
    new Set(
      projects
        .flatMap(p => p.techStack)
        .filter((t): t is string => Boolean(t))
    )
  );

  const filteredProjectsToShow = projects.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
      (p.summary && p.summary.toLowerCase().includes(search.toLowerCase()));
    
    const matchTag = selectedTag ? p.tags.includes(selectedTag) : true;
    const matchTech = selectedTech ? p.techStack && p.techStack.includes(selectedTech) : true;
    
    return matchSearch && matchTag && matchTech;
  });

  return (
    <Layouts>
      <div className="relative min-h-screen bg-[#f8f9fc] overflow-hidden font-sans text-slate-800">
        
        {/* --- 🌟 Background Aurora (Violet Theme) --- */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-pink-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-7xl py-8">
            
            {/* เรียกใช้ Menu Section */}
            <Projects_Menu_Section 
                totalCount={filteredProjectsToShow.length}
                search={search}
                setSearch={setSearch}
                viewType={viewType}
                setViewType={setViewType}
                allTags={allTags}
                allTechStacks={allTechStacks}
                onFilterChange={setFilters}
            />

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-10 h-10 text-violet-600 animate-spin mb-4" />
                    <p className="text-slate-400 animate-pulse font-medium">กำลังโหลดโปรเจกต์...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 bg-red-50/50 rounded-3xl border border-red-100 text-center">
                    <h3 className="text-lg font-bold text-red-900">เกิดข้อผิดพลาด</h3>
                    <p className="text-red-500 mt-1 mb-4 text-sm">{error}</p>
                    <button onClick={fetchProjects} className="px-6 py-2 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-medium text-sm transition-colors">
                        ลองใหม่อีกครั้ง
                    </button>
                </div>
            ) : filteredProjectsToShow.length > 0 ? (
                // เรียกใช้ Card Section
                <Card_Project_Section
                    projects={filteredProjectsToShow}
                    viewType={viewType}
                    onDeleteClick={handleDeleteClick}
                />
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

            {/* Modals */}
            {showDeleteModal && (
                <ModalDelete
                    message="คุณแน่ใจหรือไม่ที่จะลบโปรเจกต์นี้?"
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteConfirm}
                />
            )}
            <ModalSuccess
                open={showSuccessModal}
                message="ลบโปรเจกต์สำเร็จ!"
                description="ลบข้อมูลโปรเจกต์เรียบร้อยแล้ว"
                onClose={() => setShowSuccessModal(false)}
            />
            <ModalError
                open={showErrorModal}
                message="เกิดข้อผิดพลาด!"
                description="ไม่สามารถลบโปรเจกต์ได้ กรุณาลองใหม่อีกครั้ง"
                onClose={() => setShowErrorModal(false)}
            />
        </div>
      </div>
    </Layouts>
  );
}