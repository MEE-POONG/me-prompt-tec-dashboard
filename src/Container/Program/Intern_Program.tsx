"use client"; // จำเป็นสำหรับ App Router หรือ Next.js รุ่นใหม่

import React, { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, X, Save, Loader2 } from "lucide-react";

// สร้าง Type ให้ตรงกับ Prisma Model
interface Position {
  id: string; // MongoDB ID เป็น String
  title: string;
  description: string;
  isOpen: boolean; // ใช้ isOpen ให้ตรงกับ Schema
}

export default function ManageInternship() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State สำหรับ Modal และ Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isOpen: true,
  });

  // --- 1. Fetch Data เมื่อโหลดหน้าเว็บ (เชื่อม Database) ---
  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/positions"); // ดึงข้อมูลจาก API จริง
      const data = await res.json();
      setPositions(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Functions เปิด Modal ---
  const openAddModal = () => {
    setCurrentId(null);
    setFormData({ title: "", description: "", isOpen: true });  
    setIsModalOpen(true);
  };

  const openEditModal = (item: Position) => {
    setCurrentId(item.id);
    setFormData({
      title: item.title,
      description: item.description,
      isOpen: item.isOpen,
    });
    setIsModalOpen(true);
  };

  // --- 2. Save (บันทึกลง Database) ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (currentId) {
        // --- แก้ไข (Update) ---
        const res = await fetch(`/api/positions/${currentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        
        if (res.ok) {
           const updatedItem = await res.json();
           setPositions((prev) => 
             prev.map((item) => (item.id === currentId ? updatedItem : item))
           );
        }
      } else {
        // --- เพิ่มใหม่ (Create) ---
        const res = await fetch("/api/positions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
            const newItem = await res.json();
            setPositions([newItem, ...positions]); // เพิ่มตัวใหม่ไว้บนสุด
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  // --- 3. Delete (ลบจาก Database) ---
  const handleDelete = async (id: string) => {
    if (confirm("ต้องการลบตำแหน่งงานนี้ใช่หรือไม่?")) {
      try {
        const res = await fetch(`/api/positions/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
            setPositions((prev) => prev.filter((item) => item.id !== id));
        }
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  // --- 4. Toggle Status (เปิด/ปิดรับสมัคร) ---
  const toggleStatus = async (position: Position) => {
    const newStatus = !position.isOpen;
    
    // อัปเดตหน้าจอทันที (Optimistic Update)
    setPositions((prev) =>
      prev.map((item) =>
        item.id === position.id ? { ...item, isOpen: newStatus } : item
      )
    );

    try {
        // ส่งค่าไปอัปเดต Database
        await fetch(`/api/positions/${position.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...position, isOpen: newStatus }),
        });
    } catch (error) {
        console.error("Error toggling:", error);
        // ถ้า Error ให้เปลี่ยนค่ากลับ
        setPositions((prev) =>
            prev.map((item) =>
              item.id === position.id ? { ...item, isOpen: !newStatus } : item
            )
          );
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
            <p className="text-gray-500">
              เพิ่ม ลด หรือแก้ไขรายละเอียดตำแหน่งงาน (เชื่อมต่อ Database)
            </p>
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
            
          {/* Loading State */}
          {isLoading ? (
             <div className="text-center py-10 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="animate-spin h-8 w-8 mb-2 text-blue-500" />
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
                className={`group bg-white rounded-xl p-6 shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-all ${
                  position.isOpen
                    ? "border-l-4 border-l-green-500 border-gray-200"
                    : "border-l-4 border-l-gray-300 border-gray-200 opacity-75"
                }`}
              >
                {/* เนื้อหา */}
                <div className="text-center md:text-left flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <h3 className="text-xl font-bold text-blue-700">
                      {position.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        position.isOpen
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {position.isOpen ? "เปิดรับสมัคร" : "ปิดรับชั่วคราว"}
                    </span>
                  </div>
                  <p className="text-gray-500 mt-1">{position.description}</p>
                </div>

                {/* --- ส่วน Action & Toggle --- */}
                <div className="flex items-center gap-4 md:gap-6 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-center md:justify-end">
                  
                  {/* Toggle Switch */}
                  <div
                    className="flex flex-col items-center gap-1 cursor-pointer"
                    onClick={() => toggleStatus(position)}
                  >
                    <div
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out flex items-center ${
                        position.isOpen ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                          position.isOpen ? "translate-x-6" : "translate-x-0"
                        }`}
                      ></div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {position.isOpen ? "ON" : "OFF"}
                    </span>
                  </div>

                  <div className="h-8 w-[1px] bg-gray-200 hidden md:block"></div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(position)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="แก้ไข"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(position.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="ลบ"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- Modal Form --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">
                  {currentId ? "แก้ไขตำแหน่งงาน" : "เพิ่มตำแหน่งใหม่"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อตำแหน่ง
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                    placeholder="เช่น Frontend Developer"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รายละเอียด
                  </label>
                  <textarea
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-black h-24 resize-none"
                    placeholder="รายละเอียด..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Option: สถานะใน Modal */}
                <div className="flex items-center gap-3">
                  <label className="block text-sm font-medium text-gray-700">
                    สถานะเริ่มต้น:
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isOpen: !formData.isOpen })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isOpen ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isOpen ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-500">
                    {formData.isOpen ? "เปิดรับ" : "ปิดรับ"}
                  </span>
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