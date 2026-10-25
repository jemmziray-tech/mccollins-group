import { prisma } from "@/lib/prisma";

type IncomingOrderItem = {
  productId: string;
  quantity: number;
  size?: string | null;
};

type CreateOrderPayload = {
  items: IncomingOrderItem[];
  customerName?: string;
  customerPhone?: string;
  userEmail?: string;
};

type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; status: number; error: string };

function normalizeItems(rawItems: unknown): IncomingOrderItem[] | null {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return null;
  }

  const normalized = rawItems.map((item) => {
    const safeItem = item as Record<string, unknown>;
    const quantity = Number(safeItem.quantity);
    const size = typeof safeItem.size === "string" ? safeItem.size.trim() : null;
    const productId =
      typeof safeItem.productId === "string"
        ? safeItem.productId
        : typeof safeItem.id === "string"
          ? safeItem.id
          : "";

    return { productId, quantity, size };
  });

  if (
    normalized.some(
      (item) =>
        !item.productId ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        item.quantity > 100,
    )
  ) {
    return null;
  }

  return normalized;
}

export async function createOrderFromPayload(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  const items = normalizeItems(payload.items);

  if (!items) {
    return { ok: false, status: 400, error: "Invalid cart items." };
  }

  const productIds = Array.from(new Set(items.map((item) => item.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true, isAvailable: true, stock: true },
  });

  if (products.length !== productIds.length) {
    return { ok: false, status: 400, error: "Some products are no longer available." };
  }

  const productsById = new Map(products.map((product) => [product.id, product]));

  let totalAmount = 0;
  for (const item of items) {
    const product = productsById.get(item.productId);
    if (!product || !product.isAvailable) {
      return { ok: false, status: 400, error: "Some products are unavailable." };
    }

    if (product.stock < item.quantity) {
      return { ok: false, status: 400, error: "Insufficient stock for one or more products." };
    }

    totalAmount += product.price * item.quantity;
  }

  const normalizedName = payload.customerName?.trim();
  const normalizedPhone = payload.customerPhone?.trim();

  let userId: string | null = null;
  if (payload.userEmail) {
    const user = await prisma.user.findUnique({
      where: { email: payload.userEmail },
      select: { id: true },
    });
    userId = user?.id ?? null;
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          customerName: normalizedName || "Guest User",
          customerPhone: normalizedPhone || "No Phone Provided",
          totalAmount,
          status: "PENDING",
          items: {
            create: items.map((item) => {
              const product = productsById.get(item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                size: item.size || null,
                priceAtPurchase: product.price,
              };
            }),
          },
        },
      });

      for (const item of items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            isAvailable: true,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count !== 1) {
          throw new Error("INSUFFICIENT_STOCK");
        }
      }

      return createdOrder;
    });

    return { ok: true, orderId: order.id };
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return { ok: false, status: 409, error: "Insufficient stock for one or more products." };
    }
    return { ok: false, status: 500, error: "Failed to save order." };
  }
}
