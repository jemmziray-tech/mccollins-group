import { NextResponse } from "next/server";
import { verifyWebhookSecret, reconcileFlutterwavePayment } from "@/lib/flutterwave";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!verifyWebhookSecret(request.headers.get("verif-hash"))) {
    return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
  }
  try {
    const payload = await request.json();
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
