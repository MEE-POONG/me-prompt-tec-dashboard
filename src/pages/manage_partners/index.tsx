import React, { useState, useEffect } from "react";
import Layouts from "@/components/Layouts";
import Partners_Menu_Section from "@/Container/Partners/Partners_Menu_Section";
import Card_Partner_Section, {
  PartnerData,
} from "@/Container/Partners/Card_Partner_Section";

import { Loader2 } from "lucide-react";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";
import ModalError from "@/components/ui/Modals/ModalError";
import ModalDelete from "@/components/ui/Modals/ModalsDelete";

export default function ManagePartnersPage() {
  const [partnersList, setPartnersList] = useState<PartnerData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

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

  const handleDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await Promise.all(
        selectedIds.map(async (id) => {
          const res = await fetch(`/api/partners/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error(`Failed to delete ${id}`);
        })
      );

      setPartnersList((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      setShowDeleteModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Delete failed", err);
      setShowDeleteModal(false);
      setShowErrorModal(true);
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
          onDelete={handleDeleteClick}
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

        {/* Modal Delete */}
        {showDeleteModal && (
          <ModalDelete
            message={`คุณต้องการลบพันธมิตรจำนวน ${selectedIds.length} รายการใช่หรือไม่?`}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteConfirm}
          />
        )}

        {/* Modal Success */}
        <ModalSuccess
          open={showSuccessModal}
          message="ลบข้อมูลสำเร็จ!"
          description="ลบข้อมูลพันธมิตรเรียบร้อยแล้ว"
          onClose={() => setShowSuccessModal(false)}
        />

        {/* Modal Error */}
        <ModalError
          open={showErrorModal}
          message="เกิดข้อผิดพลาด!"
          description="ลบข้อมูลบางรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
          onClose={() => setShowErrorModal(false)}
        />
      </div>
    </Layouts>
  );
}