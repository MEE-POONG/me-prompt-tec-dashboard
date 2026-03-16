import React, { useState, useEffect } from "react";
import Layouts from "@/components/Layouts";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Phone,
  Briefcase,
  Shield,
  CheckCircle2,
  Save,
  X,
  ArrowLeft,
  Loader2,
  UserPlus,
  UserCog,
} from "lucide-react";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";
import ModalError from "@/components/ui/Modals/ModalError";

export default function AddOrEditAccount() {
  const router = useRouter();
  const { id } = router.query;

  // --- State ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [role, setRole] = useState<"admin" | "staff" | "student" | "viewer">(
    "viewer"
  );
  const [isActive, setIsActive] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showVerifyEmailSuccess, setShowVerifyEmailSuccess] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingVerifyEmail, setSendingVerifyEmail] = useState(false);

  // --- Load Data (Edit Mode) ---
  useEffect(() => {
    if (!router.isReady) return;

    if (id) {
      // Edit Mode
      setIsEditMode(true);
      setLoadingData(true);
      fetch(`/api/account/${id}`)
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setName(data.name || "");
            setEmail(data.email || "");
            setPhone(data.phone || "");
            setPosition(data.position || "");
            setRole(data.role || "viewer");
            setIsActive(data.isActive ?? false);
            setEmailVerified(data.isVerified ?? false);
          } else {
            console.error("User not found");
            router.push("/account");
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoadingData(false));
    }
  }, [router.isReady, id, router]);

  const handleSendVerification = async () => {
    if (!email) return;

    try {
      setSendingVerifyEmail(true);
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ส่งอีเมลไม่สำเร็จ");

      setShowVerifyEmailSuccess(true); // ← ใช้ modal ใหม่
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setShowErrorModal(true);
    } finally {
      setSendingVerifyEmail(false);
    }
  };

  // --- Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem("token"); // 👈 ดึง token

    // ตรวจสอบว่ามี token หรือไม่
    if (!token) {
      setErrorMessage("กรุณาเข้าสู่ระบบก่อนทำรายการ");
      setShowErrorModal(true);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name,
      email,
      phone,
      position,
      role,
      isActive,
      password: password || undefined,
    };

    try {
      let res;

      if (isEditMode) {
        res = await fetch(`/api/account/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // 👈 ส่ง token
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // 👈 ส่ง token
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowSuccessModal(true);
      } else {
        // ตรวจสอบว่า Response เป็น JSON หรือไม่
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          throw new Error(data.error || "เกิดข้อผิดพลาด");
        } else {
          // ถ้าไม่ใช่ JSON ให้อ่านเป็น Text
          const text = await res.text();
          throw new Error(`Server Error: ${res.status} - ${text.substring(0, 100)}`);
        }
      }
    } catch (error) {
      console.error("Error saving:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "เชื่อมต่อ Server ไม่ได้"
      );
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
    console.log("Authorization:", `Bearer ${token}`);
  };

  if (loadingData) {
    return (
      <Layouts>
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-slate-400 font-medium">
              กำลังโหลดข้อมูลบัญชี...
            </p>
          </div>
        </div>
      </Layouts>
    );
  }

  return (
    <Layouts>
      <div className="min-h-screen bg-[#f8fafc] py-8 px-4 relative overflow-hidden font-sans text-slate-800">
        {/* --- 🌟 Background Aurora (Theme ฟ้า/คราม) --- */}
        <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px] mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-cyan-200/30 rounded-full blur-[120px] mix-blend-multiply"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/account"
              className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-4 transition-colors text-sm font-bold bg-white/50 px-3 py-1.5 rounded-lg border border-white/50 backdrop-blur-sm shadow-sm"
            >
              <ArrowLeft size={16} className="mr-1" /> ย้อนกลับ
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                {isEditMode ? (
                  <UserCog size={32} strokeWidth={1.5} />
                ) : (
                  <UserPlus size={32} strokeWidth={1.5} />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800">
                  {isEditMode ? "แก้ไขบัญชีผู้ใช้" : "เพิ่มบัญชีผู้ใช้ใหม่"}
                </h1>
                <p className="text-slate-500 font-medium">
                  {isEditMode
                    ? `แก้ไขข้อมูลสำหรับ: ${email}`
                    : "สร้างบัญชีสำหรับผู้ดูแลระบบหรือพนักงาน"}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* === Card: ข้อมูลบัญชี === */}
            <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-xl border border-white/60 overflow-hidden p-8 md:p-10">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <User size={20} className="text-blue-500" /> ข้อมูลส่วนตัว &
                การเข้าสู่ระบบ
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ชื่อ */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="สมชาย ใจดี"
                    />
                  </div>
                </div>

                {/* เบอร์โทร */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    เบอร์โทร
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08x-xxx-xxxx"
                    />
                  </div>
                </div>

                {/* อีเมล */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    อีเมล (ใช้สำหรับ Login){" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium disabled:bg-slate-100"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="admin@example.com"
                      />
                    </div>

                    {isEditMode && (
                      <button
                        type="button"
                        className="px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
                        disabled={!email || sendingVerifyEmail}
                        onClick={handleSendVerification}
                      >
                        {sendingVerifyEmail ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Mail size={16} />
                        )}
                        ส่งยืนยัน
                      </button>
                    )}
                  </div>

                  <p className="text-xs mt-2">
                    {emailVerified ? (
                      <span className="text-green-600">
                        ✔ อีเมลนี้ยืนยันแล้ว
                      </span>
                    ) : (
                      <span className="text-amber-600">
                        ✖ ยังไม่ได้ยืนยันอีเมล
                      </span>
                    )}
                  </p>
                </div>

                {/* รหัสผ่าน */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {isEditMode
                      ? "รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)"
                      : "รหัสผ่าน *"}
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={!isEditMode}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="my-8 border-t border-slate-100"></div>

              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Shield size={20} className="text-blue-500" /> สิทธิ์การใช้งาน &
                สถานะ
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ตำแหน่ง */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    ตำแหน่ง (Position)
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Briefcase size={18} />
                    </div>
                    <select
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium appearance-none cursor-pointer"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                    >
                      <option value="" disabled>เลือกตำแหน่ง</option>
                      <option value="Developer">Developer (นักพัฒนา)</option>
                      <option value="HR">HR (ฝ่ายบุคคล)</option>
                      <option value="Manager">Manager (ผู้จัดการ)</option>
                    </select>
                  </div>
                </div>

                {/* บทบาท */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    บทบาท (Role)
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Shield size={18} />
                    </div>
                    <select
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white font-medium appearance-none cursor-pointer"
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                    >
                      <option value="admin">Admin (ดูแลระบบ)</option>
                      <option value="staff">Staff (พนักงาน)</option>
                      <option value="student">Student (นักศึกษา)</option>
                      <option value="viewer">Viewer (ดูได้อย่างเดียว)</option>
                    </select>
                  </div>
                </div>

                {/* Active Status */}
                <div className="md:col-span-2">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${isActive
                      ? "border-green-500 bg-green-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isActive
                        ? "bg-green-500 border-green-500"
                        : "border-slate-300 bg-white"
                        }`}
                    >
                      {isActive && (
                        <CheckCircle2 size={16} className="text-white" />
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <div>
                      <span
                        className={`block text-sm font-bold ${isActive ? "text-green-700" : "text-slate-700"
                          }`}
                      >
                        เปิดใช้งานบัญชี (Active)
                      </span>
                      <span className="text-xs text-slate-500">
                        หากปิดใช้งาน ผู้ใช้นี้จะไม่สามารถเข้าสู่ระบบได้
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 pb-12">
              <Link href="/account">
                <button
                  type="button"
                  className="px-8 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 hover:shadow-sm transition-all flex items-center gap-2"
                >
                  <X size={20} /> ยกเลิก
                </button>
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-10 py-3.5 rounded-2xl text-white font-bold shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed
                        ${isEditMode
                    ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
                  }
                    `}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                {isSubmitting
                  ? "กำลังบันทึก..."
                  : isEditMode
                    ? "บันทึกการแก้ไข"
                    : "สร้างบัญชี"}
              </button>
            </div>
          </form>
        </div>

        <ModalSuccess
          open={showVerifyEmailSuccess}
          message="ส่งอีเมลยืนยันแล้ว!"
          description="กรุณาตรวจสอบกล่องอีเมลของคุณเพื่อยืนยันตัวตน"
          onClose={() => setShowVerifyEmailSuccess(false)}
        />

        {/* Modal Success */}
        <ModalSuccess
          open={showSuccessModal}
          href="/account"
          message={isEditMode ? "แก้ไขข้อมูลสำเร็จ!" : "สร้างบัญชีสำเร็จ!"}
          description={
            isEditMode
              ? "อัปเดตข้อมูลบัญชีผู้ใช้เรียบร้อยแล้ว"
              : "คุณได้เพิ่มบัญชีผู้ใช้ใหม่เรียบร้อยแล้ว"
          }
          onClose={() => setShowSuccessModal(false)}
        />

        {/* Modal Error */}
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
