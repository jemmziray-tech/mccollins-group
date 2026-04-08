"use client";

import React from 'react';
import Link from 'next/link';

// Mock data: Replace the image URLs with your actual category images
const CATEGORIES = [
  { name: "Brands", href: "/brands", image: "/api/placeholder/150/150" },
  { name: "Women", href: "/women", image: "/api/placeholder/150/150" },
  { name: "Dresses", href: "/dresses", image: "/api/placeholder/150/150" },
  { name: "Men", href: "/men", image: "/api/placeholder/150/150" },
  { name: "Kids", href: "/kids", image: "/api/placeholder/150/150" },
  { name: "Shoes", href: "/shoes", image: "/api/placeholder/150/150" },
  { name: "Accessories", href: "/accessories", image: "/api/placeholder/150/150" },
  { name: "Sale", href: "/sale", image: "/api/placeholder/150/150" },
];

export default function CategoryBubbles() {
  return (
    <section className="w-full bg-white py-6 md:py-8 border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* The Scrolling Container */}
        {/* We use arbitrary Tailwind values to hide the ugly native scrollbar but keep the scrolling functionality */}
        <div className="flex gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {CATEGORIES.map((category) => (
            <Link 
              key={category.name} 
              href={category.href}
              className="flex flex-col items-center gap-3 shrink-0 snap-start group"
            >
              {/* The Bubble */}
              <div className="w-[85px] h-[85px] md:w-[110px] md:h-[110px] rounded-full overflow-hidden border border-gray-200 group-hover:border-black transition-colors duration-300 relative shadow-sm">
                
                {/* The Image inside the bubble */}
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Optional: A subtle dark overlay that fades in on hover to make it look premium */}
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