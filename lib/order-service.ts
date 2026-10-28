import { prisma } from "@/lib/prisma";
import { createOrder } from "./order-transaction";
import type { CreateOrderInput } from "./order-transaction";

export type { CreateOrderInput } from "./order-transaction";

export function processOrderCreation(input: CreateOrderInput) {
  return createOrder(prisma, input);
}
