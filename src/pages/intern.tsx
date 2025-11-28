import React, { useState, useEffect } from "react";
import Layouts from "@/components/Layouts";
import Link from "next/link";
import { Loader2, UserPlus, X } from "lucide-react";
import ModalDelete from "@/components/ui/Modals/ModalsDelete";

// Import Components ที่แยกไว้
// ⚠️ ตรวจสอบ path ให้ตรงกับที่คุณสร้างไฟล์ไว้นะครับ
import Interns_Menu_Section from "@/Container/Intern/Interns_Menu_Section";
import Card_Intern_Section, { InternData } from "@/Container/Intern/Card_Intern_Section";

export default function InternPage() {
  const currentGen = 6;
  const [internList, setInternList] = useState<InternData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [selectedGen, setSelectedGen] = useState<string>("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalUrl, setModalUrl] = useState<string | null>(null);

  // ✅ แก้ไขตรงนี้: เพิ่ม as string[] เพื่อแก้ตัวแดง
  const genOptions = Array.from(
    new Set(internList.map((intern) => intern.gen).filter(Boolean))
  ).sort((a, b) => Number(b) - Number(a)) as string[]; 

  useEffect(() => {
    fetchInterns();
  }, [selectedGen]);

  const fetchInterns = async () => {
    setIsLoading(true);
    setInternList([]);
    try {
      const response = await fetch(`/api/intern?limit=100&gen=${selectedGen}`);
      const result = await response.json();

      if (response.ok) {
        const formattedInterns = result.data.map((intern: any) => {
          const links = intern.resume?.links || [];
          const pfLink = links.find((l: any) => l.label.toLowerCase().includes("portfolio"))?.url;

          return {
            id: intern.id,
            name: intern.name,
            title: intern.coopType === "coop" ? "นักศึกษาฝึกงาน" : "Intern",
            imageSrc: intern.avatar || "/default-avatar.png",
            avatar: intern.avatar,
            portfolioSlug: intern.portfolioSlug,
            instagram: links.find((l: any) => l.label.toLowerCase().includes("instagram"))?.url,
            facebook: links.find((l: any) => l.label.toLowerCase().includes("facebook"))?.url,
            github: links.find((l: any) => l.label.toLowerCase().includes("github"))?.url,
            portfolio: pfLink || "",
            contact: intern.contact,
            resume: intern.resume,
            coopType: intern.coopType,
            status: intern.status,
            gen: intern.gen,
            createdAt: intern.createdAt,
          };
        });

        formattedInterns.sort((a: any, b: any) => {
          if (a.gen === b.gen) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return Number(b.gen) - Number(a.gen);
        });

        setInternList(formattedInterns);
      }
    } catch (error) {
      console.error("Error fetching interns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    setShowDeleteModal(true);
  };

  const onConfirmDelete = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) => fetch(`/api/intern/${id}`, { method: "DELETE" }))
      );
      setSelectedIds([]);
      await fetchInterns();
      setShowDeleteModal(false);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      console.error("Error deleting interns:", err);
    }
  };

  const openModal = (url: string | undefined | null) => {
    if (!url) return;
    setModalUrl(url);
  };
  const closeModal = () => setModalUrl(null);

  const filteredInterns = internList.filter((intern) => {
    const displayName = intern.name.display || `${intern.name.first} ${intern.name.last}`;
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Layouts>
      <div className="relative min-h-screen bg-[#fffaf5] overflow-hidden font-sans text-slate-800">
        
        {/* --- Background Aurora --- */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-orange-200/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-amber-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-red-200/30 rounded-full blur-[100px] mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-7xl py-8">
          
          {/* ✅ เรียกใช้ Menu Section */}
          <Interns_Menu_Section 
            totalCount={filteredInterns.length}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewType={viewType}
            setViewType={setViewType}
            selectedCount={selectedIds.length}
            onDelete={handleDelete}
            selectedGen={selectedGen}
            setSelectedGen={setSelectedGen}
            genOptions={genOptions}
            currentGen={currentGen}
          />

          {/* === Content Area === */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
              <p className="text-slate-400 animate-pulse font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          ) : filteredInterns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-4xl border-2 border-dashed border-slate-200 text-center backdrop-blur-sm">
              <div className="bg-slate-50 p-6 rounded-full mb-4 shadow-sm">
                <UserPlus size={48} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                {selectedGen === "all" ? "ไม่พบข้อมูลนักศึกษา" : `ยังไม่มีข้อมูลรุ่นที่ ${selectedGen}`}
              </h3>
              <p className="text-slate-500 mb-6 max-w-md">ยังไม่มีรายชื่อนักศึกษาในระบบ คุณสามารถเพิ่มข้อมูลใหม่ได้เลย</p>
              <Link href={`/addintern?gen=${selectedGen === "all" ? currentGen : selectedGen}`}>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-200 flex items-center gap-2">
                  + เพิ่มข้อมูล
                </button>
              </Link>
            </div>
          ) : (
            // ✅ เรียกใช้ Card Section
            <Card_Intern_Section 
                interns={filteredInterns}
                viewType={viewType}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                openModal={openModal}
                selectedGen={selectedGen}
            />
          )}

          {/* === Modal === */}
          {modalUrl && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={closeModal}>
              <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center p-4 border-b bg-slate-50">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-slate-400 text-xs font-bold">SOURCE:</span>
                        <a href={modalUrl} target="_blank" className="text-orange-600 text-sm font-bold hover:underline truncate max-w-xs">{modalUrl}</a>
                    </div>
                    <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-500"/></button>
                 </div>
                 <div className="w-full h-full bg-slate-200 flex justify-center">
                    <iframe src={modalUrl} className="h-full w-full bg-white" frameBorder="0" />
                 </div>
              </div>
            </div>
          )}

          {showDeleteModal && (
            <ModalDelete
              message={`คุณแน่ใจหรือไม่ที่จะลบนักศึกษา ${selectedIds.length} คน?`}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={onConfirmDelete}
            />
          )}
        </div>
      </div>
    </Layouts>
  );
}