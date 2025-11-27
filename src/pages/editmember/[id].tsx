import React, { useState, useRef } from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
import {
  Upload,
  User,
  Briefcase,
  MapPin,
  Linkedin,
  Github,
  Facebook,
  Instagram,
  Globe,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";

export default function EditMemberPage() {
  const router = useRouter();
  const { id } = router.query;

  // --- State สำหรับเก็บข้อมูลพนักงาน ---
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [bio, setBio] = useState("");

  // Social Media State
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // Image & UI State
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!id) return;

    const fetchMember = async () => {
      try {
        const res = await fetch(`/api/member/${id}`);
        if (!res.ok) throw new Error("Failed to load");

        const { data } = await res.json();

        // map ข้อมูลลง state
        setName(data.name.display ?? "");
        setTitle(data.title ?? "");
        setDepartment(data.department ?? "");
        setBio(data.bio ?? "");
        setImageUrl(data.photo ?? "");

        // socials
        setFacebook(data.socials?.facebook ?? "");
        setInstagram(data.socials?.instagram ?? "");
        setGithub(data.socials?.github ?? "");
        setLinkedin(data.socials?.linkedin ?? "");
        setPortfolio(data.socials?.website ?? "");
      } catch (err) {
        console.error(err);
      }
    };

    fetchMember();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: {
          first: name.split(" ")[0] ?? "",
          last: name.split(" ")[1] ?? "",
          display: name,
        },
        title,
        department,
        bio,
        photo: imageUrl,
        socials: {
          facebook,
          instagram,
          github,
          linkedin,
          website: portfolio,
        },
      };

      const res = await fetch(`/api/member/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      alert("อัปเดตไม่สำเร็จ");
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
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  รูปโปรไฟล์
                </label>
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
                      <Image
                        src={imageUrl}
                        alt="Preview"
                        fill
                        style={{ objectFit: "cover" }}
                      />
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
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Bio / คำแนะนำตัว
                </label>
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
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ชื่อ-นามสกุล *
                  </label>
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
                  <label className="block text-sm font-bold text-gray-700 mb-2 items-center gap-1">
                    <Briefcase size={16} /> ตำแหน่ง (Title)
                  </label>
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
                  <label className="block text-sm font-bold text-gray-700 mb-2 items-center gap-1">
                    <MapPin size={16} /> แผนก (Department)
                  </label>
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

              <hr className="border-gray-200 my-4" />

              {/* Social Media Links */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  ช่องทางการติดต่อ & Social Media
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Facebook size={18} />
                    </div>
                    <input
                      type="text"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Facebook URL"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Instagram size={18} />
                    </div>
                    <input
                      type="text"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Instagram URL"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Github size={18} />
                    </div>
                    <input
                      type="text"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="GitHub URL"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Linkedin size={18} />
                    </div>
                    <input
                      type="text"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="LinkedIn URL"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                    />
                  </div>

                  <div className="relative md:col-span-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Globe size={18} />
                    </div>
                    <input
                      type="text"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Website / Portfolio URL"
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value)}
                    />
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
                ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }
              `}
            >
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </form>
      </div>
      <ModalSuccess
        open={showSuccessModal}
        href="/teammember"
        message="แก้ไขข้อมูลพนักงานสำเร็จ"
        description="การแก้ไขข้อมูลพนักงานเสร็จสมบูรณ์แล้ว สามารถกลับไปที่หน้ารายชื่อพนักงานได้เลย"
        onClose={() => setShowSuccessModal(false)}
      />
    </Layouts>
  );
}
