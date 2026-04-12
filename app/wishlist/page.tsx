"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Heart, ShoppingCart, Trash2, Loader2, HeartCrack, ChevronRight } from "lucide-react";

import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext"; 
import Footer from "@/app/components/SiteFooter";

export default function WishlistPage() {
  const { status } = useSession();
  
  // PULLING LIVE DATA FROM OUR NEW CONTEXT!
  const { wishlist, removeFromWishlist, wishlistCount } = useWishlist();
  
  // Cart superpowers
  const { addToCart, setIsCartOpen } = useCart();

  const handleMoveToCart = (product: any) => {
    addToCart(product);
    setIsCartOpen(true);
    removeFromWishlist(product.id);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] font-sans pt-24">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37] mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Accessing Collection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1A1A1A] flex flex-col pt-20 md:pt-28">
      
      {/* 🟢 LUXURY HEADER BANNER */}
      <div className="bg-[#0F1115] text-white py-12 md:py-16 px-4 md:px-8 mt-[-1px] border-b border-[#D4AF37]/20">
        <div className="max-w-[1400px] mx-auto">
          {/* Luxury Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/account" className="hover:text-white transition-colors">Account</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#D4AF37]">Wishlist</span>
          </nav>

          <div className="flex items-center gap-5">
            <div className="bg-white/5 p-3 rounded-sm border border-white/10">
              <Heart className="w-8 h-8 text-[#D4AF37] fill-[#D4AF37]" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-serif tracking-tight mb-2">The Personal Edit</h1>
              <p className="text-[#D4AF37] font-bold uppercase tracking-[0.2em] text-[10px]">
                {wishlistCount} {wishlistCount === 1 ? 'Piece' : 'Pieces'} Curated
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-grow max-w-[1400px] mx-auto w-full px-4 md:px-8 py-12">
        
        {wishlist.length === 0 ? (
          /* 🟢 LUXURY EMPTY STATE */
          <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-16 md:p-24 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-[#FDFBF7] p-6 rounded-sm border border-gray-100 mb-8">
              <HeartCrack className="w-12 h-12 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-serif text-[#1A1A1A] mb-4">Your collection is empty.</h2>
            <p className="text-gray-500 max-w-md mb-10 text-sm leading-relaxed">
              Discover pieces you love and select the heart icon to curate your personal McCollins Group collection.
            </p>
            <Link href="/">
              <button className="bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-[#0F1115] px-10 py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-[11px] transition-colors duration-300 shadow-md flex items-center gap-2">
                Discover The Latest
              </button>
            </Link>
          </div>
        ) : (
          /* 🟢 FILLED STATE (GRID) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {wishlist.map((item, index) => (
              <div 
                key={item.id} 
                className="group flex flex-col relative animate-in fade-in fill-mode-both"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                
                {/* Remove Button (Now a subtle floating action) */}
                <button 
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 z-20 p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-sm transition-all hover:scale-110 active:scale-95 group/btn"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 group-hover/btn:text-red-500 transition-colors" />
                </button>

                {/* Image Container */}
                <Link href={`/product/${item.id}`} className="block w-full">
                  <div className="relative bg-[#F8F8F8] aspect-[3/4] w-full overflow-hidden rounded-sm transition-all duration-500 mb-4 border border-transparent group-hover:border-gray-200">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.name} 
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                    />
                  </div>
                  
                  {/* Product Details */}
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-1 block">{item.brand}</span>
                  <h4 className="text-[13px] font-bold text-gray-900 line-clamp-2 leading-tight transition-colors uppercase tracking-wide">{item.name}</h4>
                  <div className="text-sm font-bold text-[#0F1111] mt-2 mb-4">
                    <span className="text-[10px] align-top relative top-[2px] text-gray-500 mr-1">TSH</span> 
                    {Number(item.price).toLocaleString()}
                  </div>
                </Link>
                
                {/* Action Button */}
                <div className="mt-auto pt-2">
                  <button 
                    onClick={() => handleMoveToCart(item)}
                    className="w-full bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-[#0F1115] py-3.5 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] transition-colors duration-300 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
      
      <Footer />
    </div>
  );
}