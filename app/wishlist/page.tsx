"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Heart, ShoppingCart, Trash2, Loader2, HeartCrack } from "lucide-react";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F8FA] font-sans pt-24">
        <Loader2 className="w-10 h-10 animate-spin text-gray-400 mb-4" />
      </div>
    );
  }

  return (
    // 🟢 THE FIX: Added pt-24 md:pt-32 right here to clear the fixed header!
    <div className="min-h-screen bg-[#F7F8FA] font-sans text-black flex flex-col pt-24 md:pt-32">
      
      {/* HEADER BANNER */}
      <div className="bg-black text-white py-10 px-4 md:px-8 mt-[-1px]">
        <div className="max-w-[1400px] mx-auto flex items-center gap-4">
          <Heart className="w-8 h-8 text-[#E3000F] fill-[#E3000F]" />
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase mb-1">My Wishlist</h1>
            <p className="text-gray-400 font-medium text-sm">
              {wishlistCount} {wishlistCount === 1 ? 'Item' : 'Items'} Saved
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-grow max-w-[1400px] mx-auto w-full px-4 md:px-8 py-10">
        
        {wishlist.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-gray-50 p-6 rounded-full mb-6">
              <HeartCrack className="w-16 h-16 text-gray-300" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-wider mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 max-w-md mb-8">
              Found something you love but not ready to buy? Tap the heart icon on any product to save it here for later.
            </p>
            <Link href="/">
              <button className="bg-black hover:bg-zinc-800 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-[13px] transition-transform active:scale-95 shadow-lg shadow-black/10">
                Discover Latest Arrivals
              </button>
            </Link>
          </div>
        ) : (
          /* FILLED STATE (GRID) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                
                {/* Image Container */}
                <div className="relative aspect-square bg-[#F8F8F8] p-4 flex items-center justify-center border-b border-gray-100">
                  <Image 
                    src={item.imageUrl} 
                    alt={item.name} 
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 p-4" 
                  />
                  
                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors z-10"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Product Details */}
                <div className="p-5 flex flex-col flex-grow">
                  <Link href={`/product/${item.id}`} className="hover:underline">
                    <span className="text-[#E3000F] font-bold text-[10px] uppercase tracking-widest mb-1 block">{item.brand}</span>
                    <h3 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2">{item.name}</h3>
                  </Link>
                  <div className="text-xl font-bold text-[#0F1111] mb-6 mt-auto">
                    <span className="text-[10px] align-top relative top-1 mr-1 text-gray-500">TSH</span> 
                    {Number(item.price).toLocaleString()}
                  </div>
                  
                  {/* Action Button */}
                  <button 
                    onClick={() => handleMoveToCart(item)}
                    className="w-full bg-transparent hover:bg-black border-2 border-black text-black hover:text-white py-3 rounded-lg font-bold uppercase tracking-widest text-[11px] transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" /> Move to Cart
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