// app/api/cart/save/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { whatsapp, cartItems } = await request.json();
    
    if (!whatsapp || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Missing data or empty cart" }, { status: 400 });
    }

    // Save the guest's cart to your database
    await prisma.savedCart.create({
      data: { 
        whatsapp, 
        cartItems 
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Cart Save Error:", error);
    return NextResponse.json({ error: "Failed to save cart" }, { status: 500 });
  }
}