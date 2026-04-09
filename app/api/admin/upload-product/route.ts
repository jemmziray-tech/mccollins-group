import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    // 1. Grab the form data sent from the Admin UI
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const brand = formData.get('brand') as string;
    const category = formData.get('category') as string;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // 2. Prepare the file for Supabase
    // We give it a unique name using Date.now() so files don't overwrite each other
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Convert the file into a buffer that Supabase can read
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Upload the image to the Supabase "products" bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Supabase Error:", uploadError);
      return NextResponse.json({ error: "Failed to upload image to Supabase" }, { status: 500 });
    }

    // 4. Get the public URL of the image we just uploaded
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    // 5. Save everything to Prisma!
    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        brand,
        category,
        imageUrl: publicUrl, // We save the Supabase link, NOT the actual image file!
      }
    });

    // 6. Tell the frontend it was a success
    return NextResponse.json({ success: true, product: newProduct });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Something went completely wrong." }, { status: 500 });
  }
}