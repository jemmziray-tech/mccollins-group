import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { productId, isAvailable, stock } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);
    if (stock !== undefined && !isNaN(Number(stock))) {
      updateData.stock = Math.max(0, Number(stock));
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Failed to update product status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}