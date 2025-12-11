import React, { useState } from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
import {
  FolderPlus,
  ArrowLeft,
  Save,
  X,
  Loader2,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";

export default function AddWorkspacePage() {
  const router = useRouter();

  // --- State ---
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("bg-blue-100 text-blue-600");

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- Helper Functions ---
  const generateSlug = (name: string) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const text = `${name}-${randomSuffix}`.toLowerCase();
    return text.replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const autoSlug = generateSlug(projectName);

      const payload = {
        name: projectName,
        slug: autoSlug,
        description,
      };

      // TODO: Replace with actual API endpoint
      console.log("Payload:", payload);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      alert("เพิ่มแผนงานไม่สำเร็จ: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layouts>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 relative overflow-hidden font-sans text-slate-800">
        
        {/* --- Background Aurora --- */}
        <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px] mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-cyan-200/30 rounded-full blur-[120px] mix-blend-multiply"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/workspace"
              className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-4 transition-colors text-sm font-bold bg-white/50 px-3 py-1.5 rounded-lg border border-white/50 backdrop-blur-sm shadow-sm"
            >
              <ArrowLeft size={16} className="mr-1" /> ย้อนกลับ
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                <FolderPlus size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800">
                  เพิ่มแผนงานใหม่
                </h1>
                <p className="text-slate-500 font-medium">
                  สร้างแผนงานและจัดการโปรเจกต์ของคุณ
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* === Card 1: ข้อมูลพื้นฐาน === */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden p-8 md:p-10">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Briefcase size={20} className="text-blue-500"/> ข้อมูลพื้นฐาน
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อแผนงาน *</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                    value={projectName} 
                    onChange={(e) => setProjectName(e.target.value)} 
                    required 
                    placeholder="ระบุชื่อแผนงาน เช่น Website Redesign Project" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">คำอธิบาย</label>
                  <textarea 
                    rows={4} 
                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium resize-none"
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="อธิบายรายละเอียดของแผนงาน..." 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">เลือกสี</label>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { value: "bg-blue-100 text-blue-600", color: "bg-blue-500" },
                      { value: "bg-purple-100 text-purple-600", color: "bg-purple-500" },
                      { value: "bg-orange-100 text-orange-600", color: "bg-orange-500" },
                      { value: "bg-green-100 text-green-600", color: "bg-green-500" },
                      { value: "bg-pink-100 text-pink-600", color: "bg-pink-500" },
                      { value: "bg-red-100 text-red-600", color: "bg-red-500" },
                      { value: "bg-yellow-100 text-yellow-600", color: "bg-yellow-500" },
                      { value: "bg-indigo-100 text-indigo-600", color: "bg-indigo-500" },
                      { value: "bg-teal-100 text-teal-600", color: "bg-teal-500" },
                      { value: "bg-cyan-100 text-cyan-600", color: "bg-cyan-500" },
                    ].map((colorOption) => (
                      <button
                        key={colorOption.value}
                        type="button"
                        onClick={() => setColor(colorOption.value)}
                        className={`h-12 rounded-xl transition-all ${
                          color === colorOption.value
                            ? " scale-110"
                            : "hover:scale-105"
                        } ${colorOption.color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>


            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 pb-12">
              <Link href="/workspace">
                <button 
                  type="button" 
                  className="px-8 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 hover:shadow-sm transition-all flex items-center gap-2"
                >
                  <X size={20} /> ยกเลิก
                </button>
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-10 py-3.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/30 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                {isSubmitting ? "กำลังบันทึก..." : "สร้างแผนงาน"}
              </button>
            </div>

          </form>
        </div>

        {/* Modal Success */}
        <ModalSuccess
          open={showSuccessModal}
          href="/workspace"
          message="เพิ่มแผนงานสำเร็จ!"
          description="คุณได้สร้างแผนงานใหม่เรียบร้อยแล้ว"
          onClose={() => setShowSuccessModal(false)}
        />
      </div>
    </Layouts>
  );
}
