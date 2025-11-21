import React, { useState, useEffect } from "react";
import Layouts from "@/components/Layouts";
import { Edit2, Trash2, Plus, X, Save, Loader2 } from "lucide-react"; 
// import Server Actions ที่เราสร้างไว้
// ชี้เข้าไปใน api > action
// ใช้ @ แทน src แล้วตามด้วยชื่อ folder
// เปลี่ยนจาก @/action/... เป็น path ยาวๆ ตามที่อยู่จริง
import { getPositions, createPosition, updatePosition, deletePosition } from "@/pages/api/action/internshipActions";

export default function ManageInternship() {
  // เก็บข้อมูลจริงจาก Database
  const [positions, setPositions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); // สถานะกำลังโหลด

  // State สำหรับ Modal และ Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null); // เปลี่ยนเป็น String เพราะ ID MongoDB เป็นตัวหนังสือ
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [isSaving, setIsSaving] = useState(false); // กันคนกดปุ่มรัวๆ

  // --- 1. โหลดข้อมูลเมื่อเข้าเว็บ ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await getPositions();
    setPositions(data);
    setIsLoading(false);
  };

  // --- Functions จัดการข้อมูล ---

  const openAddModal = () => {
    setCurrentId(null);
    setFormData({ title: "", description: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setCurrentId(item.id);
    setFormData({ title: item.title, description: item.description });
    setIsModalOpen(true);
  };

  // --- 2. บันทึกข้อมูล (เชื่อมต่อ Database) ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true); // หมุนติ้วๆ

    let result;
    if (currentId) {
      // แก้ไข
      result = await updatePosition(currentId, formData.title, formData.description);
    } else {
      // เพิ่มใหม่
      result = await createPosition(formData.title, formData.description);
    }

    if (result.success) {
      await fetchData(); // ดึงข้อมูลล่าสุดมาแสดง
      setIsModalOpen(false);
      setFormData({ title: "", description: "" });
    } else {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
    setIsSaving(false);
  };

  // --- 3. ลบข้อมูล (เชื่อมต่อ Database) ---
  const handleDelete = async (id: string) => {
    if (confirm("ต้องการลบตำแหน่งงานนี้ใช่หรือไม่?")) {
      // ลบใน UI ก่อนเพื่อความลื่นไหล (Optimistic UI)
      setPositions(prev => prev.filter(item => item.id !== id));
      
      // ส่งคำสั่งลบไป Database
      const result = await deletePosition(id);
      if (!result.success) {
        alert("ลบไม่สำเร็จ");
        fetchData(); // ถ้าลบพลาด ให้ดึงข้อมูลเดิมกลับมา
      }
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center mb-8 w-full max-w-4xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-left">
             <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
               จัดการตำแหน่งฝึกงาน
             </h1>
             <p className="text-gray-500">เพิ่ม ลด หรือแก้ไขรายละเอียดตำแหน่งงานจาก Database</p>
          </div>
          
          <button 
            onClick={openAddModal}
            className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-transform hover:-translate-y-1"
          >
            <Plus size={20} /> เพิ่มตำแหน่งใหม่
          </button>
        </div>

        {/* List of Positions */}
        <div className="w-full max-w-4xl space-y-4">
          {isLoading ? (
             <div className="text-center py-10 text-gray-500">
                กำลังโหลดข้อมูล...
             </div>
          ) : positions.length === 0 ? (
             <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                ยังไม่มีตำแหน่งงานในระบบ
             </div>
          ) : (
             positions.map((position) => (
                <div
                  key={position.id}
                  className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-all"
                >
                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-xl font-bold text-blue-700">
                      {position.title}
                    </h3>
                    <p className="text-gray-500 mt-1">
                      {position.description}
                    </p>
                  </div>
    
                  <div className="flex items-center gap-3">
                    <button 
                        onClick={() => openEditModal(position)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="แก้ไข"
                    >
                        <Edit2 size={20} />
                    </button>
                    <button 
                        onClick={() => handleDelete(position.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="ลบ"
                    >
                        <Trash2 size={20} />
                    </button>
                  </div>
                </div>
             ))
          )}
        </div>

        {/* --- Modal --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
              
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">
                    {currentId ? "แก้ไขตำแหน่งงาน" : "เพิ่มตำแหน่งใหม่"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อตำแหน่ง</label>
                    <input 
                        type="text" 
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                        placeholder="เช่น Frontend Developer"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                    <textarea 
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-black h-32 resize-none"
                        placeholder="เช่น เรียนรู้ React, Next.js..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                    <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        ยกเลิก
                    </button>
                    <button 
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:bg-blue-400"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {isSaving ? "กำลังบันทึก..." : "บันทึก"}
                    </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}