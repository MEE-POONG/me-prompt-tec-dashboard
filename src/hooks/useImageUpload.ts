import { useState, useCallback } from "react";
import { CloudflareImageData, deleteImage } from "@/lib/cloudflareImage";
import { resizeImage } from "@/lib/imageResizer";

interface UseImageUploadOptions {
  relatedType?: string;
  relatedId?: string;
  fieldName?: string;
  tags?: string[];
  onSuccess?: (image: CloudflareImageData) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

/**
 * Upload file using XMLHttpRequest for real progress tracking
 */
async function uploadWithProgress(
  file: File,
  options: {
    relatedType?: string;
    relatedId?: string;
    fieldName?: string;
    tags?: string[];
  },
  onProgress: (progress: number) => void
): Promise<CloudflareImageData> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append("file", file);
    if (options.relatedType) formData.append("relatedType", options.relatedType);
    if (options.relatedId) formData.append("relatedId", options.relatedId);
    if (options.fieldName) formData.append("fieldName", options.fieldName);
    if (options.tags) formData.append("tags", JSON.stringify(options.tags));

    // Track upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.data) {
            resolve(response.data);
          } else {
            reject(new Error(response.error || "Upload failed"));
          }
        } catch {
          reject(new Error("Failed to parse server response"));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(new Error(errorResponse.error || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error: request to https://api.cloudflare.com/ failed, reason:"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload cancelled"));
    });

    // Add token if available
    const token = localStorage.getItem("token");

    xhr.open("POST", "/api/cloudflare-image/upload");
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.send(formData);
  });
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [uploadedImage, setUploadedImage] = useState<CloudflareImageData | null>(null);

  const handleProgress = useCallback((value: number) => {
    setProgress(value);
    if (options.onProgress) {
      options.onProgress(value);
    }
  }, [options]);

  const upload = async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      // 🔄 Resize/Compress image on client side before uploading
      handleProgress(5); // Show initial progress for resizing

      const processedBlob = await resizeImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8
      });

      // Convert Blob to File to keep metadata if needed by API
      const processedFile = new File([processedBlob], file.name, {
        type: file.type,
      });

      handleProgress(10); // Resizing complete

      // Upload with real progress tracking
      const result = await uploadWithProgress(
        processedFile,
        {
          relatedType: options.relatedType,
          relatedId: options.relatedId,
          fieldName: options.fieldName,
          tags: options.tags,
        },
        (uploadProgress) => {
          // Scale progress from 10-100 (10% for resize, 90% for upload)
          const scaledProgress = 10 + Math.round(uploadProgress * 0.9);
          handleProgress(scaledProgress);
        }
      );

      handleProgress(100);
      setUploadedImage(result);

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Upload failed");
      setError(error);

      if (options.onError) {
        options.onError(error);
      }

      throw error;
    } finally {
      setUploading(false);
    }
  };

  const remove = async (imageId: string) => {
    try {
      setError(null);
      await deleteImage(imageId);
      setUploadedImage(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Delete failed");
      setError(error);
      throw error;
    }
  };

  const reset = () => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setUploadedImage(null);
  };

  return {
    upload,
    remove,
    reset,
    uploading,
    progress,
    error,
    uploadedImage,
  };
}
