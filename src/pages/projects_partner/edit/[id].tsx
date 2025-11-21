import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts"; 
import { 
  Upload, FolderGit2, Calendar, FileText, 
  Save, X, ArrowLeft, Building2, Trash2, SquarePen
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = router.query; // รับ ID จาก URL (เช่น p2)

  // --- State ข้อมูล (เหมือนหน้า Add) ---
  const [title, setTitle] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Published");
  
  // --- State รูปภาพ ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Mock Data รายชื่อพันธมิตร ---
  const partners = [
    { id: "1", name: "Computer Science RMUTI" },
    { id: "2", name: "Me Prompt TEC" },
    { id: "3", name: "Multimedia Technology" },
  ];

  // --- ✅ 1. จำลองการดึงข้อมูลเก่ามาแสดง (Simulate Fetching) ---
  useEffect(() => {
    if (router.isReady && id) {
      // สมมติว่าไปดึง API มาตาม ID
      console.log("Fetching data for project ID:", id);

      // Mock ข้อมูลเก่า (ของจริงต้อง set จาก API)
      const mockOldData = {
        title: "AI Workshop 2024",
        partnerId: "1", // Computer Science
        date: "2024-11-20",
        description: "อบรมเชิงปฏิบัติการด้าน AI และ Machine Learning สำหรับนักศึกษา...",
        status: "Published",
        imageUrl: "https://placehold.co/600x400/orange/white?text=AI+Cover" // รูปตัวอย่าง
      };

      // Set ค่าลง State
      setTitle(mockOldData.title);
      setPartnerId(mockOldData.partnerId);
      setDate(mockOldData.date);
      setDescription(mockOldData.description);
      setStatus(mockOldData.status);
      setImageUrl(mockOldData.imageUrl);
    }
  }, [router.isReady, id]);

  // --- ฟังก์ชันจัดการรูปภาพ ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // จำลองการอัปเดต
    const updatedProject = { 
      id, title, partnerId, date, description, status, image: imageFile 
    };
    console.log("Updating Project:", updatedProject);
    alert("อัปเดตข้อมูลเรียบร้อย!");
    router.push("/projects_partner");
  };

  const handleDelete = () => {
    if(confirm("คุณแน่ใจหรือไม่ที่จะลบโปรเจกต์นี้?")) {
        console.log("Deleted ID:", id);
        alert("ลบโปรเจกต์แล้ว");
        router.push("/projects_partner");
    }
  }

  return (
    <Layouts>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
             <div>
                <Link href="/projects_partner" className="inline-flex items-center text-gray-500 hover:text-amber-600 mb-4 transition-colors text-sm">
                    <ArrowLeft size={16} className="mr-1"/> ย้อนกลับไปหน้าโปรเจกต์รวม
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500 rounded-lg text-white shadow-sm">
                    <SquarePen size={24} />
                    </div>
                    <div>
                    <h1 className="text-2xl font-bold text-gray-900">แก้ไขข้อมูลโปรเจกต์</h1>
                    <p className="text-gray-500 text-sm">รหัสโปรเจกต์: <span className="font-mono text-amber-600">#{id}</span></p>
                    </div>
                </div>
             </div>

             {/* ปุ่มลบ (Optional) */}
             <button 
                type="button" 
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all flex items-center gap-2 text-sm font-bold self-start md:self-end"
             >
                <Trash2 size={18} /> ลบโปรเจกต์นี้
             </button>
          </div>

          <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-8">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* ฝั่งซ้าย: อัปโหลดรูปปก */}
              <div className="md:col-span-5 flex flex-col space-y-4">
                 <label className="block text-sm font-bold text-gray-900">รูปปกโปรเจกต์ (Cover Image)</label>
                 
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
                        <Upload size={32} className="mx-auto mb-2 opacity-50"/>
                        <p className="text-sm">คลิกเพื่ออัปโหลด</p>
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
                  <Save size={18} /> บันทึกการแก้ไข
               </button>
            </div>

          </form>
        </div>
      </div>
    </Layouts>
  );
}