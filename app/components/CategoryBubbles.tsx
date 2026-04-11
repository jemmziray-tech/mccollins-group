"use client";

import React from 'react';
import Link from 'next/link';

const CATEGORIES = [
  { name: "Women", href: "/?q=women", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=300&auto=format&fit=crop" },
  { name: "Men", href: "/?q=men", image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=300&auto=format&fit=crop" },
  { name: "Kids", href: "/?q=kids", image: "https://images.unsplash.com/photo-1519241047957-be31d7379a5d?q=80&w=300&auto=format&fit=crop" },
  { name: "Shoes", href: "/?category=Shoes", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=300&auto=format&fit=crop" },
  { name: "Accessories", href: "/?category=Accessories", image: "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=300&auto=format&fit=crop" },
];

export default function CategoryBubbles() {
  return (
      <section className="w-full bg-white pt-32 pb-8 md:pt-36 border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* The Scrolling Container */}
        <div className="flex gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] justify-start md:justify-center">
          
          {CATEGORIES.map((category) => (
            <Link 
              key={category.name} 
              href={category.href}
              className="flex flex-col items-center gap-3 shrink-0 snap-start group"
            >
              {/* The Bubble */}
              <div className="w-[85px] h-[85px] md:w-[110px] md:h-[110px] rounded-full overflow-hidden border border-gray-200 group-hover:border-black transition-colors duration-300 relative shadow-sm">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
              
              {/* The Label */}
              <span className="text-[11px] md:text-xs font-bold tracking-wider uppercase text-black group-hover:text-[#E3000F] transition-colors duration-300">
                {category.name}
              </span>
            </Link>
          ))}
          
        </div>
      </div>
    </section>
  );
}