import React, { useState, useEffect } from "react";
import Layouts from "@/components/Layouts";
// Import Components
import Teams_Menu_Section from "@/Container/Teams/Teams_Menu_Section";
import Card_Profile_section, { MemberData } from "@/Container/Teams/Card_Profile_section";
import ModalDelete from "@/components/ui/Modals/ModalsDelete";
import { Loader2, Briefcase } from "lucide-react";

export default function TeamMemberPage() {
  // --- State Management ---
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Controls
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ✅ เพิ่ม State สำหรับ Filter แผนก
  const [selectedDept, setSelectedDept] = useState<string>("all");

  // --- Fetch Members from API ---
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch("/api/member?limit=100", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }

      const result = await response.json();
      const apiMembers = result.data || [];

      // Map API data to MemberData interface
      const mappedMembers: MemberData[] = apiMembers.map((member: any) => ({
        id: member.id,
        name: member.name?.display || `${member.name?.first || ""} ${member.name?.last || ""}`.trim(),
        title: member.title || "Employee",
        department: member.department || "General",
        imageSrc: member.photo || "/default-avatar.png",
        instagram: member.socials?.instagram,
        facebook: member.socials?.facebook,
        github: member.socials?.github,
        linkedin: member.socials?.linkedin,
        portfolio: member.socials?.website || member.socials?.portfolio,
        createdAt: member.createdAt
      }));

      // Sort by CreatedAt (Newest first)
      mappedMembers.sort((a: any, b: any) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      setMembers(mappedMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching members:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Logic: ดึงรายชื่อแผนกทั้งหมดมาทำตัวเลือก Dropdown ---
  const departmentOptions = Array.from(
    new Set(members.map((m) => m.department).filter(Boolean))
  ).sort();

  // --- Logic: Filter Members by Search & Department ---
  const filteredMembers = members.filter((member) => {
    // 1. Filter by Search Text
    const matchSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.title.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Filter by Department
    const matchDept = selectedDept === "all" || member.department === selectedDept;

    return matchSearch && matchDept;
  });

  // --- Toggle Selection ---
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  // --- Delete Selected Members ---
  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    setShowDeleteModal(true);
  };

  const onConfirmDelete = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/member/${id}`, {
            method: "DELETE",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          })
        )
      );
      setSelectedIds([]);
      await fetchMembers();
      setShowDeleteModal(false);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      console.error("Error deleting members:", err);
    }
  };

  return (
    <Layouts>
      <div className="relative min-h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-800">

        {/* --- Background Aurora Effect (Theme: Blue/Indigo for Members) --- */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-cyan-200/30 rounded-full blur-[100px] mix-blend-multiply"></div>
        </div>

        {/* --- Content Container --- */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-7xl py-8">

          {/* ✅ เรียกใช้ Menu Section พร้อม Props ใหม่ครบถ้วน */}
          <Teams_Menu_Section
            totalCount={filteredMembers.length} // ส่งจำนวนที่ผ่านการกรองแล้วไปแสดง
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewType={viewType}
            setViewType={setViewType}
            selectedCount={selectedIds.length}
            onDelete={handleDelete}
            // Props ใหม่สำหรับ Filter แผนก
            selectedDept={selectedDept}
            setSelectedDept={setSelectedDept}
            departments={departmentOptions}
          />

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-slate-400 animate-pulse font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-20 bg-red-50/80 backdrop-blur-sm rounded-xl border border-red-200">
              <p className="text-red-600 font-semibold">เกิดข้อผิดพลาด: {error}</p>
              <button onClick={fetchMembers} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                ลองอีกครั้ง
              </button>
            </div>
          )}

          {/* ส่วนแสดงผล Profile Cards/List */}
          {!loading && !error && (
            <>
              {filteredMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-4xl border-2 border-dashed border-slate-200 text-center backdrop-blur-sm">
                  <div className="bg-slate-50 p-6 rounded-full mb-4 shadow-sm">
                    <Briefcase size={48} className="text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">ไม่พบข้อมูลพนักงาน</h3>
                  <p className="text-slate-500">
                    {searchTerm || selectedDept !== "all"
                      ? "ลองปรับเปลี่ยนเงื่อนไขการค้นหา หรือตัวกรองแผนก"
                      : "ยังไม่มีรายชื่อพนักงานในระบบ"}
                  </p>
                </div>
              ) : (
                <Card_Profile_section
                  members={filteredMembers}
                  viewType={viewType}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                />
              )}
            </>
          )}

          {/* Modal Delete */}
          {showDeleteModal && (
            <ModalDelete
              open={showDeleteModal}
              message={`คุณแน่ใจหรือไม่ที่จะลบพนักงาน ${selectedIds.length} คน?`}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={onConfirmDelete}
            />
          )}
        </div>
      </div>
    </Layouts>
  );
}