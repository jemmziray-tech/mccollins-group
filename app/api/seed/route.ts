import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    { error: "GET /api/seed is disabled for security. Use authenticated POST /api/seed." },
    { status: 405 }
  );
}

export async function POST(request: Request) {
  try {
    const seedSecret = process.env.SEED_SECRET;
    const providedSecret = request.headers.get("x-seed-secret");

    let isAuthorized = false;

    // Check optional seed secret first
    if (seedSecret && providedSecret && seedSecret === providedSecret) {
      isAuthorized = true;
    } else {
      // Check admin session
      const auth = await requireAdmin();
      if (auth.authorized) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized: Admin session or valid x-seed-secret required to seed database." },
        { status: 403 }
      );
    }

    // Check if we already seeded the database so we don't duplicate items
    const count = await prisma.product.count();
    if (count > 0) {
      return NextResponse.json({ message: "Database is already loaded with products!" });
    }

    // Inject starter products
    await prisma.product.createMany({
      data: [
        {
          name: "Classic Men's Jacket",
          brand: "Colman Looks",
          description: "Premium quality jacket for every occasion.",
          price: 45000,
          category: "Jackets & Coats",
          department: "Men",
          collection: "Essentials",
          stock: 15,
          imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80",
        },
        {
          name: "Elegant Summer Dress",
          brand: "Colman Looks",
          description: "Beautiful summer dress made with fine breathable fabric.",
          price: 35000,
          category: "Dresses",
          department: "Women",
          collection: "Trending",
          stock: 12,
          imageUrl: "https://images.unsplash.com/photo-1618932260643-ee46255476d8?auto=format&fit=crop&w=400&q=80",
        },
      ],
    });

    return NextResponse.json({ message: "Success! Starter products added to database." }, { status: 201 });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}