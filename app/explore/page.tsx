import React from "react";
import { prisma } from "@/lib/prisma";
import ReelFeed from "../components/ReelFeed";
import SiteHeader from "../components/SiteHeader";

export const revalidate = 60; 

export const metadata = {
  title: "Explore | McCollins Group",
  description: "Discover our latest collections in an immersive full-screen experience.",
};

export default async function ExplorePage() {
  // Fetch a mix of trending and latest products for the explore feed
  const products = await prisma.product.findMany({
    where: { isAvailable: true, archivedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 20 // Don't load too many at once
  });

  const safeProducts = JSON.parse(JSON.stringify(products));

  return (
    <div className="bg-black min-h-screen">
      {/* We need the header to be transparent and fixed over the feed */}
      <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none [&>*]:pointer-events-auto">
        <SiteHeader isTransparent />
      </div>
      
      <main>
        <ReelFeed products={safeProducts} />
      </main>
    </div>
  );
}
