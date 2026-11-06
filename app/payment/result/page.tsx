import Link from "next/link";
import { verifiedPaymentResult } from "@/lib/flutterwave";

export const dynamic = "force-dynamic";

export default async function PaymentResult({
  searchParams,
}: {
  searchParams: Promise<{ result?: string; sig?: string }>;
}) {
  const { result, sig } = await searchParams;
  const trusted = result && verifiedPaymentResult(result, sig);
  const paid = trusted && result === "paid";
  const failed = trusted && result === "failed";

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-6 pt-40 pb-20 text-[#1A1A1A]">
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-lg p-10 text-center shadow-sm">
        <h1 className="text-3xl font-serif mb-4">
          {paid ? "Payment confirmed" : failed ? "Payment not completed" : "Payment is being verified"}
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          {paid
            ? "Flutterwave has confirmed your payment. McCollins Group will contact you about delivery."
            : failed
              ? "Your online payment was unsuccessful or cancelled. You can return to your bag to try again."
              : "We haven't confirmed a successful payment yet. If you were charged, do not pay a second time; contact McCollins with your transaction reference so we can check it."}
        </p>
        <Link href="/" className="inline-block bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest rounded">
          Back to shopping
        </Link>
      </div>
    </main>
  );
}
