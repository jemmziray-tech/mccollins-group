import Provider from "./components/Provider";
import SiteHeader from "./components/SiteHeader";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. IMPORT THE PROVIDER
import { CartProvider } from "./context/CartContext";
import { Inter } from "next/font/google";

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
        <Provider>
          <CartProvider>
            <SiteHeader />
            <main>{children}</main>
          </CartProvider>
        </Provider>
      </body>
    </html>
  );
}