import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
import {
  User,
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
  PenLine
} from "lucide-react";
import Link from "next/link";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";
import ModalError from "@/components/ui/Modals/ModalError";
import ImageUpload from "@/components/ImageUpload";
import { CloudflareImageData } from "@/lib/cloudflareImage";

export default function EditMemberPage() {
  const router = useRouter();
  const { id } = router.query;

  // --- State ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [bio, setBio] = useState("");
  const [slug, setSlug] = useState(""); // ยังเก็บค่าไว้ แต่ไม่แสดงให้แก้

  // Social Media
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // Image & UI
  const [imageUrl, setImageUrl] = useState("");
  const [imageData, setImageData] = useState<CloudflareImageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // --- Fetch Data ---
  useEffect(() => {
    if (id && typeof id === "string") {
      fetchMemberData(id);
    }
  }, [id]);

  const fetchMemberData = async (memberId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/member/${memberId}`);
      if (!res.ok) throw new Error("Failed to load member data");

      const json = await res.json();
      const data = json.data;

      // Map Data to State
      setFirstName(data.name?.first || "");
      setLastName(data.name?.last || "");
      setDisplayName(data.name?.display || "");
      setTitle(data.title || "");
      setDepartment(data.department || "");
      setBio(data.bio || "");
      setSlug(data.slug || ""); // โหลดค่าเดิมมาเก็บไว้
      setImageUrl(data.photo || "");

      // Socials
      setFacebook(data.socials?.facebook || "");
      setInstagram(data.socials?.instagram || "");
      setGithub(data.socials?.github || "");
      setLinkedin(data.socials?.linkedin || "");
      setPortfolio(data.socials?.website || "");

    } catch (err) {
      console.error(err);
      setErrorMessage("ไม่สามารถโหลดข้อมูลพนักงานได้");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Helper Functions ---
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
        slug, // ส่งค่าเดิมกลับไป
        socials: {
          facebook,
          instagram,
          github,
          linkedin,
          website: portfolio,
        },
      };

      const token = localStorage.getItem("token");
      const res = await fetch(`/api/member/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Update failed");
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layouts>
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-slate-400 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </Layouts>
    )
  }

  return (
    <Layouts>
      <div className="min-h-screen bg-[#f8fafc] py-8 px-4 relative overflow-hidden font-sans text-slate-800">

        {/* --- 🌟 Background Aurora (Theme ฟ้า/คราม) --- */}
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
                <PenLine size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800">
                  แก้ไขข้อมูลพนักงาน
                </h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                  อัปเดตข้อมูลในระบบ <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md font-mono">ID: {id}</span>
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* === Card 1: ข้อมูลส่วนตัว & รูปภาพ === */}
            <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-xl border border-white/60 overflow-hidden p-8 md:p-10">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <User size={20} className="text-blue-500" /> ข้อมูลส่วนตัว
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Image Upload */}
                <div className="lg:col-span-1 flex flex-col items-center lg:items-start">
                  <ImageUpload
                    relatedType="member"
                    relatedId={id as string}
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
                        <Briefcase size={16} className="text-blue-500" /> ตำแหน่ง (Title) *
                      </label>
                      <input type="text" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                        value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Senior Developer" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 items-center gap-2">
                        <MapPin size={16} className="text-blue-500" /> แผนก (Department) *
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

                  {/* ❌ เอาช่อง Slug ออกแล้ว */}

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
                <Globe size={20} className="text-blue-500" /> ช่องทางการติดต่อ & Social Media
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Facebook size={18} /></div>
                  <input type="text" className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                    value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="Facebook URL" />
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Instagram size={18} /></div>
                  <input type="text" className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                    value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram URL" />
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Github size={18} /></div>
                  <input type="text" className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                    value={github} onChange={(e) => setGithub(e.target.value)} placeholder="GitHub URL" />
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Linkedin size={18} /></div>
                  <input type="text" className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                    value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn URL" />
                </div>
                <div className="relative md:col-span-2">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Globe size={18} /></div>
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
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </button>
            </div>

          </form>
        </div>

        {/* Modal Success */}
        <ModalSuccess
          open={showSuccessModal}
          href="/teammember"
          message="แก้ไขข้อมูลสำเร็จ!"
          description="อัปเดตข้อมูลพนักงานเรียบร้อยแล้ว"
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