import React, { useState, useRef } from "react";
import Layouts from "@/components/Layouts";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Upload, X, Plus, Link as LinkIcon, Type, FileText, Loader2 } from "lucide-react";

export default function ProjectCreate() {
  const router = useRouter();

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
  const [links, setLinks] = useState<{ type: string; url: string; label?: string }[]>([]);
  const [linkType, setLinkType] = useState("website");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");

  // --- State รูปภาพ ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State สำหรับ Loading & Error ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- ฟังก์ชันจัดการรูปภาพ ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // แปลงรูปเป็น base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Auto-generate slug from title ---
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

  // --- ฟังก์ชันจัดการ Tags ---
  const handleAddTag = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (currentTag.trim() !== "" && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // --- ฟังก์ชันจัดการ Tech Stack ---
  const handleAddTech = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (currentTech.trim() !== "" && !techStack.includes(currentTech.trim())) {
      setTechStack([...techStack, currentTech.trim()]);
      setCurrentTech("");
    }
  };

  const handleRemoveTech = (techToRemove: string) => {
    setTechStack(techStack.filter((tech) => tech !== techToRemove));
  };

  // --- ฟังก์ชันจัดการ Links ---
  const handleAddLink = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (linkUrl.trim() !== "") {
      setLinks([...links, { type: linkType, url: linkUrl.trim(), label: linkLabel.trim() || undefined }]);
      setLinkUrl("");
      setLinkLabel("");
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleTechKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTech();
    }
  };

  // --- ฟังก์ชัน Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const projectData = {
        title,
        slug,
        summary,
        description,
        status,
        clientName: clientName || undefined,
        clientSector: clientSector || undefined,
        tags,
        techStack,
        cover: imageUrl || undefined,
        links: links.length > 0 ? links : undefined,
        featured,
      };

      const response = await fetch("/api/project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      const result = await response.json();
      console.log("Project created successfully:", result);

      // Redirect to project list page
      router.push("/project");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error creating project:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layouts>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800">เพิ่มโปรเจกต์ใหม่</h1>
            <p className="text-gray-500 mt-1">กรอกรายละเอียดผลงานเพื่อนำไปแสดงใน Portfolio</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              <p className="font-semibold">เกิดข้อผิดพลาด:</p>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* --- Column 1: ข้อมูล (กว้าง 2 ส่วน) --- */}
              <div className="lg:col-span-2 space-y-6">

                {/* ชื่อโปรเจกต์ */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Type size={18} className="text-blue-600"/> <span>ชื่อโปรเจกต์ *</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-black placeholder-gray-400"
                    placeholder="เช่น AI Chatbot, E-Commerce Website"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Type size={18} className="text-blue-600"/> <span>Slug (URL-friendly) *</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-black placeholder-gray-400"
                    placeholder="ai-chatbot-project"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                </div>

                {/* Summary */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600"/> สรุปสั้นๆ
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white resize-none text-black placeholder-gray-400"
                    placeholder="สรุปโปรเจกต์แบบสั้นๆ 1-2 ประโยค..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </div>

                {/* รายละเอียด */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600"/> รายละเอียดเต็ม
                  </label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white resize-none text-black placeholder-gray-400"
                    placeholder="อธิบายรายละเอียดเกี่ยวกับโปรเจกต์นี้..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Client Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">ชื่อลูกค้า</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-black placeholder-gray-400"
                      placeholder="บริษัท ABC จำกัด"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">ประเภทธุรกิจ</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-black placeholder-gray-400"
                      placeholder="E-Commerce, Education, etc."
                      value={clientSector}
                      onChange={(e) => setClientSector(e.target.value)}
                    />
                  </div>
                </div>

                {/* Status & Featured */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">สถานะ</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-black"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="in_progress">กำลังดำเนินการ</option>
                      <option value="completed">เสร็จสมบูรณ์</option>
                      <option value="archived">เก็บถาวร</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                      />
                      <span className="text-sm font-semibold text-gray-700">โปรเจกต์แนะนำ (Featured)</span>
                    </label>
                  </div>
                </div>

                {/* Tags Input */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-md">#</span> Tags
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white text-black placeholder-gray-400"
                      placeholder="เพิ่ม Tag (พิมพ์แล้วกดปุ่ม + หรือ Enter)"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm flex items-center gap-2 border border-gray-200">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                    {tags.length === 0 && <span className="text-sm text-gray-400 italic">ยังไม่มี Tags</span>}
                  </div>
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-md">⚙️</span> Tech Stack
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white text-black placeholder-gray-400"
                      placeholder="เช่น React, Node.js, MongoDB"
                      value={currentTech}
                      onChange={(e) => setCurrentTech(e.target.value)}
                      onKeyDown={handleTechKeyDown}
                    />
                    <button
                      type="button"
                      onClick={handleAddTech}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-xl transition-colors"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {techStack.map((tech, index) => (
                      <span key={index} className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm flex items-center gap-2 border border-green-200">
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(tech)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                    {techStack.length === 0 && <span className="text-sm text-gray-400 italic">ยังไม่มี Tech Stack</span>}
                  </div>
                </div>

                {/* Links */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                     <LinkIcon size={18} className="text-blue-600"/> ลิงก์โปรเจกต์
                  </label>
                  <div className="space-y-2 mb-3">
                    <div className="flex gap-2">
                      <select
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white text-black"
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
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white text-black placeholder-gray-400"
                        placeholder="https://..."
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                      />
                      <input
                        type="text"
                        className="w-32 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white text-black placeholder-gray-400"
                        placeholder="Label"
                        value={linkLabel}
                        onChange={(e) => setLinkLabel(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleAddLink}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors"
                      >
                        <Plus size={24} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {links.map((link, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <span className="text-xs font-semibold text-gray-500 uppercase">{link.type}</span>
                        <a href={link.url} target="_blank" rel="noreferrer" className="flex-1 text-sm text-blue-600 hover:underline truncate">
                          {link.label || link.url}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {links.length === 0 && <span className="text-sm text-gray-400 italic">ยังไม่มีลิงก์</span>}
                  </div>
                </div>

              </div>

              {/* --- Column 2: รูปภาพ --- */}
              <div className="lg:col-span-1">
                 <label className="block text-sm font-semibold text-gray-700 mb-2">รูปภาพปก</label>
                 
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    className="hidden" 
                    accept="image/*"
                 />

                 <div 
                    className="aspect-square w-full border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative group"
                    onClick={() => fileInputRef.current?.click()}
                 >
                    {imageUrl ? (
                      <>
                        <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-medium flex items-center gap-2">
                             <Upload size={20} /> เปลี่ยนรูป
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 text-gray-400 group-hover:text-blue-500 transition-colors">
                        <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-3">
                           <Upload size={32} />
                        </div>
                        <p className="text-sm font-medium">คลิกเพื่ออัปโหลดรูปภาพ</p>
                        <p className="text-xs mt-1">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>

            {/* --- Action Buttons --- */}
            <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              {/* ปุ่มยกเลิก */}
              <Link
                href="/project"
                className={`px-6 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-all border border-gray-300 bg-white flex items-center justify-center ${loading ? 'pointer-events-none opacity-50' : ''}`}
              >
                ยกเลิก
              </Link>

              {/* ปุ่มบันทึก */}
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'กำลังบันทึก...' : 'บันทึกโปรเจกต์'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layouts>
  );
}