import React, { useState, useEffect } from "react";
import Layouts from "@/components/Layouts";
import Partners_Menu_Section from "@/Container/Partners/Partners_Menu_Section";
import Card_Partner_Section, {
  PartnerData,
} from "@/Container/Partners/Card_Partner_Section";
import { Loader2, Building2 } from "lucide-react";
import ModalDelete from "@/components/ui/Modals/ModalsDelete";

export default function ManagePartnersPage() {
  const [partnersList, setPartnersList] = useState<PartnerData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // โหลดข้อมูลจาก API
  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/partners", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const json = await res.json();

      const formatted: PartnerData[] = (json.data || []).map(
        (p: any): PartnerData => ({
          id: p.id,
          name: p.name,
          type: p.type,
          logoSrc: p.logo || "https://placehold.co/400x400/png?text=Logo",
          website: p.website || "",
          description: p.description,
        })
      );

      setPartnersList(formatted);
    } catch (err) {
      console.error("Failed to load partners", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = partnersList.filter((partner) =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setShowDeleteModal(true);
  };

  const onConfirmDelete = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      await Promise.all(
        selectedIds.map(async (id) => {
          const res = await fetch(`/api/partners/${id}`, {
            method: "DELETE",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (!res.ok) throw new Error(`Failed to delete ${id}`);
        })
      );

      setPartnersList((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Delete failed", err);
      alert("ลบข้อมูลบางรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <Layouts>
      <div className="relative min-h-screen bg-[#f8f9fc] overflow-hidden font-sans text-slate-800">

        {/* --- Background Aurora --- */}
        {/* ✅✅ แก้ไขตรงนี้: เปลี่ยน z-0 เป็น -z-10 เพื่อให้ไปอยู่หลังสุด ไม่ทับ Header */}
        <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-pink-200/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-rose-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[100px] mix-blend-multiply"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-7xl py-8">

          <Partners_Menu_Section
            totalCount={partnersList.length}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewType={viewType}
            setViewType={setViewType}
            selectedCount={selectedIds.length}
            onDelete={handleDeleteClick}
          />

          {loading ? (
            <div className="w-full flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
              <p className="text-slate-400 animate-pulse font-medium">กำลังโหลดข้อมูลพันธมิตร...</p>
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-4xl border-2 border-dashed border-slate-200 backdrop-blur-sm text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-4 shadow-sm">
                <Building2 size={48} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">ไม่พบข้อมูลพันธมิตร</h3>
              <p className="text-slate-500">ลองค้นหาด้วยคำอื่น หรือเพิ่มพันธมิตรใหม่</p>
            </div>
          ) : (
            <Card_Partner_Section
              partners={filteredPartners}
              viewType={viewType}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
            />
          )}

          {showDeleteModal && (
            <ModalDelete
              open={showDeleteModal}
              message={`คุณแน่ใจหรือไม่ที่จะลบพันธมิตร ${selectedIds.length} รายการ?`}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={onConfirmDelete}
            />
          )}

        </div>
      </div>
    </Layouts>
  );
}