import { NextResponse } from "next/server";
import { verifyFlutterwaveWebhook, reconcileFlutterwavePayment } from "@/lib/flutterwave";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyFlutterwaveWebhook(rawBody, request.headers)) {
    return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
  }
  try {
    const payload = JSON.parse(rawBody);
    const transactionId = Number(payload?.data?.id);
    if (!Number.isSafeInteger(transactionId) || transactionId <= 0) {
      return NextResponse.json({ error: "Invalid transaction payload" }, { status: 400 });
    }
    await reconcileFlutterwavePayment(transactionId);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Flutterwave webhook verification failed:", error);
    // Non-2xx tells Flutterwave to retry later rather than silently losing an event.
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
