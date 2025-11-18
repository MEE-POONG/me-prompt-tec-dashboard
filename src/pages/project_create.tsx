import React, { useState, useRef } from "react";
import Layouts from "@/components/Layouts";
import Link from "next/link";
import Image from "next/image";
import { Upload, X, Plus, Link as LinkIcon, Type, FileText } from "lucide-react";

// import ข้อมูล projects เพื่อจำลองการบันทึก
import { projects } from "@/Data/Project_data"; 

export default function AddProjectPage() {
  // --- State ข้อมูล ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectLink, setProjectLink] = useState("");
  
  // --- State สำหรับ Tags ---
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

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

  // --- ฟังก์ชันจัดการ Tags ---
  const handleAddTag = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (currentTag.trim() !== "" && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // --- ฟังก์ชัน Submit ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject = {
      id: projects.length + 1, 
      name,
      description,
      projectLink,
      tags,
      imageSrc: imageUrl || "", 
    };

    console.log("Project Data to Save:", newProject);
    alert("บันทึกข้อมูลจำลองเรียบร้อย (ดูใน Console)");
    
    setName("");
    setDescription("");
    setTags([]);
    setImageUrl("");
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

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* --- Column 1: ข้อมูล (กว้าง 2 ส่วน) --- */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* ชื่อโปรเจกต์ */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                    <Type size={18} className="text-blue-600"/> ชื่อโปรเจกต์
                  </label>
                  <input 
                    type="text" 
                    // 🔴 เพิ่ม text-black ตรงนี้
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-black placeholder-gray-400"
                    placeholder="เช่น AI Chatbot, E-Commerce Website"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Tags Input */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-md">#</span> Tags
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="text" 
                      // 🔴 เพิ่ม text-black ตรงนี้
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white text-black placeholder-gray-400"
                      placeholder="เพิ่ม Tag (พิมพ์แล้วกดปุ่ม + หรือ Enter)"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button 
                      type="button"
                      onClick={handleAddTag}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                  {/* แสดง Tags */}
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

                {/* รายละเอียด */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600"/> รายละเอียด
                  </label>
                  <textarea 
                    rows={5}
                    // 🔴 เพิ่ม text-black ตรงนี้
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white resize-none text-black placeholder-gray-400"
                    placeholder="อธิบายเกี่ยวกับโปรเจกต์นี้..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* ลิงก์ */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                     <LinkIcon size={18} className="text-blue-600"/> ลิงก์โปรเจกต์ (ถ้ามี)
                  </label>
                  <input 
                    type="url" 
                    // 🔴 เพิ่ม text-black ตรงนี้
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-black placeholder-gray-400"
                    placeholder="https://..."
                    value={projectLink}
                    onChange={(e) => setProjectLink(e.target.value)}
                  />
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
                className="px-6 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-all border border-gray-300 bg-white flex items-center justify-center"
              >
                ยกเลิก
              </Link>

              {/* ปุ่มบันทึก */}
              <button 
                type="submit"
                className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 hover:shadow-lg transition-all transform active:scale-95"
              >
                บันทึกโปรเจกต์
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layouts>
  );
}