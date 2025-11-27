import React, { useState, useEffect } from "react";
import Layouts from "@/components/Layouts";
import { useRouter } from "next/router";
import Link from "next/link";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";

export default function AddOrEditAccount() {
  const router = useRouter();
  const { id } = router.query;

  // --- ฟิลด์ของ User Model ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [role, setRole] = useState<"admin" | "staff" | "student" | "viewer">(
    "viewer"
  );
  const [isActive, setIsActive] = useState(true);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- โหลดข้อมูลเดิมกรณีแก้ไข ---
  useEffect(() => {
    if (!router.isReady || !id) return;

    const fetchUser = async () => {
      try {
        setIsEditMode(true);
        const res = await fetch(`/api/account/${id}`);
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          setPosition(data.position || "");
          setRole(data.role || "viewer");
          setIsActive(data.isActive ?? true);
        } else {
          console.error("User not found");
          router.push("/account");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/account");
      }
    };

    fetchUser();
  }, [router.isReady, id, router]);

  // --- ฟังก์ชันบันทึกข้อมูล ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const payload = {
      name,
      email,
      phone,
      position,
      role,
      isActive,
      password: password || undefined, // ส่งเฉพาะถ้าใส่
    };

    try {
      let res;
      if (isEditMode) {
        res = await fetch(`/api/account/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowSuccessModal(true);
      } else {
        const data = await res.json();
        console.error("Error:", data);
        alert(data.error || "เกิดข้อผิดพลาด");
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
      <div className="p-6 md:p-8 w-full min-h-screen flex justify-center items-start bg-gray-50">
        <div className="w-full max-w-5xl p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">
            {isEditMode ? "แก้ไข Account" : "เพิ่ม Account ใหม่"}
          </h1>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Col 1 */}
            <div className="flex flex-col space-y-4">
              {/* ชื่อ */}
              <div>
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

              {/* รหัสผ่าน */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  {isEditMode
                    ? "รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)"
                    : "รหัสผ่าน"}
                  {!isEditMode && <span className="text-red-500"> *</span>}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                  required={!isEditMode}
                  placeholder="********"
                />
              </div>
            </div>

            {/* Col 2 */}
            <div className="flex flex-col space-y-4">
              {/* อีเมล */}
              <div>
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

              {/* เบอร์โทร */}
              <div>
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
            </div>

            {/* Col 3 */}
            <div className="flex flex-col space-y-4">
              {/* ตำแหน่ง */}
              <div>
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

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  บทบาท
                </label>
                <select
                  value={role}
                  onChange={(e) =>
                    setRole(
                      e.target.value as "admin" | "staff" | "student" | "viewer"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="student">Student</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>

            {/* Row ปุ่ม span full */}
            <div className="col-span-3 flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              {/* Active อยู่ซ้าย */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-900">Active</label>
              </div>

              {/* ปุ่ม Cancel + Submit อยู่ขวา */}
              <div className="flex space-x-4">
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
                  className={`px-6 py-2 text-white rounded-md font-medium shadow-sm v
              ${
                isEditMode
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-green-600 hover:bg-green-700"
              }
              ${
                isProcessing
                  ? "opacity-70 cursor-wait"
                  : "hover:-translate-y-0.5 transition-transform"
              }
            `}
                >
                  {isProcessing
                    ? "กำลังบันทึก..."
                    : isEditMode
                    ? "บันทึกการแก้ไข"
                    : "สร้าง Account"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Success */}
        <ModalSuccess
          open={showSuccessModal}
          href="/account"
          message="เพิ่มบัญชีสำเร็จ!"
          description="คุณได้สร้างบัญชีผู้ใช้เรียบร้อยแล้ว"
          onClose={() => setShowSuccessModal(false)}
        />
      </div>
    </Layouts>
  );
}
