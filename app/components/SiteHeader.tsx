"use client";

import React, { useState } from 'react';
import { Search, MapPin, User, Heart, ShoppingBag, Menu, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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

  // Helper function to lock body scroll when mobile menu is open
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  return (
    <header className="w-full relative z-50 font-sans">
      {/* 1. TOP PROMO BAR (Hidden on Mobile) */}
      <div className="bg-[#E3000F] text-white text-[11px] sm:text-[13px] font-bold tracking-wide py-2.5 px-4 justify-between items-center hidden md:flex">
        <div className="w-1/3 text-left">Free Delivery on orders over 100,000 Tsh</div>
        <div className="w-1/3 text-center border-x border-white/20">Ladies Dresses Take 2 Save 10,000 Tsh</div>
        <div className="w-1/3 text-right">25% Off Selected Kids Apparel & Footwear</div>
      </div>

      {/* 2. MAIN HEADER */}
      <div className="bg-black text-white px-4 md:px-6 py-4 flex items-center justify-between relative">
        
        {/* Left Side: Logo & Main Links */}
        <div className="flex items-center gap-12">
          {/* Mobile Hamburger Button */}
          <button className="lg:hidden hover:text-gray-300" onClick={toggleMobileMenu}>
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-2">
            McCollins
            <div className="w-2 h-2 md:w-3 md:h-3 bg-[#E3000F]"></div>
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
            <Link href="/beauty" className="hover:text-gray-300">BEAUTY</Link>
            <Link href="/electronics" className="hover:text-gray-300">ELECTRONICS</Link>
            <Link href="/brands" className="hover:text-gray-300">BRANDS</Link>
          </nav>
        </div>

        {/* Right Side: Icons */}
        <div className="flex items-center gap-4 md:gap-5">
          <button className="hover:text-gray-300"><Search className="w-5 h-5" strokeWidth={1.5} /></button>
          <button className="hidden sm:block hover:text-gray-300"><MapPin className="w-5 h-5" strokeWidth={1.5} /></button>
          <button className="hidden md:block hover:text-gray-300"><User className="w-5 h-5" strokeWidth={1.5} /></button>
          <button className="hidden md:block hover:text-gray-300"><Heart className="w-5 h-5" strokeWidth={1.5} /></button>
          <button className="hover:text-gray-300"><ShoppingBag className="w-5 h-5" strokeWidth={1.5} /></button>
        </div>
      </div>

      {/* 3. DESKTOP MEGA MENU DROPDOWN */}
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

      {/* 4. MOBILE SLIDE-OUT MENU */}
      {/* Black Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[100] lg:hidden transition-opacity"
          onClick={toggleMobileMenu}
        />
      )}
      
      {/* White Drawer */}
      <div className={`fixed top-0 left-0 h-full w-[85%] sm:w-[350px] bg-white z-[110] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Mobile Menu Header */}
        <div className="bg-black text-white p-5 flex justify-between items-center">
          <span className="font-bold tracking-widest text-sm uppercase">Menu</span>
          <button onClick={toggleMobileMenu} className="hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu Links */}
        <div className="flex-1 overflow-y-auto py-2">
          {Object.keys(MEGA_MENU_DATA).map((category) => (
            <div key={category} className="border-b border-gray-100">
              <button className="w-full flex justify-between items-center p-5 text-left font-bold text-[13px] tracking-wider uppercase hover:bg-gray-50">
                {category}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
          <Link href="/beauty" className="block p-5 border-b border-gray-100 font-bold text-[13px] tracking-wider uppercase hover:bg-gray-50">BEAUTY</Link>
          <Link href="/electronics" className="block p-5 border-b border-gray-100 font-bold text-[13px] tracking-wider uppercase hover:bg-gray-50">ELECTRONICS</Link>
          <Link href="/brands" className="block p-5 border-b border-gray-100 font-bold text-[13px] tracking-wider uppercase hover:bg-gray-50">BRANDS</Link>
        </div>

        {/* Mobile Menu Footer (Quick Links) */}
        <div className="p-5 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-4">
          <Link href="/account" className="flex items-center gap-2 text-[13px] font-medium text-gray-700 hover:text-black">
            <User className="w-4 h-4" /> Account
          </Link>
          <Link href="/wishlist" className="flex items-center gap-2 text-[13px] font-medium text-gray-700 hover:text-black">
            <Heart className="w-4 h-4" /> Wishlist
          </Link>
        </div>
      </div>

    </header>
  );
}
