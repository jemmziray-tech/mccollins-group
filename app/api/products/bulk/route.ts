// app/api/products/bulk/route.ts

// Force Node.js runtime for Prisma stability
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
  try {
    const productsArray = await request.json();

    if (!Array.isArray(productsArray) || productsArray.length === 0) {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }

    // 🟢 SERVER-SIDE SANITIZATION: We strictly map out only the fields we want, 
    // ensuring types are correct and malicious data is ignored.
    const safeProducts = productsArray.map((p: any) => ({
      name: p.name || "McCollins Exclusive",
      price: Number(p.price) || 0,
      brand: p.brand || "McCollins",
      imageUrl: p.imageUrl,
      description: p.description || null,
      category: p.category || "Uncategorized",
      department: p.department || "Unisex",
      sizeType: p.sizeType || "clothing",
      sizes: Array.isArray(p.sizes) ? p.sizes : [], 
      isAvailable: true,
      // 🟢 NEW: Safely capture stock, fallback to 10 if missing
      stock: p.stock !== undefined ? Number(p.stock) : 10,
    }));

    // Prisma's createMany securely injects the cleaned array into the database instantly
    const createdProducts = await prisma.product.createMany({
      data: safeProducts,
      skipDuplicates: true, // Prevents crashing if you accidentally double-click
    });

    return NextResponse.json({ success: true, count: createdProducts.count }, { status: 201 });
  } catch (error) {
    console.error("Bulk Database POST Error:", error);
    return NextResponse.json({ error: "Failed to batch save products" }, { status: 500 });
  }
}