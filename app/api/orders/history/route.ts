// app/api/orders/history/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required to fetch history." }, { status: 400 });
    }

    // Fetch orders belonging ONLY to this user email, sorted by newest first
    const orders = await prisma.order.findMany({
      where: {
        user: {
          email: email
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        items: {
          include: {
            product: true // 🟢 This pulls in the product name, image, and price for the dashboard!
          }
        }
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch order history:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}