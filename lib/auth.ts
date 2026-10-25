import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { isAdminEmail, getAdminEmails } from "@/lib/admin";

export { isAdminEmail, getAdminEmails };

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // Disabled dangerous account linking unless explicit manual account linking is verified
      allowDangerousEmailAccountLinking: false,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user.email && isAdminEmail(user.email)) {
        try {
          await prisma.user.update({
            where: { email: user.email },
            data: { role: "ADMIN" },
          });
          (user as any).role = "ADMIN";
        } catch (error) {
          console.warn("Could not promote admin during signIn (user may not be committed yet):", error);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "CUSTOMER";
        token.id = user.id;
        token.picture = user.image;

        if (user.email && isAdminEmail(user.email)) {
          token.role = "ADMIN";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        session.user.image = token.picture as string | null | undefined;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const isRoleAdmin = session?.user && (session.user as any).role === "ADMIN";
  const isEmailAdmin = isAdminEmail(email);

  if (!session?.user || (!isRoleAdmin && !isEmailAdmin)) {
    return {
      authorized: false as const,
      session: null,
      response: NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true as const,
    session,
    response: null,
  };
}
