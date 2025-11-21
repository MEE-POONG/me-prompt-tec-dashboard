import React, { useState, useRef } from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts"; 
import { 
  Upload, FolderGit2, Calendar, FileText, 
  Save, X, ArrowLeft, Building2, CheckCircle 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AddProjectPage() {
  const router = useRouter();

  // --- State ข้อมูล ---
  const [title, setTitle] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Published"); // Published, Draft
  
  // --- State รูปภาพ (Cover) ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Mock Data รายชื่อพันธมิตร (ของจริงต้องดึงจาก Database) ---
  const partners = [
    { id: "1", name: "Computer Science RMUTI" },
    { id: "2", name: "Me Prompt TEC" },
    { id: "3", name: "Multimedia Technology" },
  ];

  // --- ฟังก์ชันจัดการรูปภาพ ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // จำลองการบันทึก
    const newProject = { 
      title, 
      partnerId, 
      date, 
      description, 
      status, 
      image: imageFile 
    };
    console.log("Saving Project:", newProject);
    alert("บันทึกโปรเจกต์เรียบร้อย!");
    router.push("/projects_partner"); // กลับไปหน้ารวมโปรเจกต์
  };

  return (
    <Layouts>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
             <Link href="/projects_partner" className="inline-flex items-center text-gray-500 hover:text-amber-600 mb-4 transition-colors text-sm">
                <ArrowLeft size={16} className="mr-1"/> ย้อนกลับไปหน้าโปรเจกต์รวม
             </Link>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 rounded-lg text-white shadow-sm">
                   <FolderGit2 size={24} />
                </div>
                <div>
                   <h1 className="text-2xl font-bold text-gray-900">เพิ่มโปรเจกต์ใหม่</h1>
                   <p className="text-gray-500 text-sm">สร้างรายการกิจกรรมหรือผลงานร่วมกับพันธมิตร</p>
                </div>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-8">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* ฝั่งซ้าย: อัปโหลดรูปปก (Cover Image) */}
              <div className="md:col-span-5 flex flex-col space-y-4">
                 <label className="block text-sm font-bold text-gray-900">รูปปกโปรเจกต์ (Cover Image) <span className="text-red-500">*</span></label>
                 
                 {/* ใช้ aspect-video (16:9) เหมาะกับรูปปกโปรเจกต์ */}
                 <div 
                    className="aspect-video w-full border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:border-amber-500 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group"
                    onClick={() => fileInputRef.current?.click()}
                 >
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    
                    {imageUrl ? (
                      <>
                        <Image src={imageUrl} alt="Cover Preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-medium flex items-center gap-2"><Upload size={18} /> เปลี่ยนรูป</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="bg-white p-3 rounded-full shadow-sm inline-block mb-2"><Upload size={20} className="text-amber-500"/></div>
                        <p className="text-sm font-medium text-gray-600">อัปโหลดรูปปก</p>
                        <p className="text-xs mt-1 opacity-60">ขนาดแนะนำ 1920x1080 (16:9)</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* ฝั่งขวา: ข้อมูลโปรเจกต์ */}
              <div className="md:col-span-7 space-y-5">
                 
                 {/* เลือกพันธมิตร */}
                 <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">เจ้าของโปรเจกต์ (Partner) <span className="text-red-500">*</span></label>
                    <div className="relative">
                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600"><Building2 size={18}/></div>
                       <select 
                         className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-500 bg-gray-50 focus:bg-white text-gray-900 cursor-pointer appearance-none" 
                         value={partnerId} 
                         onChange={e => setPartnerId(e.target.value)} 
                         required
                       >
                          <option value="">-- เลือกพันธมิตร --</option>
                          {partners.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                       </select>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                    </div>
                 </div>

                 {/* ชื่อโปรเจกต์ */}
                 <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">ชื่อโปรเจกต์ <span className="text-red-500">*</span></label>
                    <div className="relative">
                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FolderGit2 size={18}/></div>
                       <input 
                         type="text" 
                         className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-500 transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400" 
                         placeholder="เช่น AI Workshop 2024..." 
                         value={title} 
                         onChange={e => setTitle(e.target.value)} 
                         required 
                       />
                    </div>
                 </div>

                 {/* วันที่ */}
                 <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">วันที่จัดกิจกรรม / เผยแพร่</label>
                    <div className="relative">
                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Calendar size={18}/></div>
                       <input 
                         type="date" 
                         className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-500 bg-gray-50 focus:bg-white text-gray-900" 
                         value={date} 
                         onChange={e => setDate(e.target.value)} 
                       />
                    </div>
                 </div>

              </div>

              {/* Full Width: รายละเอียด */}
              <div className="md:col-span-12">
                <label className="block text-sm font-bold text-gray-900 mb-2">รายละเอียดโปรเจกต์</label>
                <div className="relative">
                    <div className="absolute left-3 top-4 text-gray-400"><FileText size={18}/></div>
                    <textarea 
                        rows={5} 
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-500 bg-gray-50 focus:bg-white resize-none text-gray-900 placeholder:text-gray-400" 
                        placeholder="เขียนคำอธิบายเกี่ยวกับกิจกรรม ผลลัพธ์ หรือรายละเอียดสำคัญ..." 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                    />
                </div>
              </div>

            </div>

            {/* ส่วนสถานะ */}
            <div className="mt-8 pt-6 border-t border-gray-100">
               <label className="block text-sm font-bold text-gray-900 mb-3">สถานะการแสดงผล</label>
               <div className="flex gap-4">
                  {/* Published Radio */}
                  <div 
                    onClick={() => setStatus("Published")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 cursor-pointer transition-all ${status === "Published" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}
                  >
                     <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${status === "Published" ? "border-green-600 bg-green-600" : "border-gray-400"}`}>
                        {status === "Published" && <div className="w-2 h-2 bg-white rounded-full" />}
                     </div>
                     <span className="font-bold">เผยแพร่ทันที (Published)</span>
                  </div>

                  {/* Draft Radio */}
                  <div 
                    onClick={() => setStatus("Draft")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 cursor-pointer transition-all ${status === "Draft" ? "border-gray-500 bg-gray-100 text-gray-800" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}
                  >
                     <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${status === "Draft" ? "border-gray-600 bg-gray-600" : "border-gray-400"}`}>
                        {status === "Draft" && <div className="w-2 h-2 bg-white rounded-full" />}
                     </div>
                     <span className="font-bold">แบบร่าง (Draft)</span>
                  </div>
               </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-8">
               <Link href="/projects_partner">
                  <button type="button" className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 flex items-center gap-2">
                     <X size={18} /> ยกเลิก
                  </button>
               </Link>
               <button type="submit" className="px-8 py-2.5 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 shadow-lg shadow-amber-200 hover:shadow-amber-300 transition-all flex items-center gap-2">
                  <Save size={18} /> บันทึกโปรเจกต์
               </button>
            </div>

          </form>
        </div>
      </div>
    </Layouts>
  );
}