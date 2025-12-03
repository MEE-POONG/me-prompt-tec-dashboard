import React, { useState } from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
import {
  UserPlus,
  Briefcase,
  MapPin,
  Linkedin,
  Github,
  Facebook,
  Instagram,
  Globe,
  ArrowLeft,
  Save,
  X,
  Loader2,
  User
} from "lucide-react";
import Link from "next/link";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";
import ImageUpload from "@/components/ImageUpload";
import { CloudflareImageData } from "@/lib/cloudflareImage";

export default function AddMemberPage() {
  const router = useRouter();

  // --- State ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [bio, setBio] = useState("");
  // ❌ ลบ state slug ออก (เพราะจะเจนเองตอนกดปุ่ม)

  // Social Media
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // Image & UI
  const [imageUrl, setImageUrl] = useState("");
  const [imageData, setImageData] = useState<CloudflareImageData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- Helper Functions ---
  // ✅ ฟังก์ชันสร้าง Slug อัตโนมัติ
  const generateSlug = (first: string, last: string) => {
    // สุ่มตัวเลข 4 หลักต่อท้ายกันซ้ำ (เช่น somchai-jaidee-1234)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); 
    const text = `${first}-${last}-${randomSuffix}`.toLowerCase();
    return text.replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-"); 
  };

  const handleImageChange = (url: string, data?: CloudflareImageData) => {
    setImageUrl(url);
    if (data) {
      setImageData(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ✅ สร้าง Slug อัตโนมัติตรงนี้
      const autoSlug = generateSlug(firstName, lastName);

      const payload = {
        name: {
          first: firstName,
          last: lastName,
          display: displayName || `${firstName} ${lastName}`,
        },
        title,
        department,
        bio,
        photo: imageUrl,
        slug: autoSlug, // ✅ ส่งค่าที่เจนเองไป
        socials: {
          facebook,
          instagram,
          github,
          linkedin,
          website: portfolio,
        },
      };

      const res = await fetch("/api/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create member");
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      alert("เพิ่มพนักงานไม่สำเร็จ: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layouts>
      <div className="min-h-screen bg-[#f8fafc] py-8 px-4 relative overflow-hidden font-sans text-slate-800">
        
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
              href="/teammember"
              className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-4 transition-colors text-sm font-bold bg-white/50 px-3 py-1.5 rounded-lg border border-white/50 backdrop-blur-sm shadow-sm"
            >
              <ArrowLeft size={16} className="mr-1" /> ย้อนกลับ
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                <UserPlus size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800">
                   เพิ่มพนักงานใหม่
                </h1>
                <p className="text-slate-500 font-medium">
                   กรอกข้อมูลพนักงานเพื่อเพิ่มลงในระบบ
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
             
             {/* === Card 1: ข้อมูลส่วนตัว & รูปภาพ === */}
             <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-xl border border-white/60 overflow-hidden p-8 md:p-10">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                    <User size={20} className="text-blue-500"/> ข้อมูลส่วนตัว
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left: Image Upload */}
                    <div className="lg:col-span-1 flex flex-col items-center lg:items-start">
                        <ImageUpload
                            relatedType="member"
                            fieldName="photo"
                            label="รูปโปรไฟล์"
                            value={imageUrl}
                            onChange={handleImageChange}
                            aspectRatio="square"
                            imagefit="contain"
                        />
                    </div>

                    {/* Right: Inputs */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อจริง (First Name) *</label>
                                <input type="text" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                                    value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="Somchai" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">นามสกุล (Last Name) *</label>
                                <input type="text" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                                    value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Jaidee" />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อที่แสดง (Display Name)</label>
                            <input type="text" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                                value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={`${firstName} ${lastName}`} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 items-center gap-2">
                                    <Briefcase size={16} className="text-blue-500"/> ตำแหน่ง (Title) *
                                </label>
                                <input type="text" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                                    value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Senior Developer" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 items-center gap-2">
                                    <MapPin size={16} className="text-blue-500"/> แผนก (Department) *
                                </label>
                                <select className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium appearance-none cursor-pointer"
                                    value={department} onChange={(e) => setDepartment(e.target.value)} required>
                                    <option value="">-- เลือกแผนก --</option>
                                    <option value="Development">Development</option>
                                    <option value="Design">Design</option>
                                    <option value="Management">Management</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="HR">Human Resources</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* ❌ ลบช่องกรอก Slug ออกแล้ว */}

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Bio / คำแนะนำตัว</label>
                            <textarea rows={3} className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium resize-none"
                                value={bio} onChange={(e) => setBio(e.target.value)} placeholder="เขียนแนะนำตัวสั้นๆ..." />
                        </div>
                    </div>
                </div>
             </div>

             {/* === Card 2: Social Media === */}
             <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-xl border border-white/60 overflow-hidden p-8 md:p-10">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                    <Globe size={20} className="text-blue-500"/> ช่องทางการติดต่อ & Social Media
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Facebook size={18}/></div>
                        <input type="text" className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                            value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="Facebook URL" />
                    </div>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Instagram size={18}/></div>
                        <input type="text" className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                            value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram URL" />
                    </div>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Github size={18}/></div>
                        <input type="text" className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                            value={github} onChange={(e) => setGithub(e.target.value)} placeholder="GitHub URL" />
                    </div>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Linkedin size={18}/></div>
                        <input type="text" className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                            value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn URL" />
                    </div>
                    <div className="relative md:col-span-2">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Globe size={18}/></div>
                        <input type="text" className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                            value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="Website / Portfolio URL" />
                    </div>
                </div>
             </div>

             {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 pb-12">
                <Link href="/teammember">
                    <button type="button" className="px-8 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 hover:shadow-sm transition-all flex items-center gap-2">
                        <X size={20} /> ยกเลิก
                    </button>
                </Link>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-10 py-3.5 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/30 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                    {isSubmitting ? "กำลังบันทึก..." : "เพิ่มพนักงาน"}
                </button>
            </div>

          </form>
        </div>

        {/* Modal Success */}
        <ModalSuccess
          open={showSuccessModal}
          href="/teammember"
          message="เพิ่มพนักงานสำเร็จ!"
          description="คุณได้เพิ่มข้อมูลพนักงานใหม่เรียบร้อยแล้ว"
          onClose={() => setShowSuccessModal(false)}
        />
      </div>
    </Layouts>
  );
}