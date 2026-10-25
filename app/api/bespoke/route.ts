// app/api/bespoke/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.whatsapp || !data.clientName || !data.productName) {
      return NextResponse.json({ error: "Missing required contact or product details" }, { status: 400 });
    }

    const created = await prisma.bespokeRequest.create({
      data: {
        clientName: String(data.clientName).trim(),
        whatsapp: String(data.whatsapp).trim(),
        productName: String(data.productName).trim(),
        measurements: data.measurements || {},
        designNotes: data.designNotes ? String(data.designNotes).trim() : null,
      },
    });

    return NextResponse.json({ success: true, id: created.id }, { status: 201 });
  } catch (error) {
    console.error("Bespoke Creation Error:", error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Missing ID or Status" }, { status: 400 });
    }

    const updated = await prisma.bespokeRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, request: updated }, { status: 200 });
  } catch (error) {
    console.error("Bespoke Update Error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}