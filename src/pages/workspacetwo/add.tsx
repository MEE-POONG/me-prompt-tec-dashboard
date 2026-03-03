import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
import {
  FolderPlus,
  ArrowLeft,
  Save,
  Loader2,
  Briefcase,
  Check,
  Plus,
  X,
  Lock,  // [เพิ่ม]
  Globe, // [เพิ่ม]
} from "lucide-react";
import Link from "next/link";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";

// ✅ นำเข้า SketchPicker จาก react-color (ตัวที่เพิ่งติดตั้ง)
import { SketchPicker } from "react-color";

export default function AddWorkspacePage() {
  const router = useRouter();

  // Ref สำหรับ popover
  const popoverRef = useRef<HTMLDivElement>(null);

  // --- State ---
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [visibility, setVisibility] = useState<"PRIVATE" | "PUBLIC">("PRIVATE");
  // State ควบคุมการแสดงผล Color Picker
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isCustomColor, setIsCustomColor] = useState(false);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ปิด Popover เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: projectName,
        description,
        color,
        visibility,
        creator: JSON.parse(localStorage.getItem("user") || "{}"),
      };

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/workspace/board", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Create project failed");
      }

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "เกิดข้อผิดพลาดในการสร้างแผนงาน");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preset Colors
  const colorOptions = [
    { hex: "#3B82F6", name: "Blue" },
    { hex: "#A855F7", name: "Purple" },
    { hex: "#F97316", name: "Orange" },
    { hex: "#22C55E", name: "Green" },
    { hex: "#EC4899", name: "Pink" },
    { hex: "#EF4444", name: "Red" },
    { hex: "#EAB308", name: "Yellow" },
    { hex: "#14B8A6", name: "Teal" },
  ];

  const handlePresetClick = (hexValue: string) => {
    setColor(hexValue);
    setIsCustomColor(false);
    setShowColorPicker(false);
  };

  return (
    <Layouts>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 py-12 px-4 relative overflow-hidden font-sans text-slate-800">
        {/* Background Aurora */}
        <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none opacity-60">
          <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-10">
            <Link
              href="/workspace"
              className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all mb-6"
            >
              <ArrowLeft size={18} className="mr-2" />
              กลับไปหน้า Workspace
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
                  สร้างแผนงานใหม่
                </h1>
                <p className="text-slate-500 text-lg">
                  กำหนดรายละเอียดเริ่มต้นสำหรับโปรเจกต์ของคุณ
                </p>
              </div>
              <div className="hidden md:flex p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-blue-600">
                <FolderPlus size={32} strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-visible">
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Briefcase size={20} />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">
                  ข้อมูลทั่วไป
                </h2>
              </div>

              <div className="p-8 md:p-10 space-y-8">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    ชื่อแผนงาน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                    placeholder="เช่น Website Redesign Project"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    คำอธิบาย
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="อธิบายรายละเอียดโดยย่อ..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    การมองเห็น (Visibility)
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ตัวเลือกแบบ Private */}
                    <div
                      onClick={() => setVisibility("PRIVATE")}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3 relative ${visibility === "PRIVATE"
                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20"
                        : "border-slate-200 hover:border-blue-300 bg-white"
                        }`}
                    >
                      <div className={`mt-1 p-2 rounded-lg ${visibility === "PRIVATE" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-400"}`}>
                        <Lock size={18} />
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm ${visibility === "PRIVATE" ? "text-blue-700" : "text-slate-700"}`}>ส่วนตัว (Private)</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          เฉพาะคุณและสมาชิกที่ได้รับเชิญเท่านั้น ที่สามารถเข้าถึงและแก้ไขได้
                        </p>
                      </div>
                      {visibility === "PRIVATE" && (
                        <div className="absolute top-3 right-3 text-blue-600 bg-white rounded-full p-0.5 shadow-sm">
                          <Check size={14} strokeWidth={4} />
                        </div>
                      )}
                    </div>

                    {/* ตัวเลือกแบบ Public */}
                    <div
                      onClick={() => setVisibility("PUBLIC")}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3 relative ${visibility === "PUBLIC"
                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20"
                        : "border-slate-200 hover:border-blue-300 bg-white"
                        }`}
                    >
                      <div className={`mt-1 p-2 rounded-lg ${visibility === "PUBLIC" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-400"}`}>
                        <Globe size={18} />
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm ${visibility === "PUBLIC" ? "text-blue-700" : "text-slate-700"}`}>สาธารณะ (Public)</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          ทุกคนที่มีลิงก์สามารถเข้ามาดูได้ (Read Only) แต่ต้องได้รับเชิญถึงจะแก้ไขได้
                        </p>
                      </div>
                      {visibility === "PUBLIC" && (
                        <div className="absolute top-3 right-3 text-blue-600 bg-white rounded-full p-0.5 shadow-sm">
                          <Check size={14} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* === ส่วนเลือกสี และ วงล้อ === */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    ธีมสีของโปรเจกต์
                  </label>
                  <div className="flex flex-wrap gap-4 items-center relative">
                    {/* 1. สี Preset แบบเดิม */}
                    {colorOptions.map((option) => (
                      <button
                        key={option.hex}
                        type="button"
                        onClick={() => handlePresetClick(option.hex)}
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                          ${!isCustomColor && color === option.hex
                            ? "ring-2 ring-offset-2 ring-slate-400 scale-110 shadow-md"
                            : "hover:scale-110 hover:shadow-sm opacity-90 hover:opacity-100"
                          }
                        `}
                        style={{ backgroundColor: option.hex }}
                      >
                        {!isCustomColor && color === option.hex && (
                          <Check
                            size={18}
                            className="text-white drop-shadow-md"
                            strokeWidth={3}
                          />
                        )}
                      </button>
                    ))}

                    {/* 2. ปุ่มเปิดวงล้อสี (Custom Color) */}
                    <div className="relative" ref={popoverRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomColor(true);
                          setShowColorPicker(!showColorPicker);
                        }}
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 overflow-hidden
                          ${isCustomColor
                            ? "ring-2 ring-offset-2 ring-slate-400 shadow-md scale-110"
                            : "hover:scale-110 hover:shadow-sm ring-1 ring-slate-200"
                          }
                        `}
                        // พื้นหลังสีรุ้ง
                        style={{
                          background: isCustomColor
                            ? color
                            : "conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FF8A00 51.43deg, #FFE500 102.86deg, #00FF29 154.29deg, #00B2FF 205.71deg, #001AFF 257.14deg, #A700FF 308.57deg, #FF0000 360deg)",
                        }}
                        title="เลือกสีอื่นๆ"
                      >
                        {isCustomColor ? (
                          <div className="bg-black/10 w-full h-full flex items-center justify-center backdrop-blur-[1px]">
                            <Check
                              size={18}
                              className="text-white drop-shadow-md"
                              strokeWidth={3}
                            />
                          </div>
                        ) : (
                          <div className="bg-white/30 backdrop-blur-[1px] w-full h-full flex items-center justify-center">
                            <Plus
                              size={18}
                              className="text-slate-800 font-bold"
                            />
                          </div>
                        )}
                      </button>

                      {/* 3. Popover: SketchPicker (วงล้อสี Pro) */}
                      {showColorPicker && (
                        <div className="absolute top-14 left-0 md:left-1/2 md:-translate-x-1/2 z-50 animate-in fade-in zoom-in duration-200">
                          {/* กล่องคลุม */}
                          <div className="p-0 bg-white rounded-lg shadow-2xl border border-slate-100">
                            {/* ✅ Component วงล้อสีจาก react-color */}
                            <SketchPicker
                              color={color}
                              onChange={(newColor) => {
                                // react-color ส่งคืนค่าเป็น Object ต้องดึง .hex มาใช้
                                setColor(newColor.hex);
                                setIsCustomColor(true);
                              }}
                              disableAlpha={true} // ปิด Alpha ถ้ายากไป หรือเปิดไว้ก็ได้
                              presetColors={[]} // ซ่อน Preset ของตัว Picker เพราะเรามีข้างนอกแล้ว
                            />

                            <div className="p-2 border-t border-slate-100 flex justify-end bg-slate-50 rounded-b-lg">
                              <button
                                type="button"
                                onClick={() => setShowColorPicker(false)}
                                className="text-xs px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-600 font-medium"
                              >
                                เสร็จสิ้น
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href="/workspace">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors"
                >
                  ยกเลิก
                </button>
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </div>
          </form>
        </div>

        <ModalSuccess
          open={showSuccessModal}
          href="/workspace"
          message="สร้างแผนงานสำเร็จ!"
          description={`แผนงาน "${projectName}" พร้อมใช้งานแล้ว`}
          onClose={() => setShowSuccessModal(false)}
        />
      </div>
    </Layouts>
  );
}
