// app/api/bespoke/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.whatsapp || !data.clientName) {
      return NextResponse.json({ error: "Missing contact details" }, { status: 400 });
    }

    // Save the bespoke request to your database
    await prisma.bespokeRequest.create({
      data: { 
        clientName: data.clientName,
        whatsapp: data.whatsapp,
        productName: data.productName,
        measurements: data.measurements,
        designNotes: data.designNotes
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Bespoke Error:", error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}


export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    
    if (!id || !status) {
      return NextResponse.json({ error: "Missing ID or Status" }, { status: 400 });
    }

    // Update the specific request in the database
    await prisma.bespokeRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Bespoke Update Error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}