import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
import { FolderGit2, ArrowLeft } from "lucide-react";

const mockProjects = [
  {
    id: "p1",
    title: "AI Workshop 2024",
    partner: "Computer Science RMUTI",
    description:
      "จัดอบรมเชิงปฏิบัติการด้าน AI และ Machine Learning ให้นักศึกษา CS RMUTI",
    imageUrl: "/image/AI.png",
    status: "เผยแพร่แล้ว",
  },
  {
    id: "p2",
    title: "Internship Program Project",
    partner: "Me Prompt TEC x Interns",
    description:
      "โครงการพัฒนาระบบจัดการข้อมูลภายใน (Internal Tool) ร่วมกับนักศึกษาฝึกงาน",
    imageUrl: "/image/Inter.png",
    status: "เผยแพร่แล้ว",
  },
  {
    id: "p3",
    title: "Smart Campus Hackathon",
    partner: "Multimedia Technology RMUTI",
    description:
      "เป็นกรรมการและ Mentor ในกิจกรรม Hackathon เพื่อพัฒนามหาวิทยาลัยอัจฉริยะ",
    imageUrl: "/image/smart.png",
    status: "ร่าง",
  },
];

export default function EditProjectPage() {
  const router = useRouter();
  const { projectId } = router.query;

  const [form, setForm] = useState({
    title: "",
    partner: "",
    description: "",
    imageUrl: "",
    status: "เผยแพร่แล้ว",
  });

  useEffect(() => {
    if (!projectId || projectId === "new") return;
    const found = mockProjects.find((p) => p.id === projectId);
    if (found) {
      setForm({
        title: found.title,
        partner: found.partner,
        description: found.description,
        imageUrl: found.imageUrl,
        status: found.status,
      });
    }
  }, [projectId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("submit project", { projectId, ...form });
    alert("บันทึกข้อมูลโปรเจกต์ (mock) เรียบร้อย");
    router.push("/projects");
  };

  const isNew = projectId === "new";

  return (
    <Layouts>
      <div className="w-full min-h-screen bg-gray-50 p-6 md:p-8 flex justify-center">
        <div className="w-full max-w-3xl">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4"
          >
            <ArrowLeft size={16} />
            ย้อนกลับ
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-200">
              <FolderGit2 size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                {isNew ? "เพิ่มโปรเจกต์ใหม่" : "แก้ไขโปรเจกต์"}
              </h1>
              <p className="text-gray-500 text-sm">
                จัดการข้อมูลโปรเจกต์ที่จะแสดงบนหน้าบ้าน
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-5"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                ชื่อโปรเจกต์ *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="เช่น AI Workshop 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                พันธมิตร / สาขาที่ร่วมทำ *
              </label>
              <input
                type="text"
                name="partner"
                value={form.partner}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="เช่น Computer Science RMUTI"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                สถานะการแสดงผล
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="เผยแพร่แล้ว">เผยแพร่แล้ว</option>
                <option value="ร่าง">ร่าง</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                URL รูปภาพโปรเจกต์
              </label>
              <input
                type="text"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="/image/AI.png หรือ URL จาก CDN"
              />
              <p className="text-xs text-gray-400 mt-1">
                ตอนนี้ใช้ path ในโฟลเดอร์ public/image ให้ตรงกับหน้าบ้าน
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                รายละเอียดโปรเจกต์
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                placeholder="อธิบายรายละเอียด / กิจกรรม / ผลลัพธ์ที่เกิดขึ้นจากโปรเจกต์นี้"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
              <button
                type="button"
                onClick={() => router.push("/projects")}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm"
              >
                {isNew ? "บันทึกโปรเจกต์ใหม่" : "บันทึกการแก้ไข"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layouts>
  );
}
