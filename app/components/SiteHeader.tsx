"use client";

import React, { useState } from 'react';
import { User, Heart, ShoppingBag, Menu, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSession } from "next-auth/react";

// Trimmed down data - Removed Beauty and Electronics
const MEGA_MENU_DATA = {
  FASHION: {
    Clothing: ["New Arrivals", "Dresses", "Jeans", "Jackets & Coats", "Knitwear", "Tops & T-Shirts"],
    Shoes: ["Boots", "Heels & Wedges", "Sneakers", "Pumps & Slip-Ons", "Sandals", "Slippers"],
    "Formal Wear": ["Formal Dresses", "Tops & Shirts", "Shorts", "Skirts", "Pants", "Suits"],
    Accessories: ["Bags & Purses", "Belts", "Jewellery", "Sunglasses", "Watches", "Hats & Caps"]
  },
  DRESSES: {
    "By Length": ["Mini", "Midi", "Maxi", "Midaxi", "Knee-Length"],
    "By Style": ["Wrap", "Bodycon", "Shirt", "Slip", "A-Line"],
    "Occasion": ["Casual", "Party", "Workwear", "Wedding Guest", "Evening"]
  }
};

export default function SiteHeader() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);

  const { data: session } = useSession();
  const isLoggedIn = !!session;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'unset';
  };

  const toggleMobileCategory = (category: string) => {
    if (expandedMobileMenu === category) {
      setExpandedMobileMenu(null);
    } else {
      setExpandedMobileMenu(category);
    }
  };

  return (
    <header className="w-full relative z-50 font-sans">
      
      {/* 1. MAIN HEADER (Promo bar removed!) */}
      <div className="bg-black text-white px-4 md:px-6 py-5 flex items-center justify-between relative">
        
        {/* Left Side: Logo & Main Links */}
        <div className="flex items-center gap-12">
          {/* Mobile Hamburger */}
          <button aria-label="Menu" className="lg:hidden hover:text-gray-300" onClick={toggleMobileMenu}>
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="text-xl md:text-2xl font-black tracking-tighter flex items-center">
            McCollins
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[12px] font-bold tracking-widest uppercase mt-1">
            {Object.keys(MEGA_MENU_DATA).map((category) => (
              <div 
                key={category}
                className="cursor-pointer h-full py-4 border-b-2 border-transparent hover:border-white transition-all"
                onMouseEnter={() => setActiveMenu(category)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                {category}
              </div>
            ))}
            <Link href="/brands" className="hover:text-gray-300">BRANDS</Link>
          </nav>
        </div>

        {/* Right Side: Cleaned up Icons & AUTH BUTTON */}
        <div className="flex items-center gap-4 md:gap-5 text-[12px] font-bold tracking-wider">
          
          {/* AUTHENTICATION SECTION */}
          <div className="hidden md:flex items-center">
            {isLoggedIn ? (
              <Link href="/account" className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                <User className="w-5 h-5" strokeWidth={1.5} />
                <span>ACCOUNT</span>
              </Link>
            ) : (
              <Link href="/login" className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                <User className="w-5 h-5" strokeWidth={1.5} />
                <span>SIGN IN</span>
              </Link>
            )}
          </div>

          {/* Elegant Divider Line */}
          <div className="hidden md:block w-px h-5 bg-white/30 ml-2"></div>

          {/* WISHLIST BUTTON */}
          <Link href="/wishlist" aria-label="Wishlist" className="hidden md:flex items-center hover:text-gray-300 transition-colors ml-2">
            <Heart className="w-5 h-5" strokeWidth={1.5} />
          </Link>

          {/* CART BUTTON */}
          <Link href="/cart" aria-label="Cart" className="flex items-center hover:text-gray-300 transition-colors">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
          </Link>
          
        </div>
      </div>

      {/* 2. DESKTOP MEGA MENU DROPDOWN */}
      {activeMenu && MEGA_MENU_DATA[activeMenu as keyof typeof MEGA_MENU_DATA] && (
        <div 
          className="hidden lg:block absolute top-full left-0 w-full bg-white text-black shadow-2xl border-t border-gray-200 py-10 px-12 transition-all duration-300 origin-top animate-in slide-in-from-top-2"
          onMouseEnter={() => setActiveMenu(activeMenu)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <div className="max-w-[1400px] mx-auto grid grid-cols-4 gap-8">
            {Object.entries(MEGA_MENU_DATA[activeMenu as keyof typeof MEGA_MENU_DATA]).map(([columnTitle, links]) => (
              <div key={columnTitle}>
                <h3 className="font-bold text-[13px] mb-4 uppercase tracking-wider">{columnTitle}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <Link href={`#`} className="text-[13px] text-gray-600 hover:text-black hover:underline transition-all">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MOBILE SLIDE-OUT MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] lg:hidden transition-opacity" onClick={toggleMobileMenu} />
      )}
      
      <div className={`fixed top-0 left-0 h-full w-[85%] sm:w-[350px] bg-white z-[110] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="bg-black text-white p-5 flex justify-between items-center">
          <span className="font-bold tracking-widest text-sm uppercase">Menu</span>
          <button aria-label="Close" onClick={toggleMobileMenu} className="hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {/* Mobile Auth Button */}
          <div className="border-b-4 border-gray-100">
             <Link href={isLoggedIn ? "/account" : "/login"} onClick={toggleMobileMenu} className="w-full flex items-center gap-3 p-5 font-bold text-[13px] tracking-wider uppercase bg-gray-50 hover:bg-gray-100 text-[#E3000F]">
                <User className="w-5 h-5" />
                {isLoggedIn ? "MY ACCOUNT" : "SIGN IN"}
             </Link>
          </div>

          {/* INTERACTIVE MOBILE ACCORDION LOGIC */}
          {Object.keys(MEGA_MENU_DATA).map((category) => (
            <div key={category} className="border-b border-gray-100">
              <button 
                onClick={() => toggleMobileCategory(category)}
                className="w-full flex justify-between items-center p-5 text-left font-bold text-[13px] tracking-wider uppercase text-black hover:bg-gray-50"
              >
                {category}
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedMobileMenu === category ? 'rotate-90' : ''}`} />
              </button>
              
              {/* Expanded Sub-menu */}
              {expandedMobileMenu === category && (
                <div className="bg-white px-5 pb-5 animate-in slide-in-from-top-2 duration-200">
                  {Object.entries(MEGA_MENU_DATA[category as keyof typeof MEGA_MENU_DATA]).map(([subCategory, links]) => (
                    <div key={subCategory} className="mb-4 last:mb-0">
                      <h4 className="font-bold text-[11px] text-gray-900 uppercase tracking-widest mb-2">{subCategory}</h4>
                      <ul className="space-y-3 border-l-2 border-gray-100 pl-3 ml-1">
                        {links.map(link => (
                          <li key={link}>
                            <Link href="#" onClick={toggleMobileMenu} className="text-[13px] text-gray-600 hover:text-black">
                              {link}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link href="/brands" onClick={toggleMobileMenu} className="block p-5 border-b border-gray-100 font-bold text-[13px] tracking-wider uppercase text-black hover:bg-gray-50">BRANDS</Link>
        </div>

        <div className="p-5 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-4 mt-auto">
          <Link href="/wishlist" onClick={toggleMobileMenu} className="flex items-center justify-center gap-2 text-[13px] font-medium text-gray-700 hover:text-black bg-white py-2 rounded border border-gray-200">
            <Heart className="w-4 h-4" /> Wishlist
          </Link>
          <Link href="/cart" onClick={toggleMobileMenu} className="flex items-center justify-center gap-2 text-[13px] font-medium text-gray-700 hover:text-black bg-white py-2 rounded border border-gray-200">
             <ShoppingBag className="w-4 h-4" /> Cart
          </Link>
        </div>
      </div>

    </header>
  );
}