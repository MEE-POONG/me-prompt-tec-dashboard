import React, { useState, useEffect } from "react";
import Layouts from "@/components/Layouts";
import { useRouter } from "next/router";
import Link from "next/link";

export default function AddOrEditAccount() {
  // State สำหรับเก็บข้อมูลฟอร์ม
  // ใช้ชื่อตัวแปร name ตาม Schema ของคุณ (แทน fullName)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const router = useRouter();
  const { id } = router.query;

  // 1. โหลดข้อมูลเดิมมาแสดง (กรณีแก้ไข)
  useEffect(() => {
    if (!router.isReady || !id) return;

    const fetchUser = async () => {
      try {
        setIsEditMode(true);
        // เรียก API GET /api/account/[id]
        const res = await fetch(`/api/account/${id}`);
        
        if (res.ok) {
          const data = await res.json();
          // นำข้อมูลจาก API มาใส่ในช่อง Input
          setName(data.name || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          setPosition(data.position || "");
          // Password เราจะไม่ดึงมาแสดงเพื่อความปลอดภัย
        } else {
          console.error("User not found");
          alert("ไม่พบข้อมูลผู้ใช้งาน หรือรหัส ID ไม่ถูกต้อง");
          router.push("/account");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    };

    fetchUser();
  }, [router.isReady, id, router]);

  // 2. ฟังก์ชันบันทึกข้อมูล (Create / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // เตรียมข้อมูลที่จะส่งไป API
    const payload = { 
      name, 
      email, 
      phone, 
      position,
      // ส่ง password ไปด้วยเฉพาะถ้ามีการกรอก (API จะจัดการต่อเอง)
      password: password || undefined 
    };

    try {
      let res;
      if (isEditMode) {
        // กรณีแก้ไข: ใช้ PUT ไปที่ /api/account/[id]
        res = await fetch(`/api/account/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // กรณีสร้างใหม่: ใช้ POST ไปที่ /api/account
        res = await fetch("/api/account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (res.ok) {
        alert(isEditMode ? "บันทึกการแก้ไขเรียบร้อย" : "สร้าง Account ใหม่เรียบร้อย");
        router.push("/account"); // เด้งกลับไปหน้าตาราง
      } else {
        // แสดง Error จาก API (เช่น อีเมลซ้ำ)
        alert(data.error || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layouts>
      <div className="p-6 md:p-8 w-full min-h-screen flex justify-center items-start">
        <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg border border-gray-100">
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">
            {isEditMode ? "แก้ไข Account" : "เพิ่ม Account ใหม่"}
          </h1>

          <form onSubmit={handleSubmit}>
            {/* ชื่อ-นามสกุล */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                ชื่อ-นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ระบุชื่อจริง นามสกุล"
                required
              />
            </div>

            {/* ตำแหน่ง */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                ตำแหน่ง
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="เช่น Developer, HR, Manager"
              />
            </div>

            {/* อีเมล */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="example@company.com"
                required
              />
            </div>

            {/* รหัสผ่าน */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                {isEditMode ? "รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)" : "รหัสผ่าน"} 
                {!isEditMode && <span className="text-red-500"> *</span>}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                required={!isEditMode} // บังคับกรอกเฉพาะตอนสร้างใหม่
                placeholder="********"
              />
            </div>

            {/* เบอร์โทร */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                เบอร์โทร
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="08x-xxx-xxxx"
              />
            </div>

            {/* ปุ่ม Action */}
            <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-100">
              <Link href="/account">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition font-medium"
                  disabled={isProcessing}
                >
                  ยกเลิก
                </button>
              </Link>
              
              <button
                type="submit"
                disabled={isProcessing}
                className={`px-6 py-2 text-white rounded-md font-medium shadow-sm flex items-center space-x-2
                  ${isEditMode ? "bg-amber-500 hover:bg-amber-600" : "bg-green-600 hover:bg-green-700"}
                  ${isProcessing ? "opacity-70 cursor-wait" : "hover:-translate-y-0.5 transition-transform"}
                `}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังบันทึก...
                  </>
                ) : (
                  isEditMode ? "บันทึกการแก้ไข" : "สร้าง Account"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layouts>
  );
}