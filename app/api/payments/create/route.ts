import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { normalizeOrderItems, orderOwnerFromSession } from "@/lib/order-input";
import { processOrderCreation } from "@/lib/order-service";
import { createFlutterwaveLink, paymentConfigured, releaseReservedOrder, PAYMENT_PENDING } from "@/lib/flutterwave";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!paymentConfigured()) {
    return NextResponse.json({ error: "Online payments are not active yet. Please use WhatsApp checkout." }, { status: 503 });
  }

  let orderId: string | undefined;
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const area = typeof body.area === "string" ? body.area.trim() : "";
    if (name.length < 2 || name.length > 100 ||
        email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !/^\+?[0-9 ]{9,17}$/.test(phone) ||
        area.length < 2 || area.length > 150) {
      return NextResponse.json({ error: "Please enter valid delivery and contact details." }, { status: 400 });
    }

    const items = normalizeOrderItems(body.cart);
    const session = await getServerSession(authOptions);
    const { order, calculatedTotal } = await processOrderCreation({
      items,
      customerName: name,
      customerPhone: phone + " (" + area + ")",
      userId: orderOwnerFromSession(session),
      status: PAYMENT_PENDING,
    });
    orderId = order.id;

    if (!Number.isSafeInteger(calculatedTotal) || calculatedTotal <= 0) {
      throw new Error("Online checkout requires a positive whole-number total in TZS.");
    }
    const link = await createFlutterwaveLink({
      orderId,
      amount: calculatedTotal,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
    });
    return NextResponse.json({ link, orderId }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (orderId) {
      try {
        await releaseReservedOrder(orderId);
      } catch (releaseError) {
        console.error("Could not release payment reservation:", releaseError);
      }
    }
    console.error("Online checkout initialization failed:", error);
    return NextResponse.json({ error: "Could not start secure payment. Please review stock availability and retry." }, { status: 400 });
  }
}
