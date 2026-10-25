// app/api/orders/history/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized: You must be signed in to view your order history." },
        { status: 401 }
      );
    }

    // Fetch orders belonging strictly to the authenticated user's session email
    const orders = await prisma.order.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch order history:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}