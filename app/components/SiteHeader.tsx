"use client";

import React, { useState, useEffect, useRef } from 'react';
import { User, Heart, ShoppingBag, Menu, X, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from 'next/navigation'; // 🟢 Added usePathname
import { useWishlist } from '@/app/context/WishlistContext'; 

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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  
  // State to track if the user has scrolled down
  const [isScrolled, setIsScrolled] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname(); // 🟢 NEW: Get the current URL path
  const { wishlistCount } = useWishlist();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  // The magic scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = (category: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(category);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 350); 
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileSearchOpen) setIsMobileSearchOpen(false);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'unset';
  };

  const toggleMobileCategory = (category: string) => {
    if (expandedMobileMenu === category) setExpandedMobileMenu(null);
    else setExpandedMobileMenu(category);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/?q=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput(""); 
      if (isMobileMenuOpen) toggleMobileMenu(); 
      if (isMobileSearchOpen) setIsMobileSearchOpen(false);
    }
  };

  // 🟢 NEW: DO NOT render this header if we are in the Admin Dashboard!
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className={`fixed top-0 left-0 w-full z-[200] font-sans transition-all duration-500 border-b ${
      isScrolled 
        ? 'bg-black/85 backdrop-blur-md border-white/10 shadow-2xl py-1' 
        : 'bg-gradient-to-b from-black/80 to-transparent border-transparent py-4'
    }`}>
      
      {/* INNER HEADER CONTENT */}
      <div className="text-white px-4 md:px-6 flex items-center justify-between relative z-50">
        
        <div className="flex items-center gap-12">
          <button aria-label="Menu" className="lg:hidden hover:text-gray-300" onClick={toggleMobileMenu}>
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/" className="text-xl md:text-2xl font-black tracking-tighter flex items-center">
            McCollins
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-[12px] font-bold tracking-widest uppercase mt-1 h-full">
            {Object.keys(MEGA_MENU_DATA).map((category) => (
              <div 
                key={category}
                className="cursor-pointer py-4 flex items-center border-b-2 border-transparent hover:border-white transition-all h-full"
                onMouseEnter={() => handleMouseEnter(category)}
                onMouseLeave={handleMouseLeave}
              >
                {category}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-5 text-[12px] font-bold tracking-wider">
          
          <button 
            aria-label="Toggle Search" 
            className="lg:hidden hover:text-gray-300 transition-colors mt-0.5"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          >
            {isMobileSearchOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Search className="w-5 h-5" strokeWidth={1.5} />}
          </button>

          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative mr-2">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-white px-4 py-2 pr-10 rounded-full outline-none focus:border-white focus:w-[300px] transition-all duration-300 w-[150px] xl:w-[220px] text-xs placeholder:text-gray-500 font-medium"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </form>

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

          <div className="hidden md:block w-px h-5 bg-white/30 ml-2"></div>

          <Link href="/wishlist" aria-label="Wishlist" className="hidden md:flex items-center hover:text-gray-300 transition-colors ml-2 relative">
            <Heart className="w-5 h-5" strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#E3000F] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center border border-black animate-in zoom-in">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link href="/cart" aria-label="Cart" className="flex items-center hover:text-gray-300 transition-colors relative">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      {/* MOBILE SEARCH DROPDOWN */}
      <div 
        className={`lg:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-md text-white overflow-hidden transition-all duration-300 ease-in-out z-40 border-t border-zinc-800 ${
          isMobileSearchOpen ? 'max-h-24 opacity-100 py-4 px-4 shadow-xl' : 'max-h-0 opacity-0 py-0 px-4 pointer-events-none'
        }`}
      >
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search for items..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 text-white pl-12 pr-4 py-3 rounded-lg outline-none focus:border-white transition-colors text-sm placeholder:text-gray-500 font-medium"
            autoFocus={isMobileSearchOpen}
          />
        </form>
      </div>

      {/* DESKTOP MEGA MENU */}
      {activeMenu && MEGA_MENU_DATA[activeMenu as keyof typeof MEGA_MENU_DATA] && (
        <div 
          className="hidden lg:block absolute top-full left-0 w-full bg-white text-black shadow-2xl border-t border-gray-200 py-10 px-12 transition-all duration-300 origin-top animate-in slide-in-from-top-2 z-40"
          onMouseEnter={() => handleMouseEnter(activeMenu)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="absolute -top-8 left-0 w-full h-8 bg-transparent" />
          <div className="max-w-[1400px] mx-auto grid grid-cols-4 gap-8 relative z-10">
            {Object.entries(MEGA_MENU_DATA[activeMenu as keyof typeof MEGA_MENU_DATA]).map(([columnTitle, links]) => (
              <div key={columnTitle}>
                <h3 className="font-bold text-[13px] mb-4 uppercase tracking-wider">{columnTitle}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <Link 
                        href={`/?q=${encodeURIComponent(link)}`} 
                        onClick={() => setActiveMenu(null)}
                        className="text-[13px] text-gray-600 hover:text-black hover:underline transition-all"
                      >
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

      {/* MOBILE SLIDE-OUT MENU */}
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

        <div className="flex-1 overflow-y-auto">
          
          {/* RESTORED MOBILE SEARCH INPUT */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input 
                type="text" 
                placeholder="Search for items..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-white border border-gray-200 text-black px-4 py-3 pr-10 rounded-lg outline-none focus:border-black transition-colors text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* RESTORED ACCOUNT LOGIN LINK */}
          <div className="border-b-4 border-gray-100">
             <Link href={isLoggedIn ? "/account" : "/login"} onClick={toggleMobileMenu} className="w-full flex items-center gap-3 p-5 font-bold text-[13px] tracking-wider uppercase hover:bg-gray-50 text-[#E3000F]">
                <User className="w-5 h-5" />
                {isLoggedIn ? "MY ACCOUNT" : "SIGN IN"}
             </Link>
          </div>

          {Object.keys(MEGA_MENU_DATA).map((category) => (
            <div key={category} className="border-b border-gray-100">
              <button 
                onClick={() => toggleMobileCategory(category)}
                className="w-full flex justify-between items-center p-5 text-left font-bold text-[13px] tracking-wider uppercase text-black hover:bg-gray-50"
              >
                {category}
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedMobileMenu === category ? 'rotate-90' : ''}`} />
              </button>
              
              {expandedMobileMenu === category && (
                <div className="bg-white px-5 pb-5 animate-in slide-in-from-top-2 duration-200">
                  {Object.entries(MEGA_MENU_DATA[category as keyof typeof MEGA_MENU_DATA]).map(([subCategory, links]) => (
                    <div key={subCategory} className="mb-4 last:mb-0">
                      <h4 className="font-bold text-[11px] text-gray-900 uppercase tracking-widest mb-2">{subCategory}</h4>
                      <ul className="space-y-3 border-l-2 border-gray-100 pl-3 ml-1">
                        {links.map(link => (
                          <li key={link}>
                            <Link 
                              href={`/?q=${encodeURIComponent(link)}`} 
                              onClick={toggleMobileMenu} 
                              className="text-[13px] text-gray-600 hover:text-black"
                            >
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
        </div>

        <div className="p-5 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-4 mt-auto">
          <Link href="/wishlist" onClick={toggleMobileMenu} className="flex items-center justify-center gap-2 text-[13px] font-medium text-gray-700 hover:text-black bg-white py-2 rounded border border-gray-200 relative">
            <Heart className="w-4 h-4" /> 
            Wishlist
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#E3000F] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center border border-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link href="/cart" onClick={toggleMobileMenu} className="flex items-center justify-center gap-2 text-[13px] font-medium text-gray-700 hover:text-black bg-white py-2 rounded border border-gray-200">
             <ShoppingBag className="w-4 h-4" /> Cart
          </Link>
        </div>
      </div>
    </header>
  );
}