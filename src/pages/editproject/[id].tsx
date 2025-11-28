import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
import Link from "next/link";
import Image from "next/image";
import {
  Upload,
  X,
  Plus,
  Link as LinkIcon,
  Type,
  FileText,
  Loader2,
  Briefcase,
  Building2,
  Tag,
  ArrowLeft,
  ImageIcon,
  CheckCircle2,
  Save
} from "lucide-react";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";
import ModalError from "@/components/ui/Modals/ModalError";

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = router.query;

  // --- State ข้อมูล ---
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("in_progress");
  const [clientName, setClientName] = useState("");
  const [clientSector, setClientSector] = useState("");
  const [featured, setFeatured] = useState(false);

  // --- State สำหรับ Tags & Tech Stack ---
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [currentTech, setCurrentTech] = useState("");

  // --- State สำหรับ Links ---
  const [links, setLinks] = useState<
    { type: string; url: string; label?: string }[]
  >([]);
  const [linkType, setLinkType] = useState("website");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");

  // --- State รูปภาพ ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State สำหรับ Loading & Error ---
  const [loading, setLoading] = useState(true); // เริ่มต้นเป็น true เพื่อโหลดข้อมูล
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // --- 1. โหลดข้อมูลโปรเจกต์ ---
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/project/${id}`);
        
        if (!res.ok) {
            // กรณีไม่เจอหรือ Error
            setErrorMessage("ไม่พบข้อมูลโปรเจกต์");
            setShowErrorModal(true);
            return;
        }
        
        const json = await res.json();
        const data = json.data;

        // Map ข้อมูลใส่ State
        setTitle(data.title || "");
        setSlug(data.slug || "");
        setSummary(data.summary || "");
        setDescription(data.description || "");
        setStatus(data.status || "in_progress");
        setClientName(data.clientName || "");
        setClientSector(data.clientSector || "");
        setFeatured(data.featured || false);
        setTags(data.tags || []);
        setTechStack(data.techStack || []);
        setLinks(data.links || []);
        setImageUrl(data.cover || "");

      } catch (err) {
        console.error(err);
        setErrorMessage("ไม่สามารถโหลดข้อมูลโปรเจกต์ได้");
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);


  // --- ฟังก์ชันจัดการรูปภาพ ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // --- Handlers ---
  const handleTitleChange = (value: string) => { setTitle(value); };

  const handleAddTag = () => {
    if (currentTag.trim() !== "" && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };
  const handleRemoveTag = (tagToRemove: string) => setTags(tags.filter((tag) => tag !== tagToRemove));
  
  const handleAddTech = () => {
    if (currentTech.trim() !== "" && !techStack.includes(currentTech.trim())) {
      setTechStack([...techStack, currentTech.trim()]);
      setCurrentTech("");
    }
  };
  const handleRemoveTech = (techToRemove: string) => setTechStack(techStack.filter((tech) => tech !== techToRemove));

  const handleAddLink = () => {
    if (linkUrl.trim() !== "") {
      setLinks([...links, { type: linkType, url: linkUrl.trim(), label: linkLabel.trim() || undefined }]);
      setLinkUrl("");
      setLinkLabel("");
    }
  };
  const handleRemoveLink = (index: number) => setLinks(links.filter((_, i) => i !== index));

  const handleTagKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } };
  const handleTechKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); handleAddTech(); } };

  // --- Submit (PUT) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const projectData = {
        title, slug, summary, description, status,
        clientName: clientName || undefined,
        clientSector: clientSector || undefined,
        tags, techStack,
        cover: imageUrl || undefined,
        links: links.length > 0 ? links : undefined,
        featured,
      };

      const response = await fetch(`/api/project/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update project");
      }

      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layouts>
      <div className="min-h-screen bg-[#f8f9fc] py-8 px-4 relative overflow-hidden font-sans text-slate-800">
        
        {/* --- 🌟 Background Aurora (Theme ม่วง/น้ำเงิน) --- */}
        <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
             <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
             <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px] mix-blend-multiply"></div>
             <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px] mix-blend-multiply"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Header */}
          <div className="mb-8">
             <Link
              href="/project"
              className="inline-flex items-center text-slate-500 hover:text-violet-600 mb-4 transition-colors text-sm font-bold bg-white/50 px-3 py-1.5 rounded-lg border border-white/50 backdrop-blur-sm shadow-sm"
            >
              <ArrowLeft size={16} className="mr-1" /> ย้อนกลับ
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-linear-to-br from-violet-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-violet-500/30">
                <Briefcase size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800">
                   แก้ไขโปรเจกต์
                </h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                   อัปเดตข้อมูลโปรเจกต์ <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-mono">ID: {id}</span>
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-4xl p-12 shadow-sm border border-white/60 text-center flex flex-col items-center justify-center gap-4 min-h-[400px]">
               <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
               <p className="text-slate-400 font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* === Card 1: ข้อมูลหลัก & รูปปก === */}
                <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-xl border border-white/60 overflow-hidden p-8 md:p-10">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Type size={20} className="text-violet-500"/> ข้อมูลทั่วไป
                    </h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Left: Inputs */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อโปรเจกต์ <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all bg-white text-slate-800 font-medium placeholder:text-slate-400"
                                    value={title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    required
                                />
                            </div>
                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Slug (URL-friendly) <span className="text-red-500">*</span></label>
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-500 font-medium text-sm">
                                    <span className="shrink-0">your-site.com/project/</span>
                                    <input
                                        type="text"
                                        className="w-full bg-transparent outline-none text-slate-800 font-bold placeholder:text-slate-400"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            {/* Summary */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">สรุปสั้นๆ</label>
                                <textarea
                                    rows={2}
                                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all bg-white text-slate-800 font-medium placeholder:text-slate-400 resize-none"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Right: Image Upload */}
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-bold text-slate-700 mb-4">รูปภาพปก</label>
                            <div
                                className="aspect-video w-full border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-violet-50 hover:border-violet-300 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group shadow-inner"
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
                                    <div className="text-center text-slate-400 group-hover:text-violet-500 transition-colors">
                                        <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-3">
                                            <ImageIcon size={32} strokeWidth={1.5}/>
                                        </div>
                                        <p className="text-sm font-bold">อัปโหลดรูปปก</p>
                                        <p className="text-xs mt-1 opacity-70">PNG, JPG (Max 5MB)</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* === Card 2: รายละเอียด & ลูกค้า === */}
                <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-xl border border-white/60 overflow-hidden p-8 md:p-10">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                        <FileText size={20} className="text-violet-500"/> รายละเอียดเชิงลึก
                    </h2>
                    
                    <div className="space-y-6">
                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">รายละเอียดเต็ม</label>
                            <textarea
                                rows={6}
                                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all bg-white text-slate-800 font-medium placeholder:text-slate-400 resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Client Name */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อลูกค้า</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Building2 size={18}/></div>
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all bg-white text-slate-800 font-medium placeholder:text-slate-400"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                    />
                                </div>
                            </div>
                            {/* Client Sector */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">ประเภทธุรกิจ</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Briefcase size={18}/></div>
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all bg-white text-slate-800 font-medium placeholder:text-slate-400"
                                        value={clientSector}
                                        onChange={(e) => setClientSector(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Status & Featured */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">สถานะโปรเจกต์</label>
                                <select
                                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all bg-white text-slate-800 font-medium cursor-pointer appearance-none"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="in_progress">⏳ กำลังดำเนินการ</option>
                                    <option value="completed">✅ เสร็จสมบูรณ์</option>
                                    <option value="archived">📦 เก็บถาวร</option>
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-violet-50 hover:border-violet-200 transition-all group">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${featured ? 'bg-violet-500 border-violet-500' : 'border-slate-300 bg-white'}`}>
                                        {featured && <CheckCircle2 size={16} className="text-white"/>}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={featured}
                                        onChange={(e) => setFeatured(e.target.checked)}
                                    />
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-violet-700">
                                        ตั้งเป็นโปรเจกต์แนะนำ (Featured)
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === Card 3: Tags & Tech Stack & Links === */}
                <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-xl border border-white/60 overflow-hidden p-8 md:p-10">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Tag size={20} className="text-violet-500"/> Tags & เทคโนโลยี
                    </h2>

                    <div className="space-y-8">
                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tags</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-500 bg-white text-slate-800 font-medium"
                                    placeholder="พิมพ์ Tag แล้วกดปุ่ม + หรือ Enter"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                />
                                <button type="button" onClick={handleAddTag} className="bg-violet-600 hover:bg-violet-700 text-white p-2.5 rounded-xl transition-colors">
                                    <Plus size={24}/>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                    <span key={index} className="bg-violet-50 text-violet-700 border border-violet-100 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2">
                                        {tag}
                                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500"><X size={14}/></button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tech Stack */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tech Stack</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 bg-white text-slate-800 font-medium"
                                    placeholder="เช่น React, Node.js, MongoDB"
                                    value={currentTech}
                                    onChange={(e) => setCurrentTech(e.target.value)}
                                    onKeyDown={handleTechKeyDown}
                                />
                                <button type="button" onClick={handleAddTech} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-colors">
                                    <Plus size={24}/>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {techStack.map((tech, index) => (
                                    <span key={index} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2">
                                        {tech}
                                        <button type="button" onClick={() => handleRemoveTech(tech)} className="hover:text-red-500"><X size={14}/></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        {/* Links */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">ลิงก์ที่เกี่ยวข้อง</label>
                            <div className="flex flex-col md:flex-row gap-2 mb-3">
                                <select
                                    className="px-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white text-slate-800 font-medium cursor-pointer"
                                    value={linkType}
                                    onChange={(e) => setLinkType(e.target.value)}
                                >
                                    <option value="website">Website</option>
                                    <option value="demo">Demo</option>
                                    <option value="github">GitHub</option>
                                    <option value="other">อื่นๆ</option>
                                </select>
                                <input
                                    type="url"
                                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-slate-800 font-medium placeholder:text-slate-400"
                                    placeholder="https://..."
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="w-full md:w-32 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-slate-800 font-medium placeholder:text-slate-400"
                                    placeholder="Label (Opt)"
                                    value={linkLabel}
                                    onChange={(e) => setLinkLabel(e.target.value)}
                                />
                                <button type="button" onClick={handleAddLink} className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-colors">
                                    <Plus size={24}/>
                                </button>
                            </div>
                            <div className="space-y-2">
                                {links.map((link, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                        <span className="text-xs font-bold text-slate-500 uppercase bg-white px-2 py-1 rounded border border-slate-100">{link.type}</span>
                                        <a href={link.url} target="_blank" rel="noreferrer" className="flex-1 text-sm text-blue-600 hover:underline truncate font-medium">
                                            {link.label || link.url}
                                        </a>
                                        <button type="button" onClick={() => handleRemoveLink(index)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 pb-12">
                    <Link href="/project">
                        <button type="button" className="px-8 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 hover:shadow-sm transition-all flex items-center gap-2">
                            <X size={20} /> ยกเลิก
                        </button>
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-10 py-3.5 rounded-2xl bg-violet-600 text-white font-bold hover:bg-violet-700 shadow-xl shadow-violet-500/30 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                        {submitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                    </button>
                </div>
            </form>
          )}
        </div>

        {/* Success Modal */}
        <ModalSuccess
            open={showSuccessModal}
            href="/project"
            message="แก้ไขโปรเจกต์สำเร็จ!"
            description="ข้อมูลโปรเจกต์ได้รับการอัปเดตเรียบร้อยแล้ว"
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