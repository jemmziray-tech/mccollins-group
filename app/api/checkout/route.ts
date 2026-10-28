// app/api/checkout/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processOrderCreation } from "@/lib/order-service";
import { normalizeOrderItems, orderOwnerFromSession } from "@/lib/order-input";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "You must be logged in to checkout" }, { status: 401 });
    }

    const body = await req.json();
    const { cart, items } = body;
    const rawItems = Array.isArray(items) ? items : Array.isArray(cart) ? cart : [];

    if (rawItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const parsedItems = normalizeOrderItems(rawItems);
    const userId = orderOwnerFromSession(session);

    const { order, calculatedTotal } = await processOrderCreation({
      items: parsedItems,
      customerName: session.user.name || null,
      userId,
    });

    return NextResponse.json({
      success: true,
      order,
      totalAmount: calculatedTotal,
    });
  } catch (error: any) {
    console.error("CHECKOUT_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process checkout" },
      { status: 400 }
    );
  }
}