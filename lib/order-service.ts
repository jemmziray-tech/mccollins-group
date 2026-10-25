// lib/order-service.ts
import { prisma } from "@/lib/prisma";

export interface CreateOrderInput {
  items: Array<{
    productId: string;
    quantity: number;
    size?: string | null;
  }>;
  customerName?: string | null;
  customerPhone?: string | null;
  userEmail?: string | null;
  userId?: string | null;
}

export async function processOrderCreation(input: CreateOrderInput) {
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error("Cart is empty or invalid.");
  }

  // Aggregate quantities by product id in case multiple rows with the same product exist
  const itemMap = new Map<string, { quantity: number; size?: string | null }>();
  for (const item of input.items) {
    if (!item.productId || typeof item.productId !== "string") {
      throw new Error("Invalid product in cart.");
    }
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
      throw new Error("Invalid quantity specified.");
    }
    const existing = itemMap.get(item.productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      itemMap.set(item.productId, { quantity: qty, size: item.size || null });
    }
  }

  const productIds = Array.from(itemMap.keys());

  // Run stock validation, server-side pricing, inventory decrement, and order creation inside an atomic Prisma transaction
  return await prisma.$transaction(async (tx) => {
    const dbProducts = await tx.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (dbProducts.length !== productIds.length) {
      throw new Error("One or more items in your cart could not be found.");
    }

    let serverTotal = 0;
    const orderItemsData: Array<{
      productId: string;
      quantity: number;
      size?: string | null;
      priceAtPurchase: number;
    }> = [];

    for (const prod of dbProducts) {
      const itemInfo = itemMap.get(prod.id)!;
      if (!prod.isAvailable) {
        throw new Error(`"${prod.name}" is currently unavailable.`);
      }

      if (prod.stock < itemInfo.quantity) {
        throw new Error(
          `Insufficient stock for "${prod.name}". Available: ${prod.stock}, requested: ${itemInfo.quantity}.`
        );
      }

      const itemTotal = prod.price * itemInfo.quantity;
      serverTotal += itemTotal;

      orderItemsData.push({
        productId: prod.id,
        quantity: itemInfo.quantity,
        size: itemInfo.size,
        priceAtPurchase: prod.price,
      });

      // Atomically decrement stock
      const newStock = prod.stock - itemInfo.quantity;
      await tx.product.update({
        where: { id: prod.id },
        data: {
          stock: newStock,
          isAvailable: newStock > 0 ? prod.isAvailable : false,
        },
      });
    }

    // Resolve user ID if email is provided
    let finalUserId = input.userId || null;
    if (!finalUserId && input.userEmail) {
      const user = await tx.user.findUnique({
        where: { email: input.userEmail.toLowerCase().trim() },
      });
      if (user) {
        finalUserId = user.id;
      }
    }

    const order = await tx.order.create({
      data: {
        totalAmount: serverTotal,
        userId: finalUserId,
        customerName: input.customerName || "Guest User",
        customerPhone: input.customerPhone || "No Phone Provided",
        status: "PENDING",
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return {
      order,
      calculatedTotal: serverTotal,
    };
  });
}
