// app/api/admin/upload-product/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Grab text fields
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const brand = (formData.get('brand') as string) || "Colman Looks";
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;

    // Grab files
    const file = formData.get('image') as File | null;
    const hoverFile = formData.get('hoverImage') as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Primary image file is required" }, { status: 400 });
    }

    // --- 1. UPLOAD PRIMARY IMAGE ---
    const fileExt = file.name.split('.').pop();
    const fileName = `main-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, buffer, { contentType: file.type });

    if (uploadError) throw new Error("Primary image upload failed");

    const { data: { publicUrl: primaryImageUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    // --- 2. UPLOAD HOVER IMAGE (IF PROVIDED) ---
    let hoverImageUrl = null;
    if (hoverFile && hoverFile.size > 0) {
      const hExt = hoverFile.name.split('.').pop();
      const hName = `hover-${Date.now()}-${Math.random().toString(36).substring(2)}.${hExt}`;
      const hBuffer = Buffer.from(await hoverFile.arrayBuffer());

      const { error: hUploadError } = await supabase.storage
        .from('products')
        .upload(hName, hBuffer, { contentType: hoverFile.type });

      if (hUploadError) throw new Error("Hover image upload failed");

      const { data: hData } = supabase.storage
        .from('products')
        .getPublicUrl(hName);
        
      hoverImageUrl = hData.publicUrl;
    }

    // --- 3. SAVE TO DATABASE ---
    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        brand,
        category,
        description,
        imageUrl: primaryImageUrl, 
        hoverImageUrl: hoverImageUrl, // 🟢 The new lifestyle swap image!
        isAvailable: true
      }
    });

    return NextResponse.json({ success: true, product: newProduct });

  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message || "Something went completely wrong." }, { status: 500 });
  }
}