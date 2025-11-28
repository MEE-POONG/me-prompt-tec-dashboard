import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
import { 
  Upload, 
  Layers, 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  Link as LinkIcon, 
  Save, 
  X, 
  ArrowLeft, 
  Loader2,
  ImageIcon,
  PenLine
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";
import ModalError from "@/components/ui/Modals/ModalError";

export default function EditInternPage() {
  const router = useRouter();
  const { id } = router.query;

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
  const [university, setUniversity] = useState("");
  const [faculty, setFaculty] = useState("");
  const [major, setMajor] = useState("");
  const [studentId, setStudentId] = useState("");
  const [portfolioSlug, setPortfolioSlug] = useState("");
  const [selectedGen, setSelectedGen] = useState("6");

  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true); // โหลดข้อมูล
  const [isSubmitting, setIsSubmitting] = useState(false); // บันทึกข้อมูล
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const genOptions = Array.from({ length: 10 }, (_, i) => String(10 - i));

  // --- Fetch Data ---
  useEffect(() => {
    if (id && typeof id === "string") {
      fetchInternData(id);
    }
  }, [id]);

  const fetchInternData = async (internId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/intern/${internId}`);
      const result = await response.json();

      if (response.ok) {
        const intern = result.data;
        setFirstName(intern.name.first || "");
        setLastName(intern.name.last || "");
        setDisplayName(intern.name.display || "");
        setEmail(intern.contact?.email || "");
        setPhone(intern.contact?.phone || "");
        
        setUniversity(intern.university || "");
        setFaculty(intern.faculty || "");
        setMajor(intern.major || "");
        setStudentId(intern.studentId || "");
        setPosition(intern.coopType || "coop");
        setPortfolioSlug(intern.portfolioSlug || "");
        setImageUrl(intern.avatar || "");
        setSelectedGen(intern.gen || "6");

        // Map Social Links
        const links = intern.resume?.links || [];
        setFacebook(links.find((l: any) => l.label.toLowerCase().includes("facebook"))?.url || "");
        setInstagram(links.find((l: any) => l.label.toLowerCase().includes("instagram"))?.url || "");
        setGithub(links.find((l: any) => l.label.toLowerCase().includes("github"))?.url || "");
        setPortfolio(links.find((l: any) => l.label.toLowerCase().includes("portfolio"))?.url || "");

      } else {
        setErrorMessage("ไม่พบข้อมูลนักศึกษา");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error fetching intern:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Image Handler ---
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await convertToBase64(file);
      setImageUrl(base64);
    }
  };

  // --- Submit Handler ---
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

      const updateData = {
        name: {
          first: firstName,
          last: lastName,
          display: displayName || `${firstName} ${lastName}`,
        },
        university, faculty, major, studentId,
        coopType: position,
        contact: { email: email || undefined, phone: phone || undefined },
        resume: { links: links.length > 0 ? links : [] },
        avatar: imageUrl || undefined,
        portfolioSlug,
        gen: selectedGen,
      };

      const response = await fetch(`/api/intern/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error("Failed to update");

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error updating intern:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layouts>
      <div className="min-h-screen bg-[#fffaf5] py-8 px-4 relative overflow-hidden font-sans text-slate-800">
        
        {/* --- 🌟 Background Aurora (Theme ส้ม) --- */}
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
                <PenLine size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800">
                   แก้ไขข้อมูลนักศึกษา
                </h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                   อัปเดตข้อมูลในระบบ <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md font-mono">ID: {id}</span>
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-4xl p-12 shadow-sm border border-white/60 text-center flex flex-col items-center justify-center gap-4 min-h-[400px]">
               <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
               <p className="text-slate-400 font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* === Card 1: ข้อมูลส่วนตัว & รูปภาพ === */}
              <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-xl border border-white/60 overflow-hidden p-8 md:p-10">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                      <User size={20} className="text-orange-500"/> ข้อมูลส่วนตัว
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      {/* Left: Image Upload */}
                      <div className="lg:col-span-1 flex flex-col">
                          <label className="block text-sm font-bold text-slate-700 mb-4">รูปโปรไฟล์</label>
                          <div
                              className="aspect-3/4 w-full max-w-[280px] mx-auto lg:mx-0 border-2 border-dashed border-slate-300 rounded-4xl bg-slate-50 hover:bg-orange-50 hover:border-orange-300 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group shadow-inner"
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
                                      <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white backdrop-blur-sm">
                                          <Upload size={32} className="mb-2" />
                                          <span className="text-sm font-bold">เปลี่ยนรูปภาพ</span>
                                      </div>
                                  </>
                              ) : (
                                  <div className="text-center text-slate-400 group-hover:text-orange-500 transition-colors">
                                      <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-3">
                                          <ImageIcon size={32} strokeWidth={1.5}/>
                                      </div>
                                      <p className="text-sm font-bold">อัปโหลดรูปภาพ</p>
                                      <p className="text-xs mt-1 opacity-70">PNG, JPG (Max 5MB)</p>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Right: Inputs */}
                      <div className="lg:col-span-2 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อจริง <span className="text-red-500">*</span></label>
                                  <input type="text" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium"
                                      value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-slate-700 mb-2">นามสกุล <span className="text-red-500">*</span></label>
                                  <input type="text" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium"
                                      value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                              </div>
                          </div>

                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อที่แสดง (Display Name)</label>
                              <input type="text" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium"
                                  value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={`${firstName} ${lastName}`} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                  <div className="relative">
                                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={18}/></div>
                                      <input type="email" className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium"
                                          value={email} onChange={(e) => setEmail(e.target.value)} />
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-slate-700 mb-2">เบอร์โทร</label>
                                  <div className="relative">
                                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Phone size={18}/></div>
                                      <input type="tel" className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium"
                                          value={phone} onChange={(e) => setPhone(e.target.value)} />
                                  </div>
                              </div>
                          </div>

                           {/* Gen & Position */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                              <div>
                                  <label className="block text-sm font-bold text-slate-700 mb-2">รุ่นที่ (Gen)</label>
                                  <div className="relative">
                                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Layers size={18}/></div>
                                      <select className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium appearance-none cursor-pointer"
                                          value={selectedGen} onChange={(e) => setSelectedGen(e.target.value)}>
                                          {genOptions.map((g) => (<option key={g} value={g}>รุ่นที่ {g}</option>))}
                                      </select>
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-slate-700 mb-2">ประเภท *</label>
                                  <div className="relative">
                                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Briefcase size={18}/></div>
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
                      <GraduationCap size={20} className="text-orange-500"/> การศึกษา & Portfolio
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
                              <label className="block text-sm font-bold text-slate-700 mb-2">Portfolio Slug *</label>
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
                      <LinkIcon size={20} className="text-orange-500"/> Social Links
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Facebook</label>
                          <input type="url" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium placeholder:text-slate-400"
                              value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/..." />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Instagram</label>
                          <input type="url" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium placeholder:text-slate-400"
                              value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">GitHub</label>
                          <input type="url" className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white font-medium placeholder:text-slate-400"
                              value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." />
                      </div>
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
                      {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                      {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                  </button>
              </div>

            </form>
          )}
        </div>

        {/* Success Modal */}
        <ModalSuccess
            open={showSuccessModal}
            href="/intern"
            message="แก้ไขข้อมูลสำเร็จ!"
            description="อัปเดตข้อมูลนักศึกษาเรียบร้อยแล้ว"
            onClose={() => setShowSuccessModal(false)}
        />

        {/* Error Modal */}
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