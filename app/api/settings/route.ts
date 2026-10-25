// app/api/settings/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: "global" },
    });
    return NextResponse.json(settings || {});
  } catch (error) {
    console.error("Settings GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { elevatorPitch, brandVideoUrl } = await request.json();

    const settings = await prisma.storeSettings.upsert({
      where: { id: "global" },
      update: {
        elevatorPitch: elevatorPitch !== undefined ? elevatorPitch : undefined,
        brandVideoUrl: brandVideoUrl !== undefined ? brandVideoUrl : undefined,
      },
      create: {
        id: "global",
        elevatorPitch: elevatorPitch || null,
        brandVideoUrl: brandVideoUrl || null,
      },
    });

    return NextResponse.json({ success: true, settings }, { status: 200 });
  } catch (error) {
    console.error("Settings Update Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}