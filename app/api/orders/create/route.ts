// app/api/orders/create/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processOrderCreation } from "@/lib/order-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cart, items, customerName, customerPhone, userEmail } = body;

    const rawItems = Array.isArray(items) ? items : Array.isArray(cart) ? cart : [];
    if (rawItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Normalized items
    const parsedItems = rawItems.map((item: any) => ({
      productId: item.productId || item.id,
      quantity: Number(item.quantity) || 1,
      size: item.size || null,
    }));

    // If an authenticated session exists, prioritize the session user
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email;
    const finalEmail = sessionEmail || (typeof userEmail === "string" ? userEmail : undefined);
    const finalUserId = (session?.user as any)?.id || undefined;

    const { order, calculatedTotal } = await processOrderCreation({
      items: parsedItems,
      customerName: customerName ? String(customerName).trim() : null,
      customerPhone: customerPhone ? String(customerPhone).trim() : null,
      userEmail: finalEmail,
      userId: finalUserId,
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