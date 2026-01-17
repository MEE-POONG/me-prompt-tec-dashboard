import React, { useState } from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
import {
  Layers,
  UserPlus,
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Link as LinkIcon,
  Save,
  X,
  ArrowLeft,
  Loader2
} from "lucide-react";
import Link from "next/link";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";
import ImageUpload from "@/components/ImageUpload";
import { CloudflareImageData } from "@/lib/cloudflareImage";

export default function AddInternPage() {
  const router = useRouter();
  const { gen } = router.query; // รับค่า gen จาก URL (ถ้ามี)

  // --- State ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [position, setPosition] = useState("coop");
  const [university, setUniversity] = useState("มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน");
  const [faculty, setFaculty] = useState("คณะบริหารธุรกิจ");
  const [major, setMajor] = useState("สารสนเทศทางคอมพิวเตอร์");
  const [studentId, setStudentId] = useState("");
  const [portfolioSlug, setPortfolioSlug] = useState("");

  // Default Gen = 6 หรือค่าจาก URL
  const [selectedGen, setSelectedGen] = useState(gen ? String(gen) : "6");

  const [imageUrl, setImageUrl] = useState("");
  const [imageData, setImageData] = useState<CloudflareImageData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const genOptions = Array.from({ length: 10 }, (_, i) => String(10 - i));

  // --- Functions ---
  const handleImageChange = (url: string, data?: CloudflareImageData) => {
    setImageUrl(url);
    if (data) {
      setImageData(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !portfolioSlug) {
      alert("กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, นามสกุล, Portfolio Slug)");
      return;
    }

    setIsSubmitting(true);

    try {
      const links = [];
      if (facebook) links.push({ label: "Facebook", url: facebook });
      if (instagram) links.push({ label: "Instagram", url: instagram });
      if (github) links.push({ label: "GitHub", url: github });
      if (portfolio) links.push({ label: "Portfolio", url: portfolio });

      const newIntern = {
        name: {
          first: firstName,
          last: lastName,
          display: displayName || `${firstName} ${lastName}`,
        },
        university,
        faculty,
        major,
        studentId,
        coopType: position,
        contact: {
          email: email || undefined,
          phone: phone || undefined,
        },
        resume: {
          links: links.length > 0 ? links : [],
        },
        avatar: imageUrl || undefined,
        portfolioSlug,
        status: "published",
        gen: selectedGen, // ส่งค่า gen ไปด้วย
      };

      const token = localStorage.getItem("token");
      const response = await fetch("/api/intern", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newIntern),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating intern:", error);
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layouts>
      <div className="min-h-screen bg-[#fffaf5] py-8 px-4 relative overflow-hidden font-sans text-slate-800">

        {/* --- 🌟 Background Aurora (Theme ส้ม/แสด) --- */}
        <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-orange-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-amber-200/40 rounded-full blur-[120px] mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-red-200/30 rounded-full blur-[120px] mix-blend-multiply"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">

          {/* Header */}
          <div className="mb-8">
            <Link
              href="/intern"
              className="inline-flex items-center text-slate-500 hover:text-orange-600 mb-4 transition-colors text-sm font-bold bg-white/50 px-3 py-1.5 rounded-lg border border-white/50 backdrop-blur-sm shadow-sm"
            >
              <ArrowLeft size={16} className="mr-1" /> ย้อนกลับ
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-linear-to-br from-orange-500 to-amber-600 rounded-2xl text-white shadow-lg shadow-orange-500/30">
                <UserPlus size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
                  เพิ่มนักศึกษาฝึกงานใหม่
                  <span className="px-3 py-0.5 bg-orange-100 text-orange-600 rounded-lg text-sm font-bold border border-orange-200">
                    รุ่นที่ {selectedGen}
                  </span>
                </h1>
                <p className="text-slate-500 font-medium">
                  กรอกข้อมูลนักศึกษาเพื่อเพิ่มลงในระบบ
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* === Card 1: ข้อมูลส่วนตัว & รูปภาพ === */}
            <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-xl border border-white/60 overflow-hidden p-8 md:p-10">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <User size={20} className="text-orange-500" /> ข้อมูลส่วนตัว
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Image Upload */}
                <div className="lg:col-span-1 flex flex-col">
                  <ImageUpload
                    relatedType="intern"
                    fieldName="avatar"
                    label="รูปประจำตัว"
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
                      <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อจริง <span className="text-red-500">*</span></label>
                      <input type="text" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium"
                        value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="สมชาย" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">นามสกุล <span className="text-red-500">*</span></label>
                      <input type="text" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium"
                        value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="ใจดี" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อที่แสดง (Display Name)</label>
                    <input type="text" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium"
                      value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={`${firstName} ${lastName}`} />
                    <p className="text-xs text-slate-400 mt-1">*ถ้าไม่กรอก จะใช้ ชื่อ + นามสกุล</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={18} /></div>
                        <input type="email" className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium"
                          value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">เบอร์โทร</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Phone size={18} /></div>
                        <input type="tel" className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium"
                          value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812345678" />
                      </div>
                    </div>
                  </div>

                  {/* Gen & Position */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">รุ่นที่ (Gen)</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Layers size={18} /></div>
                        <select className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium appearance-none cursor-pointer"
                          value={selectedGen} onChange={(e) => setSelectedGen(e.target.value)}>
                          {genOptions.map((g) => (<option key={g} value={g}>รุ่นที่ {g}</option>))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">ประเภท *</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Briefcase size={18} /></div>
                        <select className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium appearance-none cursor-pointer"
                          value={position} onChange={(e) => setPosition(e.target.value)} required>
                          <option value="coop">สหกิจศึกษา (Coop)</option>
                          <option value="internship">ฝึกงาน (Internship)</option>
                          <option value="part_time">Part-time</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* === Card 2: การศึกษา & Portfolio === */}
            <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-xl border border-white/60 overflow-hidden p-8 md:p-10">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <GraduationCap size={20} className="text-orange-500" /> การศึกษา & Portfolio
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">มหาวิทยาลัย</label>
                    <input type="text" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium"
                      value={university} onChange={(e) => setUniversity(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">คณะ</label>
                    <input type="text" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium"
                      value={faculty} onChange={(e) => setFaculty(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">สาขา</label>
                    <input type="text" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium"
                      value={major} onChange={(e) => setMajor(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">รหัสนักศึกษา</label>
                    <input type="text" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium"
                      value={studentId} onChange={(e) => setStudentId(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Portfolio Slug * (URL)</label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-500 font-medium text-sm">
                      <span className="shrink-0">.../intern/</span>
                      <input type="text" className="w-full bg-transparent outline-none text-slate-800 font-bold placeholder:text-slate-400"
                        value={portfolioSlug} onChange={(e) => setPortfolioSlug(e.target.value)} required placeholder="example-portfolio" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* === Card 3: Social Links === */}
            <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-xl border border-white/60 overflow-hidden p-8 md:p-10">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <LinkIcon size={20} className="text-orange-500" /> Social Links
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facebook */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Facebook</label>
                  <input type="url" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium placeholder:text-slate-400"
                    value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/..." />
                </div>
                {/* Instagram */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Instagram</label>
                  <input type="url" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium placeholder:text-slate-400"
                    value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
                </div>
                {/* GitHub */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">GitHub</label>
                  <input type="url" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium placeholder:text-slate-400"
                    value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." />
                </div>
                {/* Portfolio Link */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Portfolio Link (External)</label>
                  <input type="url" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium placeholder:text-slate-400"
                    value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://myportfolio.com" />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 pb-12">
              <Link href="/intern">
                <button type="button" className="px-8 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 hover:shadow-sm transition-all flex items-center gap-2">
                  <X size={20} /> ยกเลิก
                </button>
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-10 py-3.5 rounded-2xl bg-orange-600 text-white font-bold hover:bg-orange-700 shadow-xl shadow-orange-500/30 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {isSubmitting ? "กำลังบันทึก..." : "เพิ่มนักศึกษา"}
              </button>
            </div>

          </form>
        </div>

        {/* Success Modal */}
        <ModalSuccess
          open={showSuccessModal}
          href="/intern"
          message="เพิ่มนักศึกษาสำเร็จ!"
          description="คุณได้เพิ่มข้อมูลนักศึกษาฝึกงานเรียบร้อยแล้ว"
          onClose={() => setShowSuccessModal(false)}
        />
      </div>
    </Layouts>
  );
}