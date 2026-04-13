// app/api/marketing/badges/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🟢 NEW: Fetch all badges to display in the Admin Dashboard
export async function GET() {
  try {
    const badges = await prisma.trustBadge.findMany({
      where: { isActive: true },
    });
    return NextResponse.json(badges, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { imageUrl, name } = await request.json();
    if (!imageUrl) return NextResponse.json({ error: "Image URL required" }, { status: 400 });

    const badge = await prisma.trustBadge.create({
      data: { imageUrl, name: name || "Trust Badge", isActive: true },
    });
    return NextResponse.json(badge, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save badge" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.trustBadge.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}