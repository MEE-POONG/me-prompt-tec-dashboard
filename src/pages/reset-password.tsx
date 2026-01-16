import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
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
            <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">
                        ลิงก์ไม่ถูกต้อง
                    </h1>
                    <p className="text-slate-600 mb-6">
                        กรุณาตรวจสอบลิงก์รีเซ็ตรหัสผ่านของคุณอีกครั้ง
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <ArrowLeft size={20} />
                        กลับไปหน้าเข้าสู่ระบบ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc] py-8 px-4 relative overflow-hidden font-sans">
            {/* Background Aurora */}
            <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px] mix-blend-multiply"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-pink-200/30 rounded-full blur-[120px] mix-blend-multiply"></div>
            </div>

            <div className="max-w-md mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-purple-500/30 mb-4">
                        <Lock size={40} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-800 mb-2">
                        ตั้งรหัสผ่านใหม่
                    </h1>
                    <p className="text-slate-500 font-medium">
                        กรุณากรอกรหัสผ่านใหม่ของคุณ
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                รหัสผ่านใหม่ <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 bg-white font-medium"
                                    placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 bg-white font-medium"
                                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Password Requirements */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <p className="text-xs font-bold text-blue-800 mb-2">
                                ข้อกำหนดรหัสผ่าน:
                            </p>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className={newPassword.length >= 6 ? "text-green-600" : "text-slate-400"} />
                                    อย่างน้อย 6 ตัวอักษร
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className={newPassword === confirmPassword && newPassword ? "text-green-600" : "text-slate-400"} />
                                    รหัสผ่านตรงกัน
                                </li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isSubmitting ? "กำลังบันทึก..." : "ตั้งรหัสผ่านใหม่"}
                        </button>

                        {/* Back to Login */}
                        <div className="text-center pt-4">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-slate-600 hover:text-purple-600 font-medium text-sm transition-colors"
                            >
                                <ArrowLeft size={16} />
                                กลับไปหน้าเข้าสู่ระบบ
                            </Link>
                        </div>
                    </form>
                </div>
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
        </div>
    );
}
