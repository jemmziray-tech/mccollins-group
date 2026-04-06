// app/api/products/route.ts

// 1. Force Node.js runtime to prevent any Edge/Prisma crashes
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// --- GET: Fetch all products for the storefront and admin ---
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Database GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// --- POST: Save new products from the Admin Panel ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, brand, imageUrl, description, category, sizeType } = body;

    // Validate required fields
    if (!name || !price || !brand || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save to database
    const newProduct = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        brand,
        imageUrl,
        description: description || null,
        category: category || "Uncategorized",
        sizeType: sizeType || "none",
        isAvailable: true,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Database POST Error:", error);
    return NextResponse.json({ error: "Failed to save product to database" }, { status: 500 });
  }
}

// --- DELETE: Remove products via the Admin Panel ---
export async function DELETE(request: Request) {
  try {
    // Extract the ID from the URL (e.g., /api/products?id=123)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Delete from database
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Database DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
