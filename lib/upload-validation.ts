const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function validateImageFile(file: File | null | undefined, label: string) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    return `${label} must be a valid image file (jpg, png, webp, gif).`;
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `${label} must be smaller than 5MB.`;
  }

  return null;
}
