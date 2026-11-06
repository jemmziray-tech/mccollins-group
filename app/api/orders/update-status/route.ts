// app/api/orders/update-status/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const manualStatuses = new Set(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"]);
const paidTransitions: Record<string, string[]> = {
  PAID: ["PAID_PROCESSING", "PAID_COMPLETED"],
  PAID_PROCESSING: ["PAID_COMPLETED"],
  PAID_COMPLETED: [],
};

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { orderId, newStatus } = body;
    if (typeof orderId !== "string" || !orderId ||
        typeof newStatus !== "string" || !newStatus) {
      return NextResponse.json({ error: "Valid orderId and newStatus are required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const allowed = order.status in paidTransitions
      ? paidTransitions[order.status].includes(newStatus)
      : manualStatuses.has(order.status) && manualStatuses.has(newStatus);
    if (!allowed) {
      return NextResponse.json({
        error: "Payment-controlled statuses cannot be changed manually. Verify payment through Flutterwave.",
      }, { status: 409 });
    }
    const updated = await prisma.order.updateMany({
      where: { id: orderId, status: order.status },
      data: { status: newStatus },
    });
    if (updated.count !== 1) {
      return NextResponse.json({ error: "Order status changed; refresh and try again." }, { status: 409 });
    }
    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
