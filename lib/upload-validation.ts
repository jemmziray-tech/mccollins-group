// lib/upload-validation.ts

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
  safeFileName?: string;
}

export function validateImageFile(file: File, prefix = "img"): ValidationResult {
  if (!file || file.size === 0) {
    return { valid: false, error: "File is empty or missing." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 10MB limit (size: ${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
    };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file type "${file.type}". Allowed formats: JPEG, PNG, WebP, GIF.`,
    };
  }

  const rawExt = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.has(rawExt)) {
    return {
      valid: false,
      error: `Invalid file extension ".${rawExt}". Allowed extensions: jpg, jpeg, png, webp, gif.`,
    };
  }

  const sanitizedExt = rawExt === "jpeg" ? "jpg" : rawExt;
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const safeFileName = `${prefix}-${Date.now()}-${randomSuffix}.${sanitizedExt}`;

  return {
    valid: true,
    safeFileName,
  };
}
