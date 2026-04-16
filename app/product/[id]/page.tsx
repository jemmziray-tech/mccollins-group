import React from "react";
import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Footer from "@/app/components/SiteFooter";
import ProductClient from "./ProductClient";
import ProductRecommendations from "@/app/components/ProductRecommendations"; // 🟢 IMPORT THE CAROUSEL

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!product) return { title: 'Product Not Found | McCollins Group' };

  return {
    title: `${product.name} | McCollins Group`,
    description: product.description || `Shop the ${product.name} at McCollins Group.`,
    openGraph: { images: [product.imageUrl] },
  };
}

export default async function ProductDisplayPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!product || !product.isAvailable) notFound(); 

  // Serialize Prisma dates for the Client Component
  const safeProduct = JSON.parse(JSON.stringify(product));

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1A1A1A] flex flex-col pt-24">
      {/* 1. Main Product Section (Interactivity) */}
      <ProductClient product={safeProduct} />
      
      {/* 2. Intelligent Recommendation Section (SEO & Scoring) */}
      <ProductRecommendations 
        currentProductId={product.id} 
        category={product.category} 
        brand={product.brand || ""} 
      />

      <Footer />
    </div>
  );
}