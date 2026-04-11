// app/api/products/route.ts

// 1. Force Node.js runtime to prevent any Edge/Prisma crashes
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (Needed to delete the images!)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Now it ONLY returns products where isAvailable is true!
    const products = await prisma.product.findMany({
      where: { isAvailable: true }, 
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
    const { name, price, brand, imageUrl, hoverImageUrl, description, category, sizeType, stock, department } = body;

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
        hoverImageUrl: hoverImageUrl || null,
        description: description || null,
        category: category || "Uncategorized",
        department: department || "Unisex",
        sizeType: sizeType || "none",
        isAvailable: true,
        // 🟢 NEW: Ensure stock is saved! Default to 10 if not provided.
        stock: stock !== undefined ? Number(stock) : 10,
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
    const { id, name, price, brand, imageUrl, hoverImageUrl, description, category, sizeType, stock, department } = body;

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
        hoverImageUrl: hoverImageUrl !== undefined ? hoverImageUrl : undefined,
        description: description || null,
        category: category || "Uncategorized",
        department: department || "Unisex",
        sizeType: sizeType || "none",
        // 🟢 NEW: Update stock value if provided
        ...(stock !== undefined && { stock: Number(stock) }),
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

    // 1. Find the product FIRST so we can get the image URLs
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 2. Delete the images from Supabase Storage
    const filesToDelete = [];
    
    // Extract the exact filename from the primary image URL
    if (product.imageUrl) {
      const mainFileName = product.imageUrl.split('/').pop();
      if (mainFileName) filesToDelete.push(mainFileName);
    }

    // Extract the exact filename from the hover image URL (if it exists)
    if (product.hoverImageUrl) {
      const hoverFileName = product.hoverImageUrl.split('/').pop();
      if (hoverFileName) filesToDelete.push(hoverFileName);
    }

    // Tell Supabase to permanently delete these files
    if (filesToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('products')
        .remove(filesToDelete);

      if (storageError) {
        console.error("Failed to delete images from Supabase:", storageError);
        // We log the error, but we don't stop the database deletion
      }
    }

    // 3. Delete from database
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product and images deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Database DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

// --- PATCH: Toggle Product Visibility ---
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isAvailable } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Instantly update just the visibility status
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { isAvailable },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Database PATCH Error:", error);
    return NextResponse.json({ error: "Failed to toggle product status" }, { status: 500 });
  }
}