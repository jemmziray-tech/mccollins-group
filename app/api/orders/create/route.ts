// app/api/orders/create/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// This safely handles Prisma connections in Next.js so it doesn't crash in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 🟢 THE UPGRADE: We are now catching the guest details from the frontend!
    const { cart, totalAmount, userEmail, customerName, customerPhone } = body;

    // 1. Try to find the user if they are logged in
    let userId = null;
    if (userEmail) {
      const user = await prisma.user.findUnique({ where: { email: userEmail } });
      if (user) userId = user.id;
    }

    // 2. Create the Order and the Nested Items in one database transaction!
    const order = await prisma.order.create({
      data: {
        totalAmount: totalAmount,
        userId: userId, // Will be null if they are a guest
        customerName: customerName || "Guest User", // 🟢 Saved!
        customerPhone: customerPhone || "No Phone Provided", // 🟢 Saved!
        status: "PENDING",
        items: {
          create: cart.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            size: item.size || null,
            priceAtPurchase: item.price,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("🚨 SILENT ORDER ERROR:", error);
    // We return 500, but our frontend will ignore it so the WhatsApp sale still happens
    return NextResponse.json({ error: "Database save failed" }, { status: 500 });
  }
}