import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // 1. Get the data from the frontend form
    const body = await request.json();
    const { email, name, password, role } = body;

    if (!email || !name || !password) {
      return new NextResponse("Missing information", { status: 400 });
    }

    // 2. Check if the email is already registered
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (existingUser) {
      return new NextResponse("Email already exists", { status: 400 });
    }

    // 3. SECURE THE PASSWORD (Hash it)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Save the user to the database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        // If they register from the public page, force them to be a CUSTOMER
        role: role || "CUSTOMER" 
      }
    });

    return NextResponse.json(user);

  } catch (error: any) {
    console.error("REGISTRATION_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}