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
  id: string;
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
 * อัพโหลดรูปภาพไปยัง Cloudflare Images (Legacy - ผ่าน Server)
 * @deprecated ใช้ directUploadImage แทนเพื่อประสิทธิภาพที่ดีกว่า
 */
export async function uploadImageLegacy(
  options: UploadImageOptions
): Promise<CloudflareImageData> {
  const formData = new FormData();
  formData.append("file", options.file);

  if (options.relatedType) {
    formData.append("relatedType", options.relatedType);
  }

  if (options.relatedId) {
    formData.append("relatedId", options.relatedId);
  }

  if (options.fieldName) {
    formData.append("fieldName", options.fieldName);
  }

  if (options.tags && options.tags.length > 0) {
    formData.append("tags", JSON.stringify(options.tags));
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const response = await fetch("/api/cloudflare-image/upload", {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMsg = "Failed to upload image";
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorData.error || errorMsg;
    } catch (e) {
      const text = await response.text();
      console.error("Non-JSON error response from upload API:", text);
      errorMsg = `Server error (${response.status}): ${text.slice(0, 200)}...`;
    }
    throw new Error(errorMsg);
  }

  try {
    const result = await response.json();
    return result.data;
  } catch (e) {
    const text = await response.text();
    console.error("Non-JSON success response from upload API:", text);
    throw new Error(`Unexpected non-JSON response from server: ${text.slice(0, 100)}`);
  }
}

/**
 * อัพโหลดรูปภาพไปยัง Cloudflare Images โดยตรง (Direct Upload)
 * Browser จะอัปโหลดตรงไปที่ Cloudflare โดยไม่ผ่าน Server
 */
export async function uploadImage(
  options: UploadImageOptions
): Promise<CloudflareImageData> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ขั้นตอนที่ 1: ขอ Direct Upload URL จาก Server
  console.log("🔑 Requesting Direct Upload URL...");
  const directUploadResponse = await fetch("/api/cloudflare-image/direct-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      relatedType: options.relatedType,
      relatedId: options.relatedId,
      fieldName: options.fieldName,
      tags: options.tags,
    }),
  });

  if (!directUploadResponse.ok) {
    const errorData = await directUploadResponse.json().catch(() => ({}));
    console.error("❌ Failed to get Direct Upload URL:", errorData);
    throw new Error(errorData.message || errorData.error || "Failed to get upload URL");
  }

  const { data: directUploadData } = await directUploadResponse.json();
  console.log("✅ Got Direct Upload URL:", directUploadData.imageId);

  // ขั้นตอนที่ 2: อัปโหลดรูปตรงไปที่ Cloudflare
  console.log("📤 Uploading directly to Cloudflare...");
  const uploadFormData = new FormData();
  uploadFormData.append("file", options.file);

  const cloudflareUploadResponse = await fetch(directUploadData.uploadURL, {
    method: "POST",
    body: uploadFormData,
  });

  if (!cloudflareUploadResponse.ok) {
    const errorText = await cloudflareUploadResponse.text();
    console.error("❌ Cloudflare upload failed:", errorText);
    throw new Error(`Cloudflare upload failed: ${errorText.slice(0, 200)}`);
  }

  console.log("✅ Uploaded to Cloudflare successfully");

  // ขั้นตอนที่ 3: Confirm upload กับ Server
  console.log("✔️ Confirming upload with server...");
  const confirmResponse = await fetch("/api/cloudflare-image/confirm-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      recordId: directUploadData.recordId,
      cloudflareId: directUploadData.imageId,
      filename: options.file.name,
    }),
  });

  if (!confirmResponse.ok) {
    const errorData = await confirmResponse.json().catch(() => ({}));
    console.error("❌ Failed to confirm upload:", errorData);
    throw new Error(errorData.message || "Failed to confirm upload");
  }

  const { data: imageData } = await confirmResponse.json();
  console.log("✅ Upload confirmed:", imageData.publicUrl);

  return imageData;
}

/**
 * ลบรูปภาพจาก Cloudflare Images
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

  const result = await response.json();
  return result.data;
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
  const params = new URLSearchParams();

  if (options.page) params.append("page", String(options.page));
  if (options.limit) params.append("limit", String(options.limit));
  if (options.relatedType) params.append("relatedType", options.relatedType);
  if (options.relatedId) params.append("relatedId", options.relatedId);
  if (options.fieldName) params.append("fieldName", options.fieldName);
  if (options.tags && options.tags.length > 0) {
    params.append("tags", options.tags.join(","));
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const response = await fetch(`/api/cloudflare-image?${params.toString()}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch images");
  }

  return await response.json();
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
