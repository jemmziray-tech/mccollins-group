import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Check if we already seeded the database so we don't duplicate items
    const count = await prisma.product.count();
    if (count > 0) {
      return NextResponse.json({ message: "Database is already loaded with products!" });
    }

    // 2. Inject your starter products into the database
    await prisma.product.createMany({
      data: [
        {
          name: "Classic Men's Jacket",
          brand: "Colman Looks",
          description: "Premium quality jacket for every occasion.",
          price: 45000,
          imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80"
        },
        {
          name: "Premium Grade Rice (25kg)",
          brand: "Nataka Afya",
          description: "High quality grains for your home.",
          price: 65000,
          imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&w=400&q=80"
        },
        {
          name: "Hardcover Notebook Set",
          brand: "Akili Hub",
          description: "Essential stationery to empower minds.",
          price: 15000,
          imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80"
        },
        {
          name: "Elegant Summer Dress",
          brand: "Colman Looks",
          description: "Beautiful summer dress.",
          price: 35000,
          imageUrl: "https://images.unsplash.com/photo-1618932260643-ee46255476d8?auto=format&fit=crop&w=400&q=80"
        }
      ]
    });

    return NextResponse.json({ message: "Success! Starter products added to database." });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}