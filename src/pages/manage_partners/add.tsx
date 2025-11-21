import React, { useState, useRef } from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
import { Upload, Building2, Globe, Briefcase, Save, X, ArrowLeft, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AddPartnerPage() {
  const router = useRouter();

  // --- State ข้อมูล ---
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  
  // --- State รูปภาพ ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const newPartner = { name, type, website, description, status, image: imageFile };
    console.log("Saving:", newPartner);
    alert("บันทึกข้อมูลเรียบร้อย!");
    router.push("/manage_partners");
  };

  return (
    <Layouts>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
             <Link href="/manage_partners" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors text-sm">
                <ArrowLeft size={16} className="mr-1"/> ย้อนกลับไปหน้าจัดการพันธมิตร
             </Link>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                   <Building2 size={24} />
                </div>
                <div>
                   <h1 className="text-2xl font-bold text-gray-900">เพิ่มพันธมิตรใหม่</h1>
                   <p className="text-gray-500 text-sm">เพิ่มข้อมูลสถาบันการศึกษาหรือองค์กรที่ร่วมมือ</p>
                </div>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-8">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* ฝั่งซ้าย: อัปโหลดโลโก้ */}
              <div className="md:col-span-4 flex flex-col space-y-4">
                 {/* ปรับ Label ให้เข้มขึ้น */}
                 <label className="block text-sm font-bold text-gray-900">โลโก้หน่วยงาน (Logo) <span className="text-red-500">*</span></label>
                 
                 <div 
                    className="aspect-square w-full border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:border-blue-500 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group"
                    onClick={() => fileInputRef.current?.click()}
                 >
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    
                    {imageUrl ? (
                      <>
                        <Image src={imageUrl} alt="Logo Preview" fill className="object-contain p-4" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-medium flex items-center gap-2"><Upload size={18} /> เปลี่ยนรูป</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="bg-white p-3 rounded-full shadow-sm inline-block mb-2"><Upload size={20}/></div>
                        <p className="text-sm font-medium">อัปโหลดโลโก้</p>
                        <p className="text-xs mt-1 opacity-70">ขนาดแนะนำ 500x500px</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* ฝั่งขวา: ข้อมูล */}
              <div className="md:col-span-8 space-y-5">
                 <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">ชื่อหน่วยงาน / องค์กร <span className="text-red-500">*</span></label>
                    <div className="relative">
                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"><Building2 size={18}/></div>
                       {/* ✅ เพิ่ม text-gray-900 และ placeholder:text-gray-500 */}
                       <input 
                         type="text" 
                         className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-500" 
                         placeholder="เช่น สาขาวิชาวิทยาการคอมพิวเตอร์ RMUTI..." 
                         value={name} 
                         onChange={e => setName(e.target.value)} 
                         required 
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                       <label className="block text-sm font-bold text-gray-900 mb-2">ประเภทหน่วยงาน <span className="text-red-500">*</span></label>
                       {/* ✅ เพิ่ม text-gray-900 */}
                       <select 
                         className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 focus:bg-white text-gray-900 cursor-pointer" 
                         value={type} 
                         onChange={e => setType(e.target.value)} 
                         required
                       >
                          <option value="">-- เลือกประเภท --</option>
                          <option value="สถาบันการศึกษา">สถาบันการศึกษา</option>
                          <option value="บริษัทเอกชน">บริษัทเอกชน</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-900 mb-2">เว็บไซต์ (ถ้ามี)</label>
                       <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Globe size={18}/></div>
                          {/* ✅ เพิ่ม text-gray-900 และ placeholder:text-gray-500 */}
                          <input 
                            type="url" 
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-500" 
                            placeholder="www.example.com" 
                            value={website} 
                            onChange={e => setWebsite(e.target.value)} 
                          />
                       </div>
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">รายละเอียดโดยย่อ</label>
                    <div className="relative">
                       <div className="absolute left-3 top-4 text-gray-400"><Briefcase size={18}/></div>
                       {/* ✅ เพิ่ม text-gray-900 และ placeholder:text-gray-500 */}
                       <textarea 
                         rows={3} 
                         className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 focus:bg-white resize-none text-gray-900 placeholder:text-gray-500" 
                         placeholder="คำอธิบายเกี่ยวกับหน่วยงาน ความเชี่ยวชาญ หรือความร่วมมือ..." 
                         value={description} 
                         onChange={e => setDescription(e.target.value)} 
                       />
                    </div>
                 </div>
              </div>

            </div>

            {/* ส่วนสถานะ */}
            <div className="mt-8 pt-6 border-t border-gray-100">
               <label className="block text-sm font-bold text-gray-900 mb-3">สถานะพันธมิตร</label>
               <div className="flex gap-4">
                  <div 
                    onClick={() => setStatus("Active")}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${status === "Active" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}
                  >
                     <CheckCircle size={18} className={status === "Active" ? "fill-blue-600 text-white" : "text-gray-400"} />
                     <span className="font-semibold text-sm">กำลังร่วมมือ (Active)</span>
                  </div>

                  <div 
                    onClick={() => setStatus("Inactive")}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${status === "Inactive" ? "border-gray-500 bg-gray-100 text-gray-800" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}
                  >
                     <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${status === "Inactive" ? "border-gray-600 bg-gray-600" : "border-gray-400"}`}>
                        {status === "Inactive" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                     </div>
                     <span className="font-semibold text-sm">สิ้นสุดโครงการ (Inactive)</span>
                  </div>
               </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-8">
               <Link href="/manage_partners">
                  <button type="button" className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 flex items-center gap-2">
                     <X size={18} /> ยกเลิก
                  </button>
               </Link>
               <button type="submit" className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-200 transition-all flex items-center gap-2">
                  <Save size={18} /> บันทึกข้อมูล
               </button>
            </div>

          </form>
        </div>
      </div>
    </Layouts>
  );
}