import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";

export async function PATCH(req: Request) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { productId, isAvailable } = await req.json();
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isAvailable: isAvailable },
    });
    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}