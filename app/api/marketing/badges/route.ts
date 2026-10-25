// app/api/marketing/badges/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const badges = await prisma.trustBadge.findMany({
      where: { isActive: true },
    });
    return NextResponse.json(badges, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch badges:", error);
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { imageUrl, name } = await request.json();
    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL required" }, { status: 400 });
    }

    const badge = await prisma.trustBadge.create({
      data: {
        imageUrl,
        name: (name || "Trust Badge").trim(),
        isActive: true,
      },
    });
    return NextResponse.json(badge, { status: 201 });
  } catch (error) {
    console.error("Failed to save badge:", error);
    return NextResponse.json({ error: "Failed to save badge" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.trustBadge.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete badge:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}