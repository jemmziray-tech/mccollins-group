// app/api/products/bulk/route.ts
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

    // Prisma's createMany securely injects an entire array into the database instantly
    const createdProducts = await prisma.product.createMany({
      data: productsArray,
      skipDuplicates: true, // Prevents crashing if you accidentally double-click
    });

    return NextResponse.json({ success: true, count: createdProducts.count }, { status: 201 });
  } catch (error) {
    console.error("Bulk Database POST Error:", error);
    return NextResponse.json({ error: "Failed to batch save products" }, { status: 500 });
  }
}