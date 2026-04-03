import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, brand, imageUrl, description } = body;

    // Save to Supabase
    const newProduct = await prisma.product.create({
      data: {
        name,
        price: Number(price), // Ensures price is a number
        brand,
        imageUrl: imageUrl || "",
        description: description || "",
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    // This will print the EXACT reason it failed to your VS Code terminal!
    console.error("Database POST Error:", error);
    return NextResponse.json({ error: "Failed to save product" }, { status: 500 });
  }
}