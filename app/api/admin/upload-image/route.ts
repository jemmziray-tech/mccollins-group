import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase-server";
import { validateImageFile } from "@/lib/upload-validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;
  try {
    const body = await request.formData();
    const file = body.get("image");
    if (!(file instanceof File)) return NextResponse.json({ error: "An image file is required." }, { status: 400 });
    // Vercel Functions accept request bodies up to 4.5 MB, including multipart overhead.
    if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Image must be 4MB or smaller." }, { status: 400 });
    const validation = validateImageFile(file, "product");
    if (!validation.valid || !validation.safeFileName) {
      return NextResponse.json({ error: validation.error || "Invalid image." }, { status: 400 });
    }
    const name = validation.safeFileName;
    const { error } = await supabaseServer.storage.from("products").upload(
      name, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false },
    );
    if (error) throw new Error("Image upload failed.");
    const { data } = supabaseServer.storage.from("products").getPublicUrl(name);
    return NextResponse.json({ imageUrl: data.publicUrl }, { status: 201 });
  } catch (error) {
    console.error("Admin image upload failed:", error);
    return NextResponse.json({ error: "Image upload failed." }, { status: 500 });
  }
}
