/**
 * Utility to resize and compress images on the client side using Canvas API.
 */

export interface ResizeOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maintainAspectRatio?: boolean;
}

/**
 * Resizes a File object (image) and returns a new Blob
 */
export async function resizeImage(
    file: File,
    options: ResizeOptions = {}
): Promise<Blob | File> {
    const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.8,
        maintainAspectRatio = true
    } = options;

    // Don't process if the file is not an image
    if (!file.type.startsWith('image/')) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (maintainAspectRatio) {
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }
                } else {
                    width = Math.min(width, maxWidth);
                    height = Math.min(height, maxHeight);
                }

                // Create canvas and draw image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas toBlob failed'));
                        }
                    },
                    file.type,
                    quality
                );
            };
            img.onerror = () => reject(new Error('Failed to load image'));
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
    });
}
