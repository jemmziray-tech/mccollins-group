// app/product/[id]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Footer from "@/app/components/SiteFooter";
import ProductClient from "./ProductClient";

// Secure Database Connection
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Generate Dynamic Metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    return { title: 'Product Not Found | McCollins Group' };
  }

  return {
    title: `${product.name} | McCollins Group`,
    description: product.description || `Shop the ${product.name} at McCollins Group.`,
    openGraph: {
      images: [product.imageUrl],
    },
  };
}

export default async function ProductDisplayPage({ params }: { params: { id: string } }) {
  // INSTANT SERVER FETCH
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product || !product.isAvailable) {
    notFound(); 
  }

  // 🟢 THE FIX: We serialize the Prisma object so the Client Component can safely read it!
  const safeProduct = JSON.parse(JSON.stringify(product));

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1A1A1A] flex flex-col pt-24">
      {/* Pass the SAFE data to our interactive component */}
      <ProductClient product={safeProduct} />
      <Footer />
    </div>
  );
}