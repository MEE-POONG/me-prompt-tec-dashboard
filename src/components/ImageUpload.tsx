import React, { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
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

  const { upload, uploading, progress, error } = useImageUpload({
    relatedType,
    relatedId,
    fieldName,
    tags,
    onSuccess: (imageData) => {
      setPreview(imageData.publicUrl);
      if (onChange) {
        onChange(imageData.publicUrl, imageData);
      }
      if (onImageDataChange) {
        onImageDataChange(imageData);
      }
    },
  });

  const handleFileSelect = async (file: File) => {
    // ตรวสอบขนาดไฟล์ขั้นต้น (เพิ่มเป็น 20MB เนื่องจากมีการ Resize ช่วย)
    const MAX_ALLOWED = 20 * 1024 * 1024;
    if (file.size > MAX_ALLOWED) {
      alert(`ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 20MB) กรุณาเลือกไฟล์ที่เล็กลง`);
      return;
    }

    // แสดง preview
    const base64 = await fileToBase64(file);
    setPreview(base64);

    // อัพโหลดไปยัง Cloudflare
    await upload(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
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

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <div
        onClick={!uploading ? handleClick : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? "border-violet-500 bg-violet-50"
            : "border-slate-200 bg-slate-50"
          }
          ${uploading
            ? "cursor-not-allowed opacity-60"
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

            {!uploading && (
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

            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-white text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm font-medium">
                    กำลังอัพโหลด... {progress}%
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8">
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-600 font-medium">
                  กำลังอัพโหลด... {progress}%
                </p>
              </>
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

      {error && (
        <p className="text-sm text-red-500 mt-2">
          เกิดข้อผิดพลาด: {error.message}
        </p>
      )}
    </div>
  );
}
