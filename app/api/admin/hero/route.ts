export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase-server";
import { validateImageFile } from "@/lib/upload-validation";

// --- GET: Fetch the live campaign for the Homepage ---
export async function GET() {
  try {
    let campaign = await prisma.heroCampaign.findUnique({
      where: { id: "main_campaign" },
    });

    if (!campaign) {
      campaign = await prisma.heroCampaign.create({
        data: { id: "main_campaign" },
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
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const formData = await req.formData();

    const title = (formData.get("title") as string) || "Elevate Your Everyday.";
    const subtitle = (formData.get("subtitle") as string) || "Premium fashion curated for Tanzania.";
    const buttonText = (formData.get("buttonText") as string) || "DISCOVER THE COLLECTION";
    const buttonLink = (formData.get("buttonLink") as string) || "/products";
    const file = formData.get("image") as File | null;
    let existingImageUrl = (formData.get("existingImageUrl") as string) || "";

    if (file && file.size > 0) {
      const validation = validateImageFile(file, "hero");
      if (!validation.valid || !validation.safeFileName) {
        return NextResponse.json({ error: validation.error || "Invalid file" }, { status: 400 });
      }

      const fileName = validation.safeFileName;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabaseServer.storage
        .from("products")
        .upload(fileName, buffer, { contentType: file.type });

      if (uploadError) {
        console.error("Supabase Hero upload error:", uploadError);
        throw new Error("Hero image upload failed");
      }

      const { data } = supabaseServer.storage.from("products").getPublicUrl(fileName);
      existingImageUrl = data.publicUrl;
    }

    const updatedCampaign = await prisma.heroCampaign.upsert({
      where: { id: "main_campaign" },
      update: {
        title,
        subtitle,
        buttonText,
        buttonLink,
        ...(existingImageUrl && { backgroundImage: existingImageUrl }),
      },
      create: {
        id: "main_campaign",
        title,
        subtitle,
        buttonText,
        buttonLink,
        backgroundImage: existingImageUrl || "https://images.unsplash.com/photo-1593030761757-71fae4630b05?q=80&w=2000&auto=format&fit=crop",
      },
    });

    return NextResponse.json({ success: true, campaign: updatedCampaign });
  } catch (error: any) {
    console.error("Hero POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update campaign" }, { status: 500 });
  }
}