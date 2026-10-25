import { NextResponse } from "next/server";
import { createOrderFromPayload } from "@/lib/order-processing";
import { getServerAuthSession } from "@/lib/server-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = await getServerAuthSession();
    const items = Array.isArray(body?.items)
      ? body.items
      : Array.isArray(body?.cart)
        ? body.cart.map((item: any) => ({
            productId: item?.productId || item?.id,
            quantity: item?.quantity,
            size: item?.size,
          }))
        : [];

    const result = await createOrderFromPayload({
      items,
      customerName: body?.customerName,
      customerPhone: body?.customerPhone,
      userEmail: session?.user?.email ?? undefined,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      warning: "This endpoint is deprecated. Please use /api/orders/create.",
    });

  } catch (error) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}