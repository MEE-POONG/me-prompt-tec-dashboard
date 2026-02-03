import { useState, useCallback, useRef } from "react";
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
  onCancel?: () => void;
}

/**
 * Upload file using XMLHttpRequest for real progress tracking
 * Returns XHR instance for abort capability
 */
function createUploadXHR(
  file: File,
  options: {
    relatedType?: string;
    relatedId?: string;
    fieldName?: string;
    tags?: string[];
  },
  callbacks: {
    onProgress: (progress: number) => void;
    onSuccess: (data: CloudflareImageData) => void;
    onError: (error: Error) => void;
  }
): XMLHttpRequest {
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
      callbacks.onProgress(percentComplete);
    }
  });

  xhr.addEventListener("load", () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const response = JSON.parse(xhr.responseText);
        if (response.data) {
          callbacks.onSuccess(response.data);
        } else {
          callbacks.onError(new Error(response.error || "Upload failed"));
        }
      } catch {
        callbacks.onError(new Error("Failed to parse server response"));
      }
    } else {
      try {
        const errorResponse = JSON.parse(xhr.responseText);
        callbacks.onError(new Error(errorResponse.error || `Upload failed with status ${xhr.status}`));
      } catch {
        callbacks.onError(new Error(`Upload failed with status ${xhr.status}`));
      }
    }
  });

  xhr.addEventListener("error", () => {
    callbacks.onError(new Error("Network error: request failed"));
  });

  xhr.addEventListener("abort", () => {
    callbacks.onError(new Error("Upload cancelled"));
  });

  // Add token if available
  const token = localStorage.getItem("token");

  xhr.open("POST", "/api/cloudflare-image/upload");
  if (token) {
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
  }
  xhr.send(formData);

  return xhr;
}

export type UploadStatus = "idle" | "uploading" | "success" | "error" | "cancelled";

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [uploadedImage, setUploadedImage] = useState<CloudflareImageData | null>(null);

  // Store XHR reference for cancel functionality
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const handleProgress = useCallback((value: number) => {
    setProgress(value);
    if (options.onProgress) {
      options.onProgress(value);
    }
  }, [options]);

  const upload = async (file: File) => {
    return new Promise<CloudflareImageData>((resolve, reject) => {
      setStatus("uploading");
      setProgress(0);
      setError(null);

      // 🔄 Resize/Compress image on client side before uploading
      handleProgress(5);

      resizeImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8
      }).then((processedBlob) => {
        const processedFile = new File([processedBlob], file.name, {
          type: file.type,
        });

        handleProgress(10);

        // Create XHR and store reference for cancel
        xhrRef.current = createUploadXHR(
          processedFile,
          {
            relatedType: options.relatedType,
            relatedId: options.relatedId,
            fieldName: options.fieldName,
            tags: options.tags,
          },
          {
            onProgress: (uploadProgress) => {
              const scaledProgress = 10 + Math.round(uploadProgress * 0.9);
              handleProgress(scaledProgress);
            },
            onSuccess: (result) => {
              handleProgress(100);
              setUploadedImage(result);
              setStatus("success");
              xhrRef.current = null;

              if (options.onSuccess) {
                options.onSuccess(result);
              }

              // Auto reset success state after 2 seconds
              setTimeout(() => {
                setStatus("idle");
              }, 2000);

              resolve(result);
            },
            onError: (err) => {
              if (err.message === "Upload cancelled") {
                setStatus("cancelled");
                if (options.onCancel) {
                  options.onCancel();
                }
              } else {
                setError(err);
                setStatus("error");
                if (options.onError) {
                  options.onError(err);
                }
              }
              xhrRef.current = null;
              reject(err);
            },
          }
        );
      }).catch((err) => {
        const error = err instanceof Error ? err : new Error("Resize failed");
        setError(error);
        setStatus("error");
        reject(error);
      });
    });
  };

  const cancel = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
      setStatus("cancelled");
      setProgress(0);
      if (options.onCancel) {
        options.onCancel();
      }
    }
  }, [options]);

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
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setStatus("idle");
    setProgress(0);
    setError(null);
    setUploadedImage(null);
  };

  // Computed states for backwards compatibility
  const uploading = status === "uploading";
  const isSuccess = status === "success";
  const isCancelled = status === "cancelled";

  return {
    upload,
    cancel,
    remove,
    reset,
    status,
    uploading,
    isSuccess,
    isCancelled,
    progress,
    error,
    uploadedImage,
  };
}
