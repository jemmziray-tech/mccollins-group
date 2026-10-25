// app/api/products/bulk/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const productsArray = await request.json();

    if (!Array.isArray(productsArray) || productsArray.length === 0) {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }

    const safeProducts = productsArray.map((p: any) => ({
      name: (p.name || "McCollins Exclusive").trim(),
      price: Math.max(0, Number(p.price) || 0),
      brand: (p.brand || "McCollins").trim(),
      imageUrl: p.imageUrl,
      hoverImageUrl: p.hoverImageUrl || null,
      description: p.description || null,
      category: p.category || "Uncategorized",
      collection: p.collection && p.collection !== "None" ? p.collection : null,
      department: p.department || "Unisex",
      sizeType: p.sizeType || "clothing",
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
      isAvailable: true,
      stock: p.stock !== undefined && !isNaN(Number(p.stock)) ? Math.max(0, Number(p.stock)) : 10,
    }));

    const createdProducts = await prisma.product.createMany({
      data: safeProducts,
      skipDuplicates: true,
    });

    return NextResponse.json({ success: true, count: createdProducts.count }, { status: 201 });
  } catch (error) {
    console.error("Bulk Database POST Error:", error);
    return NextResponse.json({ error: "Failed to batch save products" }, { status: 500 });
  }
}