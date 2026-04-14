// app/api/settings/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { elevatorPitch, brandVideoUrl } = await request.json(); // 🟢 ADDED brandVideoUrl

    const settings = await prisma.storeSettings.upsert({
      where: { id: "global" },
      update: { elevatorPitch, brandVideoUrl }, // 🟢 ADDED brandVideoUrl
      create: { id: "global", elevatorPitch, brandVideoUrl }, // 🟢 ADDED brandVideoUrl
    });

    return NextResponse.json({ success: true, settings }, { status: 200 });
  } catch (error) {
    console.error("Settings Update Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}