import React, { useState } from "react";
import Layouts from "@/components/Layouts";
import { Edit2, Trash2, Plus, X, Save } from "lucide-react"; // อย่าลืมลง lucide-react หรือใช้ icon อื่น

export default function ManageInternship() {
  // 1. เปลี่ยนข้อมูล Static เป็น State เพื่อให้แก้ไขได้
  const [positions, setPositions] = useState([
    {
      id: 1,
      title: "Frontend Developer (Intern)",
      description: "เรียนรู้ React, Next.js, และ Tailwind CSS",
    },
    {
      id: 2,
      title: "Backend Developer (Intern)",
      description: "เรียนรู้ Node.js, Prisma, และ Database",
    },
    {
      id: 3,
      title: "UI/UX Designer (Intern)",
      description: "เรียนรู้ Figma, Wireframing, และ Prototyping",
    },
  ]);

  // State สำหรับ Modal และ Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null); // ถ้า null = สร้างใหม่, ถ้ามีเลข = แก้ไข
  const [formData, setFormData] = useState({ title: "", description: "" });

  // --- Functions จัดการข้อมูล ---

  // เปิด Modal เพื่อ "เพิ่มใหม่"
  const openAddModal = () => {
    setCurrentId(null);
    setFormData({ title: "", description: "" });
    setIsModalOpen(true);
  };

  // เปิด Modal เพื่อ "แก้ไข"
  const openEditModal = (item: any) => {
    setCurrentId(item.id);
    setFormData({ title: item.title, description: item.description });
    setIsModalOpen(true);
  };

  // บันทึกข้อมูล (เพิ่ม หรือ แก้ไข)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentId) {
      // กรณีแก้ไข: หา ID เดิมแล้วแก้ข้อมูล
      setPositions((prev) =>
        prev.map((item) =>
          item.id === currentId ? { ...item, ...formData } : item
        )
      );
    } else {
      // กรณีเพิ่มใหม่: สร้าง ID ใหม่แล้วยัดใส่ Array
      const newId = positions.length > 0 ? Math.max(...positions.map(p => p.id)) + 1 : 1;
      setPositions([...positions, { id: newId, ...formData }]);
    }

    setIsModalOpen(false);
  };

  // ลบข้อมูล
  const handleDelete = (id: number) => {
    if (confirm("ต้องการลบตำแหน่งงานนี้ใช่หรือไม่?")) {
      setPositions((prev) => prev.filter((item) => item.id !== id));
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
             <p className="text-gray-500">เพิ่ม ลด หรือแก้ไขรายละเอียดตำแหน่งงาน</p>
          </div>
          
          {/* ปุ่มเพิ่มตำแหน่งงาน */}
          <button 
            onClick={openAddModal}
            className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-transform hover:-translate-y-1"
          >
            <Plus size={20} /> เพิ่มตำแหน่งใหม่
          </button>
        </div>

        {/* List of Positions (Admin View) */}
        <div className="w-full max-w-4xl space-y-4">
          {positions.length === 0 ? (
             <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                ยังไม่มีตำแหน่งงาน
             </div>
          ) : (
             positions.map((position) => (
                <div
                  key={position.id}
                  className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-all"
                >
                  {/* เนื้อหา */}
                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-xl font-bold text-blue-700">
                      {position.title}
                    </h3>
                    <p className="text-gray-500 mt-1">
                      {position.description}
                    </p>
                  </div>
    
                  {/* ปุ่ม Action (แก้ไข / ลบ) */}
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

        {/* --- Modal (Popup) --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">
                    {currentId ? "แก้ไขตำแหน่งงาน" : "เพิ่มตำแหน่งใหม่"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
              </div>

              {/* Modal Form */}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด / สิ่งที่ต้องเรียนรู้</label>
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
                        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Save size={18} /> บันทึก
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