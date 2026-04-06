import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"; // <-- NEW: Google Auth
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// --- MASTER ADMIN LIST ---
// Put your real Gmail addresses here. 
// Anyone on this list automatically gets full access to the Admin Dashboard.
const ADMIN_EMAILS = ["jem.mziray@gmail.com", "nyombicolins04@gmail.com", "festomcrowland@gmail.com"];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // 1. GOOGLE PROVIDER (For fast Admin logins & Profile Pictures)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true, // Allows users to link their Google account even if the email already exists in the database (useful for Admins who registered with email/password but want to switch to Google SSO)
    }),

    // 2. CREDENTIALS PROVIDER (Your existing custom email/password login)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user?.password) {
          throw new Error("User not found");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image, // Pass their profile picture if they have one
        };
      }
    })
  ],
  callbacks: {
    // TRIGGERED ON LOGIN: Auto-promotes admins in the database
    async signIn({ user, account }) {
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        try {
          // Update the database to ensure they are marked as an Admin forever
          await prisma.user.update({
            where: { email: user.email },
            data: { role: "ADMIN" }
          });
          // Update the immediate object
          (user as any).role = "ADMIN"; 
        } catch (error) {
          // Ignores error if the user is being created for the very first time
        }
      }
      return true;
    },

    // JWT: Secures the session tokens
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "CUSTOMER";
        token.id = user.id;
        token.picture = user.image; // Grabs the Google profile picture!

        // Ultimate failsafe: If they are on the Admin list, force their token to Admin
        if (user.email && ADMIN_EMAILS.includes(user.email)) {
          token.role = "ADMIN";
        }
      }
      return token;
    },

    // SESSION: Sends the secure data to your frontend UI
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        session.user.image = token.picture as string | null | undefined; // Passes the image to the frontend!
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login', // Tells NextAuth to use your custom beautiful login page!
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };