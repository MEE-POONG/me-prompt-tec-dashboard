// login/index.tsx
import { GradientBackground } from "@/components/animate-ui/components/backgrounds/gradient";
import React, { useState } from "react";
import { useRouter } from "next/router"; // สำหรับเปลี่ยนหน้าเมื่อ login ผ่าน

// Icon สำหรับ Modal (ใช้ Heroicons หรือ Lucide)
const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-16 h-16 text-green-500 mx-auto mb-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default function Login() {
  const router = useRouter();

  // State สำหรับ Input
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // State สำหรับ UI
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // สำคัญ!
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.status === 200) {
        // เก็บ token และ user data ใน localStorage
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        localStorage.setItem("user", JSON.stringify(data.user));

        // --- กรณีสำเร็จ ---
        setShowSuccessModal(true);

        // หน่วงเวลาปิด Modal แล้วเปลี่ยนหน้า (Optional)
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        // --- กรณีเกิด Error (404 หรือ 401) ---
        setError(data.message || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center text-white">
      <GradientBackground className="absolute inset-0" />
      <div className="flex-1 h-full absolute inset-0 py-40 px-4 sm:px-6 max-sm:py-50 lg:px-8">
        <div className="relative z-10 max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg backdrop-blur-md flex flex-col items-center text-center text-gray-900">
          <h2 className="text-3xl font-bold bg-linear-to-r from-blue-600 via-violet-700 to-red-400 bg-clip-text text-transparent">
            เข้าสู่ระบบ
          </h2>

          {/* แสดง Error Message ถ้ามี */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded w-full text-sm">
              {error}
            </div>
          )}

          <form className="w-full space-y-8 mt-5" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="username"
                className="block text-left mb-2 font-bold"
              >
                username
              </label>
              <input
                type="text" // เปลี่ยนเป็น text
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-700"
                placeholder="กรอก username (email) ของคุณ"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-left mb-2 font-bold"
              >
                password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-700"
                placeholder="กรอกรหัสผ่านของคุณ"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">จดจำฉัน</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:scale-105 duration-300 hover:bg-purple-700 font-bold transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        </div>
      </div>

      {/* --- Success Modal Dialog --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
            <CheckCircleIcon />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">สำเร็จ!</h3>
            <p className="text-gray-600 text-lg mb-5">
              เข้าสู่ระบบเรียบร้อยแล้ว
            </p>
            <button
              onClick={() => setShowSuccessModal(false)} // หรือสั่ง redirect
              className="mt-6 px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-all duration-300 hover:scale-105"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
