import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
import { Upload } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EditInternPage() {
  const router = useRouter();
  const { id } = router.query;

  // --- State สำหรับเก็บข้อมูล ---
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
  const [university, setUniversity] = useState(
    "มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน"
  );
  const [faculty, setFaculty] = useState("คณะบริหารธุรกิจ");
  const [major, setMajor] = useState("สารสนเทศทางคอมพิวเตอร์");
  const [studentId, setStudentId] = useState("");
  const [portfolioSlug, setPortfolioSlug] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- useEffect: ดึงข้อมูลจาก API ---
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
        setUniversity(intern.university || "มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน");
        setFaculty(intern.faculty || "คณะบริหารธุรกิจ");
        setMajor(intern.major || "สารสนเทศทางคอมพิวเตอร์");
        setStudentId(intern.studentId || "");
        setPosition(intern.coopType || "coop");
        setPortfolioSlug(intern.portfolioSlug || "");
        setImageUrl(intern.avatar || "");

        // ดึง social links จาก resume
        const links = intern.resume?.links || [];
        const fbLink = links.find((l: any) =>
          l.label.toLowerCase().includes("facebook")
        );
        const igLink = links.find((l: any) =>
          l.label.toLowerCase().includes("instagram")
        );
        const ghLink = links.find((l: any) =>
          l.label.toLowerCase().includes("github")
        );
        const pfLink = links.find((l: any) =>
          l.label.toLowerCase().includes("portfolio")
        );

        setFacebook(fbLink?.url || "");
        setInstagram(igLink?.url || "");
        setGithub(ghLink?.url || "");
        setPortfolio(pfLink?.url || "");
      } else {
        alert("ไม่พบข้อมูล Intern");
        router.push("/intern");
      }
    } catch (error) {
      console.error("Error fetching intern:", error);
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
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

    if (!firstName || !lastName || !portfolioSlug) {
      alert("กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, นามสกุล, Portfolio Slug)");
      return;
    }

    setIsSubmitting(true);

    try {
      // สร้าง links array
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
      };

      const response = await fetch(`/api/intern/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
      }

      alert("แก้ไขข้อมูลเรียบร้อย!");
      router.push("/intern");
    } catch (error) {
      console.error("Error updating intern:", error);
      alert(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการแก้ไขข้อมูล"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layouts>
        <div className="p-6 md:p-8 text-black w-full max-w-6xl mx-auto">
          <div className="text-center py-20">กำลังโหลดข้อมูล...</div>
        </div>
      </Layouts>
    );
  }

  return (
    <Layouts>
      <div className="p-6 md:p-8 text-black w-full max-w-6xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-bold mb-8 text-blue-700">
          แก้ไขข้อมูล (ID: {id})
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* --- ฝั่งซ้าย (รูป + Portfolio) --- */}
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  รูปภาพ
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
                <div
                  className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300
                             flex flex-col items-center justify-center
                             text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors
                             relative overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Preview"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <>
                      <Upload size={40} className="mb-2" />
                      <span className="font-semibold">คลิกเปลี่ยนรูปภาพ</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-400 text-center mt-2">
                  คลิกที่รูปเพื่อเปลี่ยนรูปใหม่
                </p>
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  Portfolio Slug *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={portfolioSlug}
                  onChange={(e) => setPortfolioSlug(e.target.value)}
                  required
                  placeholder="example-portfolio"
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  รหัสนักศึกษา
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
            </div>

            {/* --- ฝั่งขวา (ข้อมูลส่วนตัว) --- */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-2">
                    ชื่อ *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-2">
                    นามสกุล *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  ชื่อที่แสดง
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={`${firstName} ${lastName}`}
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  เบอร์โทร
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  ประเภท
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 appearance-none"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                >
                  <option value="coop">สหกิจศึกษา</option>
                  <option value="internship">ฝึกงาน</option>
                  <option value="part_time">Part-time</option>
                </select>
              </div>
            </div>
          </div>

          {/* --- ข้อมูลมหาวิทยาลัย --- */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              ข้อมูลการศึกษา
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  มหาวิทยาลัย
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  คณะ
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  สาขา
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* --- Social Links --- */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Social Link
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  GitHub
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>

          {/* === ปุ่มกด === */}
          <div className="flex justify-end pt-8 mt-8 border-t border-gray-200 gap-4">
            {/* ปุ่มยกเลิก กลับไปหน้า intern */}
            <Link
              href="/intern"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg transition-colors flex items-center"
            >
              ยกเลิก
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`font-bold py-3 px-8 rounded-lg transition-colors ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </form>
      </div>
    </Layouts>
  );
}
