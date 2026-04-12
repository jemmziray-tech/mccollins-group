// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

// Components & Context Providers
import Provider from "./components/Provider";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext"; 
import SiteHeader from "./components/SiteHeader";

// 🟢 THE UPGRADE: Luxury Font Configurations
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter", // Set as a variable for Tailwind
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair", // Set as a variable for Tailwind
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Heavy-hitting SEO & Social Media Metadata
export const metadata: Metadata = {
  title: "McCollins Group | Timeless Luxury Fashion",
  description: "Welcome to the official McCollins Group store. Shop premium menswear, dresses, tailored suits, bags, and the exclusive Colman Looks collection. Fast delivery across Tanzania.",
  keywords: "McCollins, McCollins Group, McCollins Tanzania, McCollins Fashion, Colman Looks, Luxury Clothing Tanzania, Menswear Dar es Salaam",
  openGraph: {
    title: "McCollins Group | Timeless Luxury Fashion",
    description: "The official online store for McCollins Group. Elevate your everyday outfits.",
    url: "https://mccollins-group.vercel.app", 
    siteName: "McCollins Group",
    images: [
      {
        url: "/apple-touch-icon.png", 
        width: 800,
        height: 600,
        alt: "McCollins Group Official Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 🟢 Moved the comment out here where it is safe!
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="font-sans antialiased">
        {/* NextAuth Session Provider */}
        <Provider>
          
          {/* Shopping Cart Provider */}
          <CartProvider>
            
            {/* Wishlist Provider wrapping the entire site! */}
            <WishlistProvider>
              
              {/* Our shiny new dynamic Navbar! */}
              <SiteHeader />
              
              {/* The rest of the website */}
              <main>{children}</main>
              
            </WishlistProvider>
            
          </CartProvider>
          
        </Provider>
      </body>
    </html>
  );
}