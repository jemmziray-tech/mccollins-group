export interface OrderItemInput {
  productId: string;
  quantity: number;
  size?: string | null;
}

export function normalizeOrderItems(items: unknown): OrderItemInput[] {
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
    throw new Error("Cart must contain between 1 and 100 items.");
  }
  return items.map((item) => {
    if (!item || typeof item !== "object") throw new Error("Invalid cart item.");
    const productId = item.productId ?? item.id;
    const quantity = item.quantity === undefined ? 1 : item.quantity;
    if (typeof productId !== "string" || !productId.trim()) throw new Error("Invalid product in cart.");
    if ((typeof quantity !== "number" && typeof quantity !== "string") ||
        (typeof quantity === "string" && !quantity.trim()) ||
        !Number.isInteger(Number(quantity)) || Number(quantity) < 1 || Number(quantity) > 100) {
      throw new Error("Quantity must be a whole number between 1 and 100.");
    }
    if (item.size != null && (typeof item.size !== "string" || item.size.length > 50)) {
      throw new Error("Invalid product size.");
    }
    return { productId, quantity: Number(quantity), size: item.size?.trim() || null };
  });
}

// Only pass the server-verified NextAuth session, never a request-body identity.
export function orderOwnerFromSession(session: { user?: unknown } | null): string | null {
  if (!session?.user) return null;
  const user = session.user as { id?: unknown };
  if (typeof user.id !== "string" || !user.id) throw new Error("Please sign in again before placing an order.");
  return user.id;
}
