import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    // 1. Security Check: Who is placing the order?
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return new NextResponse("You must be logged in to checkout", { status: 401 });
    }

    // 2. Find the exact user in the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // 3. Get the Cart data from the frontend
    const body = await req.json();
    const { cart } = body;

    if (!cart || cart.length === 0) {
      return new NextResponse("Cart is empty", { status: 400 });
    }

    // 4. Calculate the total price
    const totalAmount = cart.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);

    // 5. THE MAGIC: Save the Order AND the Items to the database at the same time!
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: totalAmount,
        status: "PENDING",
        items: {
          create: cart.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity || 1, 
            priceAtPurchase: item.price
          }))
        }
      }
    });

    return NextResponse.json(order);

  } catch (error) {
    console.error("CHECKOUT_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
