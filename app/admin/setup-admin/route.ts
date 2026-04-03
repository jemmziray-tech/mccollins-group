import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// @ts-ignore - Mute the typescript warning for the hasher
import bcrypt from "bcryptjs"; // NOTE: Change "bcryptjs" to "bcrypt" if that is what you used in your login file!

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("key");

  if (secret !== "mccollins-super-secret-123") {
    return new NextResponse("Unauthorized. Nice try!", { status: 401 });
  }

  try {
    const hashedPassword = await bcrypt.hash("MySecurePassword123!", 10);

    // Added "as any" here to mute Prisma's strict type checking
    const admin = await (prisma.user as any).upsert({
      where: { email: "jem.mziray@gmail.com" },
      update: {
        role: "ADMIN",
        password: hashedPassword, 
      },
      create: {
        name: "John Mziray",
        email: "jem.mziray@gmail.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Admin account created successfully in production!",
      email: admin.email
    });

  } catch (error) {
    console.error(error);
    return new NextResponse("Error creating admin", { status: 500 });
  }
}