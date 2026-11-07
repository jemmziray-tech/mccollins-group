import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

const FLUTTERWAVE_API = "https://api.flutterwave.com/v3";
const REF_PREFIX = "MCC-";
export const PAYMENT_PENDING = "AWAITING_PAYMENT";
export const PAYMENT_PAID = "PAID";
export const PAYMENT_FAILED = "PAYMENT_FAILED";

export function paymentConfigured() {
  return Boolean(process.env.FLW_SECRET_KEY && process.env.FLW_SECRET_HASH);
}

export function checkoutOrigin() {
  const origin = process.env.PAYMENT_PUBLIC_ORIGIN || "https://mccollins-group.vercel.app";
  const parsed = new URL(origin);
  if (parsed.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && parsed.origin === "http://localhost:3000")) {
    throw new Error("PAYMENT_PUBLIC_ORIGIN must use HTTPS.");
  }
  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("PAYMENT_PUBLIC_ORIGIN must be a plain origin.");
  }
  return parsed.origin;
}

function secretKey() {
  if (!paymentConfigured()) throw new Error("Online payments are not configured.");
  return process.env.FLW_SECRET_KEY!;
}

function safeEqual(expected: string, received: string | null): boolean {
  if (!received) return false;
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

// Newer Flutterwave webhooks use an HMAC over the raw body.
// Legacy v3 events use the verif-hash shared-secret header.
export function verifyFlutterwaveWebhook(rawBody: string, headers: Headers): boolean {
  const secret = process.env.FLW_SECRET_HASH;
  if (!secret) return false;
  const signature = headers.get("flutterwave-signature");
  if (signature) {
    const expected = createHmac("sha256", secret).update(rawBody).digest("base64");
    return safeEqual(expected, signature);
  }
  return safeEqual(secret, headers.get("verif-hash"));
}

export function signPaymentResult(result: string): string {
  const secret = process.env.FLW_SECRET_HASH;
  if (!secret) throw new Error("Payment results are not configured.");
  return createHmac("sha256", secret).update(result).digest("hex");
}

export function verifiedPaymentResult(result: string, signature: string | undefined): boolean {
  if (!signature || !process.env.FLW_SECRET_HASH) return false;
  return safeEqual(signPaymentResult(result), signature);
}

export function orderReference(orderId: string) {
  return REF_PREFIX + orderId;
}

export async function createFlutterwaveLink(input: {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}) {
  const requestBody = {
    tx_ref: orderReference(input.orderId),
    amount: input.amount,
    currency: "TZS",
    redirect_url: checkoutOrigin() + "/api/payments/flutterwave/return",
    payment_options: "card, mobilemoneytanzania",
    link_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    customer: {
      email: input.customerEmail,
      name: input.customerName,
      phonenumber: input.customerPhone,
    },
    customizations: {
      title: "McCollins Group",
      description: "Secure payment for your McCollins fashion order",
    },
    meta: { order_id: input.orderId },
  };

  const response = await fetch(FLUTTERWAVE_API + "/payments", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + secretKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.status !== "success" || !result?.data?.link) {
    throw new Error("Payment provider could not create a checkout session.");
  }
  const link = new URL(result.data.link);
  if (link.protocol !== "https:" || link.hostname !== "checkout.flutterwave.com") {
    throw new Error("Payment provider returned an invalid checkout URL.");
  }
  return link.toString();
}

export async function verifyFlutterwaveById(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid transaction ID.");
  const response = await fetch(FLUTTERWAVE_API + "/transactions/" + id + "/verify", {
    headers: { Authorization: "Bearer " + secretKey() },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.status !== "success" || !result?.data) {
    throw new Error("Unable to verify transaction with payment provider.");
  }
  return result.data as {
    id: number;
    tx_ref: string;
    currency: string;
    amount: number;
    status: string;
  };
}

// Only release inventory if an order is still in payment-pending state.
// The conditional update makes duplicate gateway events idempotent.
export async function releaseReservedOrder(orderId: string, status = PAYMENT_FAILED) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order || order.status !== PAYMENT_PENDING) return false;
    const updated = await tx.order.updateMany({
      where: { id: orderId, status: PAYMENT_PENDING },
      data: { status },
    });
    if (updated.count !== 1) return false;
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity }, isAvailable: true },
      });
    }
    return true;
  });
}

export async function reconcileFlutterwavePayment(transactionId: number, expectedReference?: string) {
  const verified = await verifyFlutterwaveById(transactionId);
  if (expectedReference && verified.tx_ref !== expectedReference) {
    throw new Error("Transaction reference mismatch.");
  }
  if (typeof verified.tx_ref !== "string" || !verified.tx_ref.startsWith(REF_PREFIX)) {
    throw new Error("Unknown payment reference.");
  }
  const orderId = verified.tx_ref.substring(REF_PREFIX.length);
  if (!/^c[a-z0-9]{10,40}$/.test(orderId)) throw new Error("Invalid order reference.");
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order for payment not found.");
  if (["PAID", "PAID_PROCESSING", "PAID_COMPLETED"].includes(order.status)) return { status: "paid", orderId };
  if (order.status !== PAYMENT_PENDING) return { status: "review", orderId };

  if (verified.currency !== "TZS" || !Number.isFinite(Number(verified.amount)) ||
      Number(verified.amount) < order.totalAmount) {
    // Do not release stock: a possible underpayment requires manual review.
    return { status: "review", orderId };
  }
  if (verified.status === "successful") {
    await prisma.order.updateMany({
      where: { id: orderId, status: PAYMENT_PENDING },
      data: { status: PAYMENT_PAID },
    });
    return { status: "paid", orderId };
  }
  if (verified.status === "failed" || verified.status === "cancelled") {
    await releaseReservedOrder(orderId);
    return { status: "failed", orderId };
  }
  return { status: "pending", orderId };
}
