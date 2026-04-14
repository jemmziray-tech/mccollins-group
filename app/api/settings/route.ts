// app/api/settings/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { elevatorPitch } = await request.json();

    // Upsert means: "Update it if it exists, Create it if it doesn't"
    const settings = await prisma.storeSettings.upsert({
      where: { id: "global" },
      update: { elevatorPitch },
      create: { id: "global", elevatorPitch },
    });

    return NextResponse.json({ success: true, settings }, { status: 200 });
  } catch (error) {
    console.error("Settings Update Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}