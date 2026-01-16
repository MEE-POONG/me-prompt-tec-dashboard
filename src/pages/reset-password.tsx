import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { Lock, CheckCircle2, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";
import ModalError from "@/components/ui/Modals/ModalError";

export default function ResetPasswordPage() {
    const router = useRouter();
    const { token } = router.query;

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [successModal, setSuccessModal] = useState({
        open: false,
        message: "",
        description: "",
    });
    const [errorModal, setErrorModal] = useState({
        open: false,
        message: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (newPassword.length < 6) {
            setErrorModal({
                open: true,
                message: "รหัสผ่านสั้นเกินไป",
                description: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorModal({
                open: true,
                message: "รหัสผ่านไม่ตรงกัน",
                description: "กรุณาตรวจสอบรหัสผ่านและยืนยันรหัสผ่านอีกครั้ง",
            });
            return;
        }

        try {
            setIsSubmitting(true);

            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    newPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "เกิดข้อผิดพลาด");
            }

            setSuccessModal({
                open: true,
                message: "รีเซ็ตรหัสผ่านสำเร็จ!",
                description: "คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว",
            });

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (error: any) {
            console.error("Reset password error:", error);
            setErrorModal({
                open: true,
                message: "เกิดข้อผิดพลาด",
                description: error.message || "ไม่สามารถรีเซ็ตรหัสผ่านได้",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 flex items-center justify-center px-4 relative overflow-hidden">
                {/* Animated Gradient Blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

                <div className="text-center relative z-10">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">
                        ลิงก์ไม่ถูกต้อง
                    </h1>
                    <p className="text-slate-600 mb-6">
                        กรุณาตรวจสอบลิงก์รีเซ็ตรหัสผ่านของคุณอีกครั้ง
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        <ArrowLeft size={20} />
                        กลับไปหน้าเข้าสู่ระบบ
                    </Link>
                </div>

                <style jsx>{`
          @keyframes blob {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob {
            animation: blob 4s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 2.5s;
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Enhanced Animated Gradient Blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
            <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-gradient-to-br from-violet-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-6000"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-3000"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Reset Password Card */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50">
                    {/* Logo & Branding Section */}
                    <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 px-8 py-10 text-center relative overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

                        <div className="relative z-10">
                            {/* Logo */}
                            <div className="inline-block mb-5">
                                <div className="relative w-20 h-20 bg-white rounded-2xl p-3 shadow-xl">
                                    <Image
                                        src="/img/logo/Artboard 1.png"
                                        alt="ME PROMPT Logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                                ตั้งรหัสผ่านใหม่
                            </h1>
                            <p className="text-white/90 text-sm font-medium">
                                กรุณากรอกรหัสผ่านใหม่ของคุณ
                            </p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    รหัสผ่านใหม่ <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="block w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium"
                                        placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="block w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium"
                                        placeholder="กรอกรหัสผ่านอีกครั้ง"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-xs font-bold text-blue-800 mb-2">
                                    ข้อกำหนดรหัสผ่าน:
                                </p>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 size={14} className={newPassword.length >= 6 ? "text-green-600" : "text-gray-400"} />
                                        อย่างน้อย 6 ตัวอักษร
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 size={14} className={newPassword === confirmPassword && newPassword ? "text-green-600" : "text-gray-400"} />
                                        รหัสผ่านตรงกัน
                                    </li>
                                </ul>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 px-4 rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isSubmitting ? "กำลังบันทึก..." : "ตั้งรหัสผ่านใหม่"}
                            </button>

                            {/* Back to Login */}
                            <div className="text-center pt-4">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 font-semibold text-sm transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    กลับไปหน้าเข้าสู่ระบบ
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    © 2026 ME PROMPT Technology. All rights reserved.
                </p>
            </div>

            {/* Modals */}
            <ModalSuccess
                open={successModal.open}
                message={successModal.message}
                description={successModal.description}
                onClose={() => setSuccessModal({ ...successModal, open: false })}
            />

            <ModalError
                open={errorModal.open}
                message={errorModal.message}
                description={errorModal.description}
                onClose={() => setErrorModal({ ...errorModal, open: false })}
            />

            <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 4s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 1.5s;
        }
        .animation-delay-4000 {
          animation-delay: 2.5s;
        }
        .animation-delay-6000 {
          animation-delay: 3s;
        }
      `}</style>
        </div>
    );
}
