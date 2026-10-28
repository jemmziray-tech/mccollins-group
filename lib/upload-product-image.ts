export async function uploadProductImage(file: File): Promise<string> {
  if (file.size > 4 * 1024 * 1024) throw new Error("Image must be 4MB or smaller.");
  const body = new FormData();
  body.set("image", file);
  const response = await fetch("/api/admin/upload-image", { method: "POST", body });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Image upload failed.");
  return result.imageUrl;
}
