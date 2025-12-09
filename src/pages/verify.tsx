"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    // เรียก API verify จริง
    fetch(`/api/verify?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStatus("success");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {status === "loading" && <p className="text-gray-500 text-lg">กำลังตรวจสอบลิงก์...</p>}

      {status === "success" && (
        <div className="bg-white shadow-md rounded-xl p-10 max-w-md text-center">
          <h1 className="text-2xl font-bold text-green-600 mb-4">ยืนยันตัวตนสำเร็จ!</h1>
          <p className="text-gray-700 mb-6">
            ขอบคุณที่ยืนยันอีเมลของคุณ คุณสามารถเข้าสู่ระบบได้ทันที
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="bg-white shadow-md rounded-xl p-10 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">ลิงก์ไม่ถูกต้องหรือหมดอายุ</h1>
          <p className="text-gray-700 mb-6">กรุณาลองส่งอีเมลยืนยันใหม่อีกครั้ง</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      )}
    </div>
  );
}
