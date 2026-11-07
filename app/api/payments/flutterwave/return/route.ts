import { NextResponse } from "next/server";
import { checkoutOrigin, reconcileFlutterwavePayment, signPaymentResult } from "@/lib/flutterwave";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  let result = "pending";
  try {
    const url = new URL(request.url);
    const id = Number(url.searchParams.get("transaction_id"));
    const txRef = url.searchParams.get("tx_ref") || undefined;
    if (Number.isSafeInteger(id) && id > 0 && txRef) {
      const confirmed = await reconcileFlutterwavePayment(id, txRef);
      result = confirmed.status;
    }
  } catch (error) {
    console.error("Payment return verification failed:", error);
    result = "pending";
  }

  return NextResponse.redirect(new URL("/payment/result?result=" + encodeURIComponent(result) + "&sig=" + signPaymentResult(result), checkoutOrigin()), {
    headers: { "Cache-Control": "no-store" },
  });
}
