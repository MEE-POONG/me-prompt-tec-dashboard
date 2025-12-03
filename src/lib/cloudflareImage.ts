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
 * อัพโหลดรูปภาพไปยัง Cloudflare Images
 */
export async function uploadImage(
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

  const response = await fetch("/api/cloudflare-image/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to upload image");
  }

  const result = await response.json();
  return result.data;
}

/**
 * ลบรูปภาพจาก Cloudflare Images
 */
export async function deleteImage(imageId: string): Promise<void> {
  const response = await fetch(`/api/cloudflare-image/${imageId}`, {
    method: "DELETE",
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
  const response = await fetch(`/api/cloudflare-image/${imageId}`);

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

  const response = await fetch(`/api/cloudflare-image?${params.toString()}`);

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
