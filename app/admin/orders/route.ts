import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
// Using the '@' shortcut so it never loses the path!
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Fetch ALL orders for the Admin dashboard
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Security check: Only let Admins pull this data
    if (session?.user?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Pull every order from the database, newest first
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true, // Pulls in the customer's name and email
        items: {
          include: { product: true }
        }
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("ADMIN_ORDERS_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH: Update an order's status (e.g., Pending -> Shipped)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return new NextResponse("Missing data", { status: 400 });
    }

    // Update the specific order in the database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("ADMIN_ORDERS_PATCH_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}