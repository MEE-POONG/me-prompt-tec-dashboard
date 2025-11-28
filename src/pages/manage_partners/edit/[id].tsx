import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
import Link from "next/link";
import Image from "next/image";
import {
  Upload,
  Building2,
  Globe,
  Briefcase,
  Save,
  X,
  ArrowLeft,
  Loader2,
  ImageIcon
} from "lucide-react";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";
import ModalError from "@/components/ui/Modals/ModalError";

export default function EditPartnerPage() {
  const router = useRouter();
  const { id } = router.query;

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [imageUrl, setImageUrl] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // --- Logic เดิม: แปลงไฟล์รูป ---
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // --- Logic เดิม: โหลดข้อมูล ---
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const loadPartner = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/partners/${id}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json.error || "Failed to fetch");

        const p = json.data;
        setName(p.name || "");
        setType(p.type || "");
        setWebsite(p.website || "");
        setDescription(p.description || "");
        setStatus(p.status || "active");
        setImageUrl(p.logo || "");
      } catch (err) {
        console.error("Load partner error", err);
        setErrorMessage("โหลดข้อมูลไม่สำเร็จ หรือไม่พบ ID นี้");
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    loadPartner();
  }, [id]);

  // --- Logic เดิม: อัปโหลดรูป ---
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("ไฟล์รูปภาพใหญ่เกินไป (ไม่ควรเกิน 2MB)");
        setShowErrorModal(true);
        return;
      }
      try {
        const base64 = await convertToBase64(file);
        setImageUrl(base64);
      } catch (err) {
        console.error("Error converting image", err);
        setErrorMessage("ไม่สามารถอ่านไฟล์รูปภาพได้");
        setShowErrorModal(true);
      }
    }
  };

  // --- Logic เดิม: บันทึกข้อมูล (PUT) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || typeof id !== "string") return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/partners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          website,
          logo: imageUrl,
          description,
          status,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error("Update partner error", err);
      setErrorMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layouts>
      <div className="min-h-screen bg-[#f8f9fc] py-8 px-4 relative overflow-hidden font-sans text-slate-800">
        
        {/* --- 🌟 Background Aurora (Theme ชมพู) --- */}
        <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
             <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-pink-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
             <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-rose-200/40 rounded-full blur-[120px] mix-blend-multiply"></div>
             <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px] mix-blend-multiply"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/manage_partners"
              className="inline-flex items-center text-slate-500 hover:text-pink-600 mb-4 transition-colors text-sm font-bold bg-white/50 px-3 py-1.5 rounded-lg border border-white/50 backdrop-blur-sm shadow-sm"
            >
              <ArrowLeft size={16} className="mr-1" /> ย้อนกลับ
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-linear-to-br from-pink-500 to-rose-600 rounded-2xl text-white shadow-lg shadow-pink-500/30">
                <Building2 size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800">
                  แก้ไขข้อมูลพันธมิตร
                </h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                  แก้ไขรายละเอียดสถาบันหรือองค์กร <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-mono">ID: {id}</span>
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-4xl p-12 shadow-sm border border-white/60 text-center flex flex-col items-center justify-center gap-4">
               <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
               <p className="text-slate-400 font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            /* Form Card (ดีไซน์ใหม่) */
            <form
              onSubmit={handleSubmit}
              className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-xl border border-white/60 overflow-hidden"
            >
              <div className="p-8 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* --- Left Column: Logo Upload --- */}
                <div className="lg:col-span-1 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-slate-100 pb-8 lg:pb-0 lg:pr-8">
                  <label className="block text-sm font-bold text-slate-700 mb-4 self-start items-center gap-2">
                    <ImageIcon size={18} className="text-pink-500"/> โลโก้หน่วยงาน
                  </label>

                  <div
                    className="aspect-square w-full max-w-[280px] border-2 border-dashed border-slate-300 rounded-4xl bg-slate-50 hover:bg-pink-50 hover:border-pink-300 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group shadow-inner"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />

                    {imageUrl ? (
                      <>
                        <Image
                          src={imageUrl}
                          alt="Logo Preview"
                          fill
                          className="object-contain p-6"
                        />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white backdrop-blur-sm">
                          <Upload size={32} className="mb-2" />
                          <span className="text-sm font-bold">เปลี่ยนรูปภาพ</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-slate-400 group-hover:text-pink-500 transition-colors">
                        <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-3">
                          <Upload size={32} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-bold">คลิกเพื่ออัปโหลด</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-4 text-center">
                     *แนะนำรูปสี่เหลี่ยมจัตุรัส พื้นหลังใส
                  </p>
                </div>

                {/* --- Right Column: Info Fields --- */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      ชื่อหน่วยงาน / องค์กร <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500">
                        <Building2 size={20} />
                      </div>
                      <input
                        type="text"
                        className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all bg-white text-slate-800 placeholder:text-slate-400 font-medium"
                        placeholder="เช่น มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Type */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        ประเภท <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Briefcase size={20} />
                        </div>
                        <select
                          className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all bg-white text-slate-800 font-medium cursor-pointer appearance-none"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          required
                        >
                          <option value="">-- เลือกประเภท --</option>
                          <option value="สถาบันการศึกษา">สถาบันการศึกษา</option>
                          <option value="หน่วยงานรัฐ">หน่วยงานรัฐ</option>
                          <option value="บริษัทเอกชน">บริษัทเอกชน</option>
                          <option value="องค์กรไม่แสวงหากำไร">องค์กรไม่แสวงหากำไร</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                           <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      </div>
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        เว็บไซต์ (ถ้ามี)
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Globe size={20} />
                        </div>
                        <input
                          type="url"
                          className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all bg-white text-slate-800 placeholder:text-slate-400 font-medium"
                          placeholder="https://www.example.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      รายละเอียดโดยย่อ
                    </label>
                    <textarea
                      rows={4}
                      className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all bg-white text-slate-800 placeholder:text-slate-400 font-medium resize-none leading-relaxed"
                      placeholder="คำอธิบายเกี่ยวกับหน่วยงาน ความเชี่ยวชาญ หรือความร่วมมือ..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                </div>
              </div>

              {/* Footer Buttons */}
              <div className="p-6 md:px-10 md:py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 backdrop-blur-md">
                <Link href="/manage_partners">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-white hover:shadow-sm hover:text-slate-800 transition-all flex items-center gap-2"
                  >
                    <X size={20} /> ยกเลิก
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl bg-pink-600 text-white font-bold hover:bg-pink-700 shadow-lg shadow-pink-500/30 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />} 
                  {submitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Success */}
        <ModalSuccess
          open={showSuccessModal}
          href="/manage_partners"
          message="แก้ไขข้อมูลสำเร็จ!"
          description="บันทึกการแก้ไขเรียบร้อยแล้ว"
          onClose={() => setShowSuccessModal(false)}
        />

        {/* Modal Error */}
        <ModalError
          open={showErrorModal}
          message="เกิดข้อผิดพลาด!"
          description={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      </div>
    </Layouts>
  );
}