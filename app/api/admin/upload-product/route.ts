// app/api/admin/upload-product/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/server-auth';
import { validateImageFile } from '@/lib/upload-validation';
import { PRODUCT_CATEGORY_OPTIONS, PRODUCT_COLLECTION_OPTIONS } from '@/lib/product-taxonomy';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const formData = await req.formData();
    
    // --- 1. GRAB TEXT FIELDS ---
    const rawName = formData.get('name') as string;
    const name = rawName?.trim() ? rawName.trim() : "McCollins Exclusive Piece"; 
    
    const price = parseFloat(formData.get('price') as string);
    const brand = (formData.get('brand') as string) || "McCollins Exclusive";
    const department = (formData.get('department') as string) || "Unisex"; 
    const category = (formData.get('category') as string) || "New Arrivals";
    const collection = (formData.get('collection') as string) || null; // 🟢 SUPPORT FOR COLLECTIONS
    const description = formData.get('description') as string;

    // --- 2. GRAB FILES OR LINKS ---
    const file = formData.get('image') as File | null;
    const hoverFile = formData.get('hoverImage') as File | null;
    
    const directImageUrl = formData.get('imageUrl') as string | null;
    const directHoverUrl = formData.get('hoverImageUrl') as string | null;

    const primaryImageError = validateImageFile(file, "Primary image");
    if (primaryImageError) {
      return NextResponse.json({ error: primaryImageError }, { status: 400 });
    }

    const hoverImageError = validateImageFile(hoverFile, "Hover image");
    if (hoverImageError) {
      return NextResponse.json({ error: hoverImageError }, { status: 400 });
    }

    if ((!file || file.size === 0) && !directImageUrl) {
      return NextResponse.json({ error: "Primary image file or link is required" }, { status: 400 });
    }
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }
    if (!PRODUCT_CATEGORY_OPTIONS.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // --- 3. PROCESS PRIMARY IMAGE ---
    let primaryImageUrl = directImageUrl;

    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `main-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, buffer, { contentType: file.type });

      if (uploadError) throw new Error("Primary image upload failed");

      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
      primaryImageUrl = data.publicUrl;
    }

    // --- 4. PROCESS HOVER IMAGE ---
    let hoverImageUrl = directHoverUrl || null;

    if (hoverFile && hoverFile.size > 0) {
      const hExt = hoverFile.name.split('.').pop();
      const hName = `hover-${Date.now()}-${Math.random().toString(36).substring(2)}.${hExt}`;
      const hBuffer = Buffer.from(await hoverFile.arrayBuffer());

      const { error: hUploadError } = await supabase.storage
        .from('products')
        .upload(hName, hBuffer, { contentType: hoverFile.type });

      if (hUploadError) throw new Error("Hover image upload failed");

      const { data: hData } = supabase.storage.from('products').getPublicUrl(hName);
      hoverImageUrl = hData.publicUrl;
    }

    // --- 5. SAVE TO DATABASE ---
    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        brand,
        department,
        category,
        ...(collection &&
          collection !== "None" &&
          PRODUCT_COLLECTION_OPTIONS.includes(collection) && { collection }),
        description: description || null,
        imageUrl: primaryImageUrl as string, 
        hoverImageUrl: hoverImageUrl, 
        isAvailable: true
      }
    });

    return NextResponse.json({ success: true, product: newProduct });

  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message || "Something went completely wrong." }, { status: 500 });
  }
}