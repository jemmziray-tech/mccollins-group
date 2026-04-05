// app/components/SiteHeader.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart, UserCircle } from "lucide-react"; // Import UserCircle

// Assuming you still have the cart context wired up from before
import { useCart } from "../context/CartContext"; 

export default function SiteHeader() {
  const { cartCount, setIsCartOpen } = useCart();

  // Phase 3 placeholder: Right now, we simulate being 'not logged in'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);

  return (
    <nav className="bg-[#131921] text-white flex items-center justify-between px-6 py-3 sticky top-0 z-50 shadow-md">
      
      {/* Left: Logo */}
      <Link href="/" className="flex items-center border border-transparent hover:border-white p-1 rounded transition-colors">
        <h1 className="text-2xl font-bold tracking-tighter">
          McCollins<span className="text-[#febd69]">.</span>
        </h1>
      </Link>

      {/* Right: Dynamic User and Cart Section */}
      <div className="flex items-center gap-6">
        
        {/* New Dynamic User Section */}
        {isLoggedIn ? (
          // IF LOGGED IN: Show Profile Picture or Icon
          <Link href="/customer" className="group">
            {userProfilePic ? (
              <img 
                src={userProfilePic} 
                alt="Customer Profile" 
                className="w-9 h-9 rounded-full border-2 border-transparent group-hover:border-[#febd69] transition-all object-cover" 
              />
            ) : (
              <UserCircle className="w-9 h-9 text-gray-400 group-hover:text-[#febd69] transition-colors" />
            )}
          </Link>
        ) : (
          // IF NOT LOGGED IN: Show Professional Sign-in Link
          <Link href="/login" className="text-sm font-medium border border-transparent hover:border-white p-1 rounded transition-colors">
            <span className="text-[#CCCCCC] text-[11px] block leading-tight font-light">Hello, Guest</span>
            <span className="font-bold">Sign in / Register</span>
          </Link>
        )}
        
        {/* Cart Icon (Always visible) */}
        <div onClick={() => setIsCartOpen(true)} className="flex items-center relative cursor-pointer border border-transparent hover:border-white p-1 rounded transition-colors duration-200">
          <ShoppingCart className="w-7 h-7" />
          {/* Floating Cart Number Badge */}
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#f08804] text-[#0F1111] text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {cartCount} 
            </span>
          )}
          <span className="font-bold ml-1 hidden lg:block">Cart</span>
        </div>

      </div>
    </nav>
  );
}
