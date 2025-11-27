import React, { useState, useEffect } from "react";
import Layouts from "@/components/Layouts";
import Partners_Menu_Section from "@/Container/Partners/Partners_Menu_Section";
import Card_Partner_Section, {
  PartnerData,
} from "@/Container/Partners/Card_Partner_Section";
import { Loader2 } from "lucide-react";

export default function ManagePartnersPage() {
  const [partnersList, setPartnersList] = useState<PartnerData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลจาก API
  useEffect(() => {
    const loadPartners = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/partners");
        
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

    loadPartners();
  }, []);

  const filteredPartners = partnersList.filter((partner) =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    const ok = window.confirm(
      `คุณต้องการลบพันธมิตรจำนวน ${selectedIds.length} รายการใช่หรือไม่?`
    );
    if (!ok) return;

    try {
      await Promise.all(
        selectedIds.map(async (id) => {
          const res = await fetch(`/api/partners/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error(`Failed to delete ${id}`);
        })
      );

      setPartnersList((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      alert("ลบข้อมูลเรียบร้อย");
    } catch (err) {
      console.error("Delete failed", err);
      alert("ลบข้อมูลบางรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <Layouts>
      <div className="relative min-h-screen bg-[#f8f9fc] overflow-hidden font-sans text-slate-800">
        
        {/* --- 🌟 Background Aurora (Theme ชมพู/แดง สำหรับหน้านี้) --- */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
             {/* สีชมพูบนซ้าย */}
             <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-pink-200/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
             {/* สีแดงกุหลาบบนขวา */}
             <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-rose-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
             {/* สีม่วงจางๆ ล่างซ้าย */}
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
            onDelete={handleDelete}
          />

          {loading ? (
            <div className="w-full flex flex-col items-center justify-center py-32 gap-4">
              {/* Spinner สีชมพู */}
              <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
              <p className="text-slate-400 animate-pulse font-medium">กำลังโหลดข้อมูลพันธมิตร...</p>
            </div>
          ) : (
            <Card_Partner_Section
              partners={filteredPartners}
              viewType={viewType}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
            />
          )}
        </div>
      </div>
    </Layouts>
  );
}