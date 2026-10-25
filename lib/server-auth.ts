import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";

export async function getServerAuthSession() {
  return getServerSession(authOptions);
}

export async function requireAdmin() {
  const session = await getServerAuthSession();
  const isRoleAdmin = session?.user && (session.user as any).role === "ADMIN";
  const isEmailBasedAdmin = isAdminEmail(session?.user?.email);

  if (!session?.user || (!isRoleAdmin && !isEmailBasedAdmin)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return null;
}
