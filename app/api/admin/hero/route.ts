export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- GET: Fetch the live campaign for the Homepage ---
export async function GET() {
  try {
    let campaign = await prisma.heroCampaign.findUnique({
      where: { id: "main_campaign" }
    });

    // Fallback: If it doesn't exist yet, create the default one instantly!
    if (!campaign) {
      campaign = await prisma.heroCampaign.create({
        data: { id: "main_campaign" }
      });
    }
    
    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Hero GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

// --- POST: Update the campaign from the Admin Dashboard ---
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const buttonText = formData.get('buttonText') as string;
    const buttonLink = formData.get('buttonLink') as string;
    const file = formData.get('image') as File | null;
    let existingImageUrl = formData.get('existingImageUrl') as string;

    // If the admin uploaded a NEW image, send it to Supabase!
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from('products') // We will just use your existing products bucket for simplicity
        .upload(fileName, buffer, { contentType: file.type });

      if (uploadError) throw new Error("Hero image upload failed");

      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
      existingImageUrl = data.publicUrl; // Overwrite with the new Supabase URL
    }

    // Update the database with the new campaign!
    const updatedCampaign = await prisma.heroCampaign.upsert({
      where: { id: "main_campaign" },
      update: { 
        title, subtitle, buttonText, buttonLink, backgroundImage: existingImageUrl 
      },
      create: { 
        id: "main_campaign", title, subtitle, buttonText, buttonLink, backgroundImage: existingImageUrl 
      }
    });

    return NextResponse.json({ success: true, campaign: updatedCampaign });

  } catch (error: any) {
    console.error("Hero POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update campaign" }, { status: 500 });
  }
}