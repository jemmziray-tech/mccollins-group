// app/page.tsx
import React, { Suspense } from "react";
import { PrismaClient } from "@prisma/client";
import StoreClient from "./StoreClient";
import StoreSkeleton from "./components/StoreSkeleton"; 

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const revalidate = 60; 

export const metadata = {
  title: "McCollins Group | Timeless Luxury Fashion",
  description: "Shop the latest collections from Colman Looks and exclusive luxury apparel. Delivery across Tanzania.",
};

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { createdAt: 'desc' }
  });

  const safeProducts = JSON.parse(JSON.stringify(products));

  return (
    <Suspense fallback={<StoreSkeleton />}>
      <StoreClient initialProducts={safeProducts} />
    </Suspense>
  );
}