// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Components & Context Providers
import Provider from "./components/Provider";
import { CartProvider } from "./context/CartContext";
import SiteHeader from "./components/SiteHeader";

// Font Configurations
const inter = Inter({ subsets: ["latin"] });
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "McCollins Group | Timeless Menswear",
  description: "Curated premium menswear, formal shoes, and accessories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className={inter.className}>
        {/* NextAuth Session Provider */}
        <Provider>
          {/* Shopping Cart Provider */}
          <CartProvider>
            
            {/* Our shiny new dynamic Navbar! */}
            <SiteHeader />
            
            {/* The rest of the website */}
            <main>{children}</main>
            
          </CartProvider>
        </Provider>
      </body>
    </html>
  );
}