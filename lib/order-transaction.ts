import type { PrismaClient } from "@prisma/client";
import type { OrderItemInput } from "./order-input";

export interface CreateOrderInput {
  items: OrderItemInput[];
  customerName?: string | null;
  customerPhone?: string | null;
  // Set only from the verified NextAuth session.
  userId?: string | null;
}

export async function createOrder(db: Pick<PrismaClient, "$transaction">, input: CreateOrderInput) {
  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 100) {
    throw new Error("Cart must contain between 1 and 100 items.");
  }
  const quantities = new Map<string, number>();
  const lines = new Map<string, OrderItemInput>();
  for (const item of input.items) {
    if (!item || typeof item.productId !== "string" || !item.productId.trim() ||
        !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100 ||
        (item.size != null && (typeof item.size !== "string" || item.size.length > 50))) {
      throw new Error("Invalid product, quantity, or size in cart.");
    }
    const total = (quantities.get(item.productId) || 0) + item.quantity;
    if (total > 100) throw new Error("Maximum quantity per product is 100.");
    quantities.set(item.productId, total);
    const size = item.size?.trim() || null;
    const key = JSON.stringify([item.productId, size]);
    const line = lines.get(key);
    lines.set(key, { productId: item.productId, size, quantity: (line?.quantity || 0) + item.quantity });
  }

  return db.$transaction(async (tx) => {
    // Reserve in a consistent order to avoid lock inversions across multi-item orders.
    const products = await tx.product.findMany({
      where: { id: { in: [...quantities.keys()] }, archivedAt: null },
      orderBy: { id: "asc" },
    });
    if (products.length !== quantities.size) throw new Error("One or more products are no longer available.");
    for (const product of products) {
      if (!Number.isFinite(product.price) || product.price < 0) throw new Error("Invalid product price.");
      for (const line of lines.values()) {
        if (line.productId === product.id && line.size && product.sizes.length && !product.sizes.includes(line.size)) {
          throw new Error(`Invalid size for "${product.name}".`);
        }
      }
      // PostgreSQL rechecks the predicate after waiting for a concurrent row lock.
      const reserved = await tx.product.updateMany({
        where: {
          id: product.id, archivedAt: null, isAvailable: true,
          stock: { gte: quantities.get(product.id)! }, price: product.price,
        },
        data: { stock: { decrement: quantities.get(product.id)! } },
      });
      if (reserved.count !== 1) throw new Error(`Stock or price changed for "${product.name}". Please refresh your cart.`);
      await tx.product.updateMany({
        where: { id: product.id, stock: 0 }, data: { isAvailable: false },
      });
    }
    const byId = new Map(products.map((product) => [product.id, product]));
    const orderItems = [...lines.values()].map((line) => ({
      ...line, priceAtPurchase: byId.get(line.productId)!.price,
    }));
    const total = orderItems.reduce((sum, line) => sum + line.priceAtPurchase * line.quantity, 0);
    if (!Number.isFinite(total)) throw new Error("Invalid order total.");
    const order = await tx.order.create({
      data: {
        totalAmount: total, userId: input.userId || null,
        customerName: input.customerName || "Guest User",
        customerPhone: input.customerPhone || "No Phone Provided",
        status: "PENDING", items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });
    return { order, calculatedTotal: total };
  });
}
