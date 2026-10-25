// app/api/orders/update-status/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";

export async function PATCH(req: Request) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const body = await req.json();
    const { orderId, newStatus } = body;

    // Updates the specific order's status in the database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}