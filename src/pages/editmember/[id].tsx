import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
import { Upload, User, Briefcase, MapPin, Linkedin, Github, Facebook, Instagram, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Import ข้อมูลจำลอง (ถ้ายังไม่มี API ให้ใช้ตัวนี้เทสก่อน)
// import { mockMembers } from "@/pages/teammember"; 

export default function EditMemberPage() {
  const router = useRouter();
  const { id } = router.query;

  // --- State สำหรับเก็บข้อมูลพนักงาน ---
  const [name, setName] = useState(""); // ชื่อ-นามสกุล
  const [title, setTitle] = useState(""); // ตำแหน่ง (เช่น Senior Developer)
  const [department, setDepartment] = useState(""); // แผนก (เช่น Development)
  const [bio, setBio] = useState(""); // คำแนะนำตัวสั้นๆ
  
  // Social Media
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // Image State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- useEffect: ดึงข้อมูลเก่ามาโชว์ ---
  useEffect(() => {
    if (id && typeof id === 'string') {
      // ✅ 1. ถ้ามี API ให้ใช้ fetch แบบนี้:
      fetchMemberData(id);

      // ⚠️ 2. ถ้ายังไม่มี API ให้ใช้ Mock Data แบบนี้แทน (เปิด comment เพื่อเทส):
      /*
      const found = mockMembers.find(m => m.id === id);
      if (found) {
         setName(found.name);
         setTitle(found.title);
         setDepartment(found.department);
         setImageUrl(found.imageSrc);
         setFacebook(found.facebook || "");
         setGithub(found.github || "");
         setLinkedin(found.linkedin || "");
         setIsLoading(false);
      }
      */
    }
  }, [id]);

  const fetchMemberData = async (memberId: string) => {
    setIsLoading(true);
    try {
      // สมมติว่ามี API /api/member/[id]
      const response = await fetch(`/api/member/${memberId}`);
      const result = await response.json();

      if (response.ok) {
        const member = result.data;
        // Map ข้อมูลจาก API เข้า State
        setName(member.name || "");
        setTitle(member.title || "");
        setDepartment(member.department || "");
        setBio(member.bio || "");
        setImageUrl(member.imageSrc || "");
        
        // Socials
        setFacebook(member.facebook || "");
        setInstagram(member.instagram || "");
        setGithub(member.github || "");
        setLinkedin(member.linkedin || "");
        setPortfolio(member.portfolio || "");
        setEmail(member.email || "");
        setPhone(member.phone || "");
      } else {
        // ถ้าไม่เจอ API ให้ปล่อยผ่านไปก่อน (เพื่อไม่ให้หน้าขาวตอนเทส UI)
        console.warn("API fetch failed, waiting for implementation.");
      }
    } catch (error) {
      console.error('Error fetching member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // แปลงไฟล์เป็น Base64
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
      setImageFile(file);
      const base64 = await convertToBase64(file);
      setImageUrl(base64);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData = {
        name,
        title,
        department,
        bio,
        contact: { email, phone },
        socials: { facebook, instagram, github, linkedin, portfolio },
        image: imageFile // ส่งไฟล์ไปจัดการที่ API
      };

      console.log("Submitting Data:", updateData);

      // --- ส่วนส่ง API (เปิดใช้เมื่อ Backend พร้อม) ---
      /*
      const response = await fetch(`/api/member/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Failed to update");
      */

      // จำลองว่าสำเร็จ
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("บันทึกข้อมูลพนักงานเรียบร้อย!");
      router.push("/teammember");

    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layouts>
      <div className="p-6 md:p-8 text-black w-full max-w-6xl mx-auto">

        <h1 className="text-2xl lg:text-3xl font-bold mb-8 text-blue-700 flex items-center gap-2">
          <User size={32} /> แก้ไขข้อมูลพนักงาน
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

            {/* --- คอลัมน์ซ้าย: รูปโปรไฟล์ --- */}
            <div className="space-y-6 md:col-span-1">
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">รูปโปรไฟล์</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
                <div
                  className="aspect-square bg-gray-100 rounded-full border-4 border-white shadow-lg
                             flex flex-col items-center justify-center overflow-hidden relative cursor-pointer
                             hover:brightness-90 transition-all group mx-auto w-64 h-64"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imageUrl ? (
                    <>
                       <Image src={imageUrl} alt="Preview" fill style={{ objectFit: "cover" }} />
                       <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="text-white" size={32} />
                       </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <User size={64} className="mb-2" />
                      <span className="text-sm font-semibold">อัปโหลดรูป</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio สั้นๆ */}
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Bio / คำแนะนำตัว</label>
                 <textarea 
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="เขียนแนะนำตัวสั้นๆ..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                 />
              </div>
            </div>

            {/* --- คอลัมน์ขวา: ข้อมูล & Social --- */}
            <div className="space-y-6 md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              
              {/* ข้อมูลหลัก */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อ-นามสกุล *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="สมชาย ใจดี"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 items-center gap-1"><Briefcase size={16}/> ตำแหน่ง (Title)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Senior Developer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 items-center gap-1"><MapPin size={16}/> แผนก (Department)</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  >
                    <option value="">-- เลือกแผนก --</option>
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Management">Management</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">Human Resources</option>
                  </select>
                </div>
              </div>

              <hr className="border-gray-200 my-4"/>

              {/* Social Media Links */}
              <div>
                 <h3 className="text-lg font-bold text-gray-800 mb-4">ช่องทางการติดต่อ & Social Media</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Facebook size={18}/></div>
                       <input type="text" className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Facebook URL" value={facebook} onChange={e => setFacebook(e.target.value)} />
                    </div>

                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Instagram size={18}/></div>
                       <input type="text" className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Instagram URL" value={instagram} onChange={e => setInstagram(e.target.value)} />
                    </div>

                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Github size={18}/></div>
                       <input type="text" className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="GitHub URL" value={github} onChange={e => setGithub(e.target.value)} />
                    </div>

                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Linkedin size={18}/></div>
                       <input type="text" className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="LinkedIn URL" value={linkedin} onChange={e => setLinkedin(e.target.value)} />
                    </div>

                    <div className="relative md:col-span-2">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Globe size={18}/></div>
                       <input type="text" className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Website / Portfolio URL" value={portfolio} onChange={e => setPortfolio(e.target.value)} />
                    </div>

                 </div>
              </div>

            </div>
          </div>

          {/* === ปุ่มกด === */}
          <div className="flex justify-end pt-8 mt-8 border-t border-gray-200 gap-4">
            <Link 
              href="/teammember" 
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg transition-colors flex items-center"
            >
              ยกเลิก
            </Link>

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`font-bold py-3 px-8 rounded-lg transition-colors text-white shadow-md
                ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              `}
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
          </div>

        </form>
      </div>
    </Layouts>
  );
}