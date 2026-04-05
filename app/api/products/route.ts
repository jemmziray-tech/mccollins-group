// 1. Force Node.js runtime to prevent any Edge/Prisma crashes
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: This allows your storefront to fetch all products from Supabase
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

// POST: This allows your Admin Panel to save new products to Supabase
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