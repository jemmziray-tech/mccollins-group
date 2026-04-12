"use client";

import React, { useState, useEffect, useRef } from 'react';
import { User, Heart, ShoppingBag, Menu, X, ChevronRight, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from 'next/navigation'; 
import { useWishlist } from '@/app/context/WishlistContext'; 

// 🟢 THE UPGRADE: Added 'featured' images to create an Editorial Mega-Menu
const MEGA_MENU_DATA = {
  FASHION: {
    lists: {
      "Ready to Wear": ["New Arrivals", "Dresses", "Tailored Suits", "Jackets & Coats", "Knitwear", "Tops & Shirts"],
      "Footwear": ["Classic Boots", "Heels & Wedges", "Premium Sneakers", "Formal Shoes", "Sandals"],
      "Accessories": ["Luxury Bags", "Leather Belts", "Fine Jewellery", "Sunglasses", "Watches"]
    },
    featured: {
      title: "The Evening Edit",
      image: "https://images.unsplash.com/photo-1566206091558-7f218b696731?q=80&w=800",
      link: "Evening"
    }
  },
  COLLECTIONS: {
    lists: {
      "By Designer": ["Colman Looks", "McCollins Exclusive", "Heritage Collection"],
      "Trending": ["Summer Staples", "Office Elegance", "Wedding Guest", "Streetwear"],
      "Essentials": ["Premium Tees", "Classic Denim", "Outerwear", "Loungewear"]
    },
    featured: {
      title: "Colman Looks Signature",
      image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800",
      link: "Colman"
    }
  }
};

export default function SiteHeader() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  
  const [isScrolled, setIsScrolled] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname(); 
  const { wishlistCount } = useWishlist();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: session } = useSession();
  const isLoggedIn = !!session;

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

  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className={`fixed top-0 left-0 w-full z-[200] font-sans transition-all duration-500 border-b ${
      isScrolled 
        ? 'bg-[#0F1115]/95 backdrop-blur-md border-[#D4AF37]/20 shadow-2xl py-1' 
        : 'bg-gradient-to-b from-[#0F1115]/90 to-transparent border-transparent py-4'
    }`}>
      
      {/* INNER HEADER CONTENT */}
      <div className="text-white px-4 md:px-8 flex items-center justify-between relative z-50 max-w-[1600px] mx-auto">
        
        <div className="flex items-center gap-10">
          <button aria-label="Menu" className="lg:hidden hover:text-[#D4AF37] transition-colors" onClick={toggleMobileMenu}>
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/" className="text-2xl md:text-3xl font-serif font-bold tracking-tight flex items-center text-white hover:text-[#D4AF37] transition-colors">
            McCollins
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase mt-1 h-full">
            {Object.keys(MEGA_MENU_DATA).map((category) => (
              <div 
                key={category}
                className={`cursor-pointer py-4 flex items-center border-b-2 transition-all h-full ${activeMenu === category ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent hover:border-[#D4AF37] hover:text-[#D4AF37]'}`}
                onMouseEnter={() => handleMouseEnter(category)}
                onMouseLeave={handleMouseLeave}
              >
                {category}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6 text-[12px] font-bold tracking-wider">
          
          <button 
            aria-label="Toggle Search" 
            className="lg:hidden hover:text-[#D4AF37] transition-colors mt-0.5"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          >
            {isMobileSearchOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Search className="w-5 h-5" strokeWidth={1.5} />}
          </button>

          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative mr-2">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-white/5 border border-white/10 text-white px-5 py-2 pr-10 rounded-full outline-none focus:border-[#D4AF37] focus:bg-white/10 focus:w-[260px] transition-all duration-300 w-[180px] text-xs placeholder:text-gray-400 font-medium"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="hidden md:flex items-center">
            {isLoggedIn ? (
              <Link href="/account" className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors">
                <User className="w-5 h-5" strokeWidth={1.5} />
              </Link>
            ) : (
              <Link href="/login" className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors">
                <User className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-[10px] tracking-[0.15em]">SIGN IN</span>
              </Link>
            )}
          </div>

          <Link href="/wishlist" aria-label="Wishlist" className="hidden md:flex items-center hover:text-[#D4AF37] transition-colors relative">
            <Heart className="w-5 h-5" strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#D4AF37] text-black text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[16px] text-center border border-[#0F1115] animate-in zoom-in">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link href="/cart" aria-label="Cart" className="flex items-center hover:text-[#D4AF37] transition-colors relative">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      {/* MOBILE SEARCH DROPDOWN */}
      <div 
        className={`lg:hidden absolute top-full left-0 w-full bg-[#0F1115] backdrop-blur-md text-white overflow-hidden transition-all duration-300 ease-in-out z-40 border-t border-white/10 ${
          isMobileSearchOpen ? 'max-h-24 opacity-100 py-4 px-4 shadow-xl' : 'max-h-0 opacity-0 py-0 px-4 pointer-events-none'
        }`}
      >
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-[#D4AF37]" />
          <input
            type="text"
            placeholder="Search for items..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-3 rounded-sm outline-none focus:border-[#D4AF37] transition-colors text-sm placeholder:text-gray-500 font-medium"
            autoFocus={isMobileSearchOpen}
          />
        </form>
      </div>

      {/* 🟢 LUXURY DESKTOP MEGA MENU */}
      {activeMenu && MEGA_MENU_DATA[activeMenu as keyof typeof MEGA_MENU_DATA] && (
        <div 
          className="hidden lg:block absolute top-full left-0 w-full bg-[#0F1115] text-white shadow-2xl border-t border-[#D4AF37]/20 py-12 px-12 transition-all duration-300 origin-top animate-in slide-in-from-top-2 z-40"
          onMouseEnter={() => handleMouseEnter(activeMenu)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="absolute -top-8 left-0 w-full h-8 bg-transparent" />
          <div className="max-w-[1400px] mx-auto flex gap-16 relative z-10">
            
            {/* Link Columns */}
            <div className="flex-1 grid grid-cols-3 gap-8">
              {Object.entries(MEGA_MENU_DATA[activeMenu as keyof typeof MEGA_MENU_DATA].lists).map(([columnTitle, links]) => (
                <div key={columnTitle}>
                  <h3 className="font-serif text-lg mb-6 text-[#D4AF37] border-b border-white/10 pb-2">{columnTitle}</h3>
                  <ul className="space-y-4">
                    {links.map((link) => (
                      <li key={link}>
                        <Link 
                          href={`/?q=${encodeURIComponent(link)}`} 
                          onClick={() => setActiveMenu(null)}
                          className="text-[13px] text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                        >
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Featured Editorial Image */}
            <div className="w-[350px] relative group overflow-hidden rounded-sm cursor-pointer border border-white/10" onClick={() => {
              router.push(`/?q=${MEGA_MENU_DATA[activeMenu as keyof typeof MEGA_MENU_DATA].featured.link}`);
              setActiveMenu(null);
            }}>
              <Image 
                src={MEGA_MENU_DATA[activeMenu as keyof typeof MEGA_MENU_DATA].featured.image}
                alt="Featured Campaign"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-transparent to-transparent opacity-90"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase mb-2 block">Featured Story</span>
                <h4 className="text-2xl font-serif text-white mb-3">{MEGA_MENU_DATA[activeMenu as keyof typeof MEGA_MENU_DATA].featured.title}</h4>
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white group-hover:text-[#D4AF37] transition-colors">
                  Shop the Edit <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MOBILE SLIDE-OUT MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] lg:hidden transition-opacity" onClick={toggleMobileMenu} />
      )}
      
      <div className={`fixed top-0 left-0 h-full w-[85%] sm:w-[350px] bg-[#0F1115] text-white z-[110] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col border-r border-white/10 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="bg-[#131921] text-[#D4AF37] p-6 flex justify-between items-center border-b border-white/10">
          <span className="font-serif text-xl font-bold tracking-tight">McCollins</span>
          <button aria-label="Close" onClick={toggleMobileMenu} className="hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          
          <div className="p-5 border-b border-white/10 bg-white/5">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-transparent border border-white/20 text-white px-4 py-3 pr-10 rounded-sm outline-none focus:border-[#D4AF37] transition-colors text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4AF37]">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          <div className="border-b border-white/10">
             <Link href={isLoggedIn ? "/account" : "/login"} onClick={toggleMobileMenu} className="w-full flex items-center gap-3 p-6 font-bold text-[11px] tracking-[0.2em] uppercase hover:bg-white/5 text-[#D4AF37] transition-colors">
                <User className="w-5 h-5" />
                {isLoggedIn ? "MY ACCOUNT" : "SIGN IN"}
             </Link>
          </div>

          {Object.keys(MEGA_MENU_DATA).map((category) => (
            <div key={category} className="border-b border-white/10">
              <button 
                onClick={() => toggleMobileCategory(category)}
                className={`w-full flex justify-between items-center p-6 text-left font-bold text-[12px] tracking-[0.15em] uppercase transition-colors ${expandedMobileMenu === category ? 'text-[#D4AF37] bg-white/5' : 'text-white hover:bg-white/5'}`}
              >
                {category}
                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedMobileMenu === category ? 'rotate-90 text-[#D4AF37]' : 'text-gray-500'}`} />
              </button>
              
              {expandedMobileMenu === category && (
                <div className="bg-[#0A0C0F] px-6 py-4 animate-in slide-in-from-top-2 duration-300">
                  {Object.entries(MEGA_MENU_DATA[category as keyof typeof MEGA_MENU_DATA].lists).map(([subCategory, links]) => (
                    <div key={subCategory} className="mb-6 last:mb-2">
                      <h4 className="font-serif text-sm text-[#D4AF37] mb-3 border-b border-white/10 pb-2">{subCategory}</h4>
                      <ul className="space-y-3 pl-2">
                        {links.map(link => (
                          <li key={link}>
                            <Link 
                              href={`/?q=${encodeURIComponent(link)}`} 
                              onClick={toggleMobileMenu} 
                              className="text-[13px] text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                            >
                              <span className="w-1 h-1 bg-white/20 rounded-full"></span> {link}
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

        <div className="p-5 bg-[#131921] border-t border-white/10 grid grid-cols-2 gap-4 mt-auto">
          <Link href="/wishlist" onClick={toggleMobileMenu} className="flex items-center justify-center gap-2 text-[12px] font-bold tracking-wider uppercase text-white hover:text-[#D4AF37] bg-white/5 py-3 rounded-sm border border-white/10 transition-colors relative">
            <Heart className="w-4 h-4" /> 
            Wishlist
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-black text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center border border-[#131921]">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link href="/cart" onClick={toggleMobileMenu} className="flex items-center justify-center gap-2 text-[12px] font-bold tracking-wider uppercase text-white hover:text-[#D4AF37] bg-white/5 py-3 rounded-sm border border-white/10 transition-colors">
             <ShoppingBag className="w-4 h-4" /> Cart
          </Link>
        </div>
      </div>
    </header>
  );
}