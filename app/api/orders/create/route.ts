// app/api/orders/create/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processOrderCreation } from "@/lib/order-service";
import { normalizeOrderItems, orderOwnerFromSession } from "@/lib/order-input";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cart, items, customerName, customerPhone } = body;

    const rawItems = Array.isArray(items) ? items : Array.isArray(cart) ? cart : [];
    if (rawItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const parsedItems = normalizeOrderItems(rawItems);
    const session = await getServerSession(authOptions);
    const userId = orderOwnerFromSession(session);

    const { order, calculatedTotal } = await processOrderCreation({
      items: parsedItems,
      customerName: customerName ? String(customerName).trim() : null,
      customerPhone: customerPhone ? String(customerPhone).trim() : null,
      userId,
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        totalAmount: calculatedTotal,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Order Creation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process order" },
      { status: 400 }
    );
  }
}