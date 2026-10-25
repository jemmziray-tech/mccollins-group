// app/api/admin/upload-product/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase-server";
import { validateImageFile } from "@/lib/upload-validation";

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const formData = await req.formData();

    // 1. Text Fields
    const rawName = formData.get("name") as string;
    const name = rawName?.trim() ? rawName.trim() : "McCollins Exclusive Piece";

    const priceRaw = formData.get("price") as string;
    const price = parseFloat(priceRaw);
    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
    }

    const brand = ((formData.get("brand") as string) || "McCollins Exclusive").trim();
    const department = (formData.get("department") as string) || "Unisex";
    const category = (formData.get("category") as string) || "New Arrivals";
    const collection = (formData.get("collection") as string) || null;
    const description = (formData.get("description") as string) || null;
    const sizesRaw = formData.get("sizes") as string | null;
    const sizeType = (formData.get("sizeType") as string) || "clothing";
    const stockRaw = formData.get("stock") as string | null;
    const stock = stockRaw && !isNaN(Number(stockRaw)) ? Math.max(0, Number(stockRaw)) : 10;

    const sizes = sizesRaw
      ? sizesRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // 2. Files or Links
    const file = formData.get("image") as File | null;
    const hoverFile = formData.get("hoverImage") as File | null;
    const directImageUrl = formData.get("imageUrl") as string | null;
    const directHoverUrl = formData.get("hoverImageUrl") as string | null;

    if ((!file || file.size === 0) && !directImageUrl) {
      return NextResponse.json({ error: "Primary image file or URL is required" }, { status: 400 });
    }

    // 3. Process Primary Image
    let primaryImageUrl = directImageUrl;

    if (file && file.size > 0) {
      const validation = validateImageFile(file, "main");
      if (!validation.valid || !validation.safeFileName) {
        return NextResponse.json({ error: validation.error || "Invalid primary image" }, { status: 400 });
      }

      const fileName = validation.safeFileName;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabaseServer.storage
        .from("products")
        .upload(fileName, buffer, { contentType: file.type });

      if (uploadError) {
        console.error("Primary upload error:", uploadError);
        throw new Error("Primary image upload failed");
      }

      const { data } = supabaseServer.storage.from("products").getPublicUrl(fileName);
      primaryImageUrl = data.publicUrl;
    }

    // 4. Process Hover Image
    let hoverImageUrl = directHoverUrl || null;

    if (hoverFile && hoverFile.size > 0) {
      const hValidation = validateImageFile(hoverFile, "hover");
      if (!hValidation.valid || !hValidation.safeFileName) {
        return NextResponse.json({ error: hValidation.error || "Invalid hover image" }, { status: 400 });
      }

      const hName = hValidation.safeFileName;
      const hBuffer = Buffer.from(await hoverFile.arrayBuffer());

      const { error: hUploadError } = await supabaseServer.storage
        .from("products")
        .upload(hName, hBuffer, { contentType: hoverFile.type });

      if (hUploadError) {
        console.error("Hover upload error:", hUploadError);
        throw new Error("Hover image upload failed");
      }

      const { data: hData } = supabaseServer.storage.from("products").getPublicUrl(hName);
      hoverImageUrl = hData.publicUrl;
    }

    // 5. Save to Database
    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        brand,
        department,
        category,
        collection: collection && collection !== "None" ? collection : null,
        description,
        sizes,
        sizeType,
        stock,
        imageUrl: primaryImageUrl as string,
        hoverImageUrl,
        isAvailable: true,
      },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error("Admin Upload Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload and save product" },
      { status: 500 }
    );
  }
}