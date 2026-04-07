// app/api/products/route.ts

// 1. Force Node.js runtime to prevent any Edge/Prisma crashes
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// --- GET: Fetch all products OR a single product ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // If an ID is provided, return just that one product (used for the Edit page)
    if (id) {
      const product = await prisma.product.findUnique({ where: { id } });
      return NextResponse.json(product);
    }

    // EXPERT FIX: Now it ONLY returns products where isAvailable is true!
    const products = await prisma.product.findMany({
      where: { isAvailable: true }, // <--- THIS IS THE MAGIC LINE
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

// --- PUT: Update an existing product via the Admin Panel ---
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, price, brand, imageUrl, description, category, sizeType } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required for updating" }, { status: 400 });
    }

    // Update the database
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: Number(price),
        brand,
        imageUrl,
        description: description || null,
        category: category || "Uncategorized",
        sizeType: sizeType || "none",
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Database PUT Error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
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
