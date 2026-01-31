/**
 * Helper functions สำหรับจัดการรูปภาพกับ Cloudflare Images
 */

export interface UploadImageOptions {
  file: File;
  relatedType?: string;
  relatedId?: string;
  fieldName?: string;
  tags?: string[];
}

export interface CloudflareImageData {
  id: string; // Internal DB ID usually, but here likely Cloudflare ID or DB ID depending on usage
  cloudflareId: string;
  filename: string;
  publicUrl: string;
  variants: string[];
  size?: number;
  format?: string;
  relatedType?: string;
  relatedId?: string;
  fieldName?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * อัพโหลดรูปภาพไปยัง Cloudflare Images ผ่าน Server API (Two-step process: Upload -> Save DB)
 */
export async function uploadImage(
  options: UploadImageOptions
): Promise<CloudflareImageData> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  // 1. Upload File to Cloudflare
  const formData = new FormData();
  formData.append("file", options.file);

  console.log("🚀 Step 1: Uploading to Cloudflare...");
  const uploadRes = await fetch("/api/cloudflare-image/upload", {
    method: "POST",
    headers: headers as HeadersInit,
    body: formData,
  });

  if (!uploadRes.ok) {
    let errorMsg = "Failed to upload image to Cloudflare";
    try {
      const errorData = await uploadRes.json();
      errorMsg = errorData.error || errorMsg;
    } catch { /* ignore json parse error */ }
    throw new Error(errorMsg);
  }

  const uploadResult = await uploadRes.json();
  const cfData = uploadResult.data;

  // 2. Save Metadata to Database
  console.log("💾 Step 2: Saving metadata to Database...");
  const savePayload = {
    cloudflareId: cfData.id,
    filename: cfData.filename || options.file.name,
    publicUrl: cfData.variants[0], // Use first variant as public URL
    variants: cfData.variants,
    size: options.file.size,
    format: options.file.type.split('/')[1] || 'unknown',
    relatedType: options.relatedType,
    relatedId: options.relatedId,
    fieldName: options.fieldName,
    tags: options.tags,
    uploadedBy: "User", // Can be updated by server session if needed
  };

  const saveRes = await fetch("/api/cloudflare-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(savePayload),
  });

  if (!saveRes.ok) {
    // If DB save fails, we should ideally delete the image from Cloudflare to keep clean state
    // But for now, just throw error
    let errorMsg = "Failed to save image metadata";
    try {
      const errorData = await saveRes.json();
      errorMsg = errorData.error || errorMsg;
    } catch { /* ignore */ }
    throw new Error(errorMsg);
  }

  const saveResult = await saveRes.json();
  console.log("✅ Image process completed:", saveResult.data);
  return saveResult.data;
}

/**
 * ลบรูปภาพจาก Cloudflare Images (และ DB)
 */
export async function deleteImage(imageId: string): Promise<void> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const response = await fetch(`/api/cloudflare-image/${imageId}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete image");
  }
}

/**
 * ดึงข้อมูลรูปภาพตาม ID
 */
export async function getImage(imageId: string): Promise<CloudflareImageData> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const response = await fetch(`/api/cloudflare-image/${imageId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch image");
  }

  return await response.json();
}

/**
 * ดึงรายการรูปภาพทั้งหมด
 */
export interface GetImagesOptions {
  page?: number;
  limit?: number;
  relatedType?: string;
  relatedId?: string;
  fieldName?: string;
  tags?: string[];
}

export async function getImages(
  options: GetImagesOptions = {}
): Promise<{ data: CloudflareImageData[]; pagination: any }> {
  // Currently the API index.ts returns Array directly, not {data, pagination}
  // But we keep the signature for compatibility if API changes or we wrap it
  // For now let's assume index.ts returns array based on your previous index.ts implementation

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const response = await fetch(`/api/cloudflare-image`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch images");
  }

  const data = await response.json();
  return { data, pagination: {} }; // Mock pagination for now
}

/**
 * แปลง File เป็น base64 (สำหรับ preview)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
