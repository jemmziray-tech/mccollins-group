// app/components/SiteHeader.tsx
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, UserCircle, LogOut, LayoutDashboard, User } from "lucide-react";
import { useCart } from "../context/CartContext"; 

export default function SiteHeader() {
  const { cartCount, setIsCartOpen } = useCart();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      console.log("🚨 X-RAY VISION - CURRENT SESSION:", session);
    }
  }, [session]);

  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  
  const ADMIN_EMAILS = [
    "jem.mziray@gmail.com", 
    "festomcrowland@gmail.com", 
    "nyombicolins04@gmail.com"
  ];

  const userRole = (session?.user as { role?: string })?.role;
  const userEmail = session?.user?.email || "";
  const isAdmin = userRole === "ADMIN" || ADMIN_EMAILS.includes(userEmail);
  
  const userProfilePic = session?.user?.image;
  const firstName = session?.user?.name?.split(" ")[0] || "User";

  return (
    // Changed px-6 to px-4 for mobile spacing!
    <nav className="bg-[#131921] text-white flex items-center justify-between px-4 md:px-6 py-3 sticky top-0 z-50 shadow-md">
      
      {/* Left: Logo */}
      <Link href="/" className="flex items-center border border-transparent hover:border-white p-1 rounded transition-colors">
        <h1 className="text-xl md:text-2xl font-bold tracking-tighter">
          McCollins<span className="text-[#febd69]">.</span>
        </h1>
      </Link>

      {/* Right: Dynamic User and Cart Section */}
      <div className="flex items-center gap-3 md:gap-6">
        
        {isLoading ? (
          <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
        ) : isLoggedIn ? (
          <div className="group relative flex items-center gap-2 cursor-pointer border border-transparent hover:border-white p-1 rounded transition-colors pb-2 -mb-2">
            
            {userProfilePic ? (
              <img 
                src={userProfilePic} 
                alt="Profile" 
                className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-transparent group-hover:border-[#febd69] transition-all object-cover" 
              />
            ) : (
              <UserCircle className="w-8 h-8 md:w-9 md:h-9 text-gray-400 group-hover:text-[#febd69] transition-colors" />
            )}
            
            {/* HIDDEN ON MOBILE: text-left */}
            <div className="hidden md:block text-left leading-tight">
              <span className="text-[#CCCCCC] text-[11px] font-light block">Hello, {firstName}</span>
              <span className="font-bold text-sm">Account & Lists</span>
            </div>

            {/* THE DROPDOWN MENU */}
            <div className="absolute right-0 top-[100%] mt-1 w-56 bg-white text-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden border border-gray-100">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-semibold text-gray-900 truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
              </div>

              <div className="py-2">
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-3 px-4 py-3 md:py-2 text-sm font-bold text-[#C7511F] hover:bg-[#fff9f2] transition-colors">
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}
                <Link href="/customer" className="flex items-center gap-3 px-4 py-3 md:py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  <User className="w-4 h-4 text-gray-400" />
                  My Profile
                </Link>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })} 
                  className="w-full flex items-center gap-3 px-4 py-3 md:py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          // LOGGED OUT STATE: Shows Icon on Mobile, Text on PC
          <Link href="/login" className="flex items-center gap-2 border border-transparent hover:border-white p-1 rounded transition-colors">
            <UserCircle className="w-8 h-8 text-gray-400 md:hidden" />
            <div className="hidden md:block text-left leading-tight">
              <span className="text-[#CCCCCC] text-[11px] block font-light">Hello, Guest</span>
              <span className="font-bold text-sm">Sign in / Register</span>
            </div>
          </Link>
        )}
        
        {/* Cart Icon */}
        <div onClick={() => setIsCartOpen(true)} className="flex items-center relative cursor-pointer border border-transparent hover:border-white p-1 rounded transition-colors duration-200">
          <ShoppingCart className="w-6 h-6 md:w-7 md:h-7" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#f08804] text-[#0F1111] text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
              {cartCount} 
            </span>
          )}
          <span className="font-bold ml-1 hidden lg:block text-sm mt-2">Cart</span>
        </div>

      </div>
    </nav>
  );
}