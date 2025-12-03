import { useState } from "react";
import { uploadImage, deleteImage, CloudflareImageData } from "@/lib/cloudflareImage";

interface UseImageUploadOptions {
  relatedType?: string;
  relatedId?: string;
  fieldName?: string;
  tags?: string[];
  onSuccess?: (image: CloudflareImageData) => void;
  onError?: (error: Error) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [uploadedImage, setUploadedImage] = useState<CloudflareImageData | null>(null);

  const upload = async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      // Simulate progress (Cloudflare API doesn't provide progress)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadImage({
        file,
        relatedType: options.relatedType,
        relatedId: options.relatedId,
        fieldName: options.fieldName,
        tags: options.tags,
      });

      clearInterval(progressInterval);
      setProgress(100);
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
