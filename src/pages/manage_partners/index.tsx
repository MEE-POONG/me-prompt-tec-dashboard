import React, { useState, useEffect } from "react";
import Layouts from "@/components/Layouts";
import Partners_Menu_Section from "@/Container/Partners/Partners_Menu_Section";
import Card_Partner_Section, {
  PartnerData,
} from "@/Container/Partners/Card_Partner_Section";

export default function ManagePartnersPage() {
  const [partnersList, setPartnersList] = useState<PartnerData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลจาก API แทน mock
  useEffect(() => {
    const loadPartners = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/partners");
        const json = await res.json();

        const formatted: PartnerData[] = (json.data || []).map(
          (p: any): PartnerData => ({
            id: p.id,
            name: p.name,
            type: p.type,
            logoSrc: p.logo || "https://placehold.co/400x400/png?text=Logo",
            website: p.website || "",
            projects: [], // ถ้ายังไม่มีระบบ project ต่อกับ partner ให้เว้นไว้ก่อน
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
        selectedIds.map((id) =>
          fetch(`/api/partners/${id}`, { method: "DELETE" })
        )
      );
      // ลบจาก state ด้วย
      setPartnersList((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      alert("ลบข้อมูลเรียบร้อย");
    } catch (err) {
      console.error("Delete failed", err);
      alert("ลบข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <Layouts>
      <div className="p-6 md:p-8 w-full bg-gray-50 min-h-screen">
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
          <div className="w-full flex items-center justify-center py-20 text-gray-400">
            กำลังโหลดข้อมูลพันธมิตร...
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
    </Layouts>
  );
}
