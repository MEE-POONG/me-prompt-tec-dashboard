import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
import Link from "next/link";
import Image from "next/image";
import {
  Upload,
  Building2,
  Globe,
  Briefcase,
  Save,
  X,
  ArrowLeft,
} from "lucide-react";

export default function EditPartnerPage() {
  const router = useRouter();
  const { id } = router.query; // รับ ID จาก URL

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // โหลดข้อมูลจาก API
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const loadPartner = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/partners/${id}`);
        const json = await res.json();

        const p = json.data;
        setName(p.name || "");
        setType(p.type || "");
        setWebsite(p.website || "");
        setDescription(p.description || "");
        setStatus((p.status as "active" | "inactive") || "active");
        setImageUrl(p.logo || "");
      } catch (err) {
        console.error("Load partner error", err);
        alert("โหลดข้อมูลพันธมิตรไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    loadPartner();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || typeof id !== "string") return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/partners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          website,
          logo: imageUrl,
          description,
          status,
        }),
      });

      if (!res.ok) {
        console.error(await res.text());
        alert("บันทึกการแก้ไขไม่สำเร็จ");
        return;
      }

      alert("บันทึกการแก้ไขเรียบร้อย!");
      router.push("/manage_partners");
    } catch (err) {
      console.error("Update partner error", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layouts>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link
              href="/manage_partners"
              className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors"
            >
              <ArrowLeft size={18} className="mr-1" /> ย้อนกลับ
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 size={32} className="text-blue-600" /> แก้ไขข้อมูลพันธมิตร
            </h1>
            <p className="text-gray-500 mt-1 ml-11">
              แก้ไขรายละเอียดสถาบันหรือองค์กร ID: {id}
            </p>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center text-gray-400">
              กำลังโหลดข้อมูล...
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Logo */}
                <div className="md:col-span-1 flex flex-col items-center">
                  <label className="block text-sm font-bold text-gray-700 mb-3 self-start">
                    โลโก้สถาบัน/องค์กร
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />

                  <div
                    className="w-48 h-48 rounded-full border-4 border-blue-50 shadow-lg bg-white flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-blue-100 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imageUrl ? (
                      <>
                        <Image
                          src={imageUrl}
                          alt="Logo Preview"
                          fill
                          className="object-contain p-2"
                        />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                          <Upload size={24} className="mb-1" />
                          <span className="text-xs font-medium">เปลี่ยนรูป</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-400 p-4">
                        <Upload
                          size={32}
                          className="mx-auto mb-2 opacity-50"
                        />
                        <span className="text-xs">อัปโหลดโลโก้</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-4 text-center">
                    แนะนำไฟล์ PNG พื้นหลังใส <br /> ขนาด 400x400 px
                  </p>
                </div>

                {/* Form fields */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ชื่อสถาบัน / องค์กร{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Building2 size={18} />
                      </div>
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-900"
                        placeholder="ระบุชื่อสถาบัน (เช่น มหาวิทยาลัย...)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ประเภท <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Briefcase size={18} />
                      </div>
                      <select
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-900 appearance-none"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        required
                      >
                        <option value="">-- เลือกประเภท --</option>
                        <option value="สถาบันการศึกษา">สถาบันการศึกษา</option>
                        <option value="หน่วยงานรัฐ">หน่วยงานรัฐ</option>
                        <option value="บริษัทเอกชน">บริษัทเอกชน</option>
                        <option value="องค์กรไม่แสวงหากำไร">
                          องค์กรไม่แสวงหากำไร
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      เว็บไซต์ (Website URL)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Globe size={18} />
                      </div>
                      <input
                        type="url"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-900"
                        placeholder="https://..."
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      รายละเอียดโดยย่อ
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-4 text-gray-400">
                        <Briefcase size={18} />
                      </div>
                      <textarea
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 focus:bg-white resize-none text-gray-900 placeholder:text-gray-500"
                        placeholder="คำอธิบายเกี่ยวกับหน่วยงาน หรือความร่วมมือ..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <Link
                  href="/manage_partners"
                  className="px-6 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-white hover:shadow-sm hover:text-gray-800 transition-all border border-transparent hover:border-gray-200 flex items-center gap-2"
                >
                  <X size={18} /> ยกเลิก
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  <Save size={18} />{" "}
                  {submitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layouts>
  );
}
