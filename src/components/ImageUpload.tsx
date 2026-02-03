import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Check, XCircle } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { CloudflareImageData, fileToBase64 } from "@/lib/cloudflareImage";

interface ImageUploadProps {
  value?: string; // URL ของรูปภาพปัจจุบัน
  onChange?: (url: string, imageData?: CloudflareImageData) => void;
  onImageDataChange?: (imageData: CloudflareImageData | null) => void;
  relatedType?: string;
  relatedId?: string;
  fieldName?: string;
  tags?: string[];
  label?: string;
  description?: string;
  accept?: string;
  maxSize?: number; // MB
  aspectRatio?: "square" | "video" | "wide"; // สัดส่วนของพื้นที่อัพโหลด
  imagefit?: "cover" | "contain"; // วิธีการแสดงรูปภาพ
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onImageDataChange,
  relatedType,
  relatedId,
  fieldName,
  tags = [],
  label = "อัพโหลดรูปภาพ",
  description = "คลิกหรือลากไฟล์มาวางที่นี่",
  accept = "image/*",
  maxSize = 20, // 20MB default
  aspectRatio = "video", // default 16:9
  imagefit = "contain", // default contain เพื่อความชัด
  className = "",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const { upload, cancel, uploading, isSuccess, isCancelled, progress, error, reset } = useImageUpload({
    relatedType,
    relatedId,
    fieldName,
    tags,
    onSuccess: (imageData) => {
      setPreview(imageData.publicUrl);
      setPendingFile(null);
      if (onChange) {
        onChange(imageData.publicUrl, imageData);
      }
      if (onImageDataChange) {
        onImageDataChange(imageData);
      }
    },
    onCancel: () => {
      // Restore previous preview or clear
      setPreview(value || null);
      setPendingFile(null);
    },
  });

  // Update preview when value prop changes
  useEffect(() => {
    if (!uploading && !isSuccess) {
      setPreview(value || null);
    }
  }, [value, uploading, isSuccess]);

  const handleFileSelect = async (file: File) => {
    // ตรวสอบขนาดไฟล์ขั้นต้น
    const MAX_ALLOWED = maxSize * 1024 * 1024;
    if (file.size > MAX_ALLOWED) {
      alert(`ไฟล์มีขนาดใหญ่เกินไป (สูงสุด ${maxSize}MB) กรุณาเลือกไฟล์ที่เล็กลง`);
      return;
    }

    // Store file for retry
    setPendingFile(file);

    // แสดง preview
    const base64 = await fileToBase64(file);
    setPreview(base64);

    // อัพโหลดไปยัง Cloudflare
    try {
      await upload(file);
    } catch {
      // Error is handled by hook
    }
  };

  const handleRetry = async () => {
    if (pendingFile) {
      reset();
      try {
        await upload(pendingFile);
      } catch {
        // Error is handled by hook
      }
    }
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!uploading) {
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        handleFileSelect(file);
      }
    }
  };

  const handleRemove = () => {
    reset();
    setPreview(null);
    setPendingFile(null);
    if (onChange) {
      onChange("");
    }
    if (onImageDataChange) {
      onImageDataChange(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    cancel();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? "border-violet-500 bg-violet-50"
            : isSuccess
              ? "border-green-500 bg-green-50"
              : error
                ? "border-red-400 bg-red-50"
                : "border-slate-200 bg-slate-50"
          }
          ${uploading
            ? "cursor-not-allowed"
            : "hover:border-violet-400 hover:bg-violet-50/50"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {preview ? (
          <div className="relative">
            <div
              className={`relative w-full rounded-lg overflow-hidden bg-slate-100 ${aspectRatio === "square"
                ? "aspect-square"
                : aspectRatio === "wide"
                  ? "aspect-21/9"
                  : "aspect-video"
                }`}
            >
              <Image
                src={preview}
                alt="Preview"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={
                  imagefit === "contain" ? "object-contain" : "object-cover"
                }
              />
            </div>

            {/* Remove button - show when not uploading and not in success state */}
            {!uploading && !isSuccess && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <X size={16} />
              </button>
            )}

            {/* Success Overlay with Animation */}
            {isSuccess && (
              <div className="absolute inset-0 bg-green-500/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg animate-fadeIn">
                <div className="bg-white rounded-full p-3 shadow-lg animate-successBounce">
                  <Check className="w-10 h-10 text-green-500" strokeWidth={3} />
                </div>
                <p className="text-white font-bold mt-3 text-lg">อัพโหลดสำเร็จ!</p>
              </div>
            )}

            {/* Uploading Overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
                <div className="text-white text-center w-4/5">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-medium mb-3">
                    กำลังอัพโหลด...
                  </p>
                  {/* Progress Bar Container */}
                  <div className="relative w-full h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
                    {/* Animated Progress Bar */}
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                  </div>
                  {/* Progress Text */}
                  <p className="text-lg font-bold mt-2 tabular-nums">
                    {progress}%
                  </p>
                  {/* Cancel Button */}
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
                  >
                    <XCircle size={16} />
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8">
            {uploading ? (
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-600 font-medium mb-3">
                  กำลังอัพโหลด...
                </p>
                {/* Progress Bar Container */}
                <div className="relative w-3/4 mx-auto h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  {/* Animated Progress Bar */}
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                  </div>
                </div>
                {/* Progress Text */}
                <p className="text-xl font-bold text-violet-600 mt-3 tabular-nums">
                  {progress}%
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {progress < 10 ? "กำลังบีบอัดรูปภาพ..." :
                    progress < 100 ? "กำลังอัพโหลดไปยังเซิร์ฟเวอร์..." :
                      "เสร็จสิ้น!"}
                </p>
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="mt-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <XCircle size={16} />
                  ยกเลิก
                </button>
              </div>
            ) : isSuccess ? (
              <div className="text-center animate-fadeIn">
                <div className="bg-green-100 rounded-full p-4 inline-block mb-3 animate-successBounce">
                  <Check className="w-12 h-12 text-green-500" strokeWidth={3} />
                </div>
                <p className="text-lg font-bold text-green-600">อัพโหลดสำเร็จ!</p>
              </div>
            ) : isCancelled ? (
              <div className="text-center">
                <div className="bg-amber-100 rounded-full p-4 inline-block mb-3">
                  <XCircle className="w-12 h-12 text-amber-500" />
                </div>
                <p className="text-lg font-bold text-amber-600 mb-2">ยกเลิกการอัพโหลด</p>
                <p className="text-sm text-slate-500">คลิกเพื่อเลือกไฟล์ใหม่</p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-600 font-medium mb-1">
                  {description}
                </p>
                <p className="text-xs text-slate-400">
                  รองรับไฟล์ภาพ ขนาดสูงสุด {maxSize}MB
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Message with Retry */}
      {error && !isCancelled && (
        <div className="text-sm text-red-500 mt-2 bg-red-50 p-3 rounded-lg border border-red-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold">เกิดข้อผิดพลาด:</p>
              <p>{error.message}</p>
            </div>
            {pendingFile && (
              <button
                type="button"
                onClick={handleRetry}
                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium"
              >
                ลองใหม่
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
