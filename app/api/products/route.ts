// app/api/products/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// --- GET: Fetch all products OR a single product ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const product = await prisma.product.findUnique({ where: { id, archivedAt: null } });
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json(product);
    }

    const products = await prisma.product.findMany({
      where: { isAvailable: true, archivedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Database GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// --- POST: Save new products from the Admin Panel ---
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const {
      name,
      price,
      brand,
      imageUrl,
      hoverImageUrl,
      description,
      category,
      collection,
      department,
      sizes,
      sizeType,
      stock,
    } = body;

    if (!name || price === undefined || !brand || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: "Invalid price value" }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        price: parsedPrice,
        brand: brand.trim(),
        imageUrl,
        hoverImageUrl: hoverImageUrl || null,
        description: description || null,
        category: category || "Uncategorized",
        collection: collection && collection !== "None" ? collection : null,
        department: department || "Unisex",
        sizes: Array.isArray(sizes) ? sizes : [],
        sizeType: sizeType || "none",
        isAvailable: true,
        stock: stock !== undefined && !isNaN(Number(stock)) ? Math.max(0, Number(stock)) : 10,
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
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const {
      id,
      name,
      price,
      brand,
      imageUrl,
      hoverImageUrl,
      description,
      category,
      collection,
      department,
      sizes,
      sizeType,
      stock,
      isAvailable,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required for updating" }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json({ error: "Invalid price value" }, { status: 400 });
      }
      updateData.price = parsedPrice;
    }
    if (brand !== undefined) updateData.brand = brand.trim();
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (hoverImageUrl !== undefined) updateData.hoverImageUrl = hoverImageUrl || null;
    if (description !== undefined) updateData.description = description || null;
    if (category !== undefined) updateData.category = category;
    if (collection !== undefined) {
      updateData.collection = collection && collection !== "None" ? collection : null;
    }
    if (department !== undefined) updateData.department = department;
    if (sizes !== undefined) {
      updateData.sizes = Array.isArray(sizes) ? sizes : [];
    }
    if (sizeType !== undefined) updateData.sizeType = sizeType;
    if (stock !== undefined) {
      updateData.stock = Math.max(0, Number(stock));
    }
    if (isAvailable !== undefined) {
      updateData.isAvailable = Boolean(isAvailable);
    }

    const updatedProduct = await prisma.product.update({
      where: { id, archivedAt: null },
      data: updateData,
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Database PUT Error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// --- DELETE: Archive products without destroying purchase history ---
export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id, archivedAt: null } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Keep product and images so previous purchases remain readable.
    await prisma.product.update({
      where: { id, archivedAt: null },
      data: { archivedAt: new Date(), isAvailable: false },
    });
    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath(`/product/${id}`);
    return NextResponse.json({ message: "Product archived. Order history and images preserved." });
  } catch (error) {
    console.error("Product archive error:", error);
    return NextResponse.json({ error: "Failed to archive product" }, { status: 500 });
  }
}

// --- PATCH: Toggle Product Visibility ---
export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { id, isAvailable, stock } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);
    if (stock !== undefined) updateData.stock = Math.max(0, Number(stock));

    const updatedProduct = await prisma.product.update({
      where: { id, archivedAt: null },
      data: updateData,
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Database PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update product status" }, { status: 500 });
  }
}