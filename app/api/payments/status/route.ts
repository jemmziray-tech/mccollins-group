import { NextResponse } from "next/server";
import { paymentConfigured } from "@/lib/flutterwave";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const available = paymentConfigured();
  const mode = process.env.FLW_SECRET_KEY?.startsWith("FLWSECK_TEST") ? "test" : "live";
  return NextResponse.json({
    available,
    mode: available ? mode : "unavailable",
    currency: "TZS",
  }, { headers: { "Cache-Control": "no-store" } });
}
