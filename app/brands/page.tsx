"use client";

import React, { useState } from 'react';
import Link from 'next/link';

// A massive dictionary of popular fashion, footwear, and accessory brands
const BRANDS_DATA: Record<string, string[]> = {
  A: ["Adidas", "Aldo", "Alexander McQueen", "Armani", "Asics"],
  B: ["Balenciaga", "Bally", "Balmain", "Boss", "Burberry"],
  C: ["Calvin Klein", "Cartier", "Celine", "Chanel", "Christian Dior", "Clarks", "Converse"],
  D: ["Diesel", "Dior", "DKNY", "Dolce & Gabbana", "Dr. Martens"],
  E: ["Emporio Armani", "Everlane"],
  F: ["Fendi", "Fila", "Forever 21", "Fossil", "Furla"],
  G: ["Gap", "Givenchy", "Gucci", "Guess"],
  H: ["H&M", "Hermès", "Hugo Boss", "Hush Puppies"],
  I: ["Issey Miyake"],
  J: ["Jimmy Choo", "Jockey", "Jordan"],
  K: ["Kappa", "Kate Spade", "Kenzo"],
  L: ["Lacoste", "Levi's", "Loewe", "Louis Vuitton", "Lululemon"],
  M: ["MAC", "Mango", "Marc Jacobs", "Massimo Dutti", "Michael Kors", "Miu Miu"],
  N: ["New Balance", "Nike", "Nine West"],
  O: ["Oakley", "Off-White", "Omega"],
  P: ["Polo Ralph Lauren", "Prada", "Puma"],
  Q: ["Quiksilver"],
  R: ["Ralph Lauren", "Ray-Ban", "Reebok", "Rolex"],
  S: ["Saint Laurent", "Salvatore Ferragamo", "Skechers", "Steve Madden", "Supreme"],
  T: ["The North Face", "Timberland", "Tom Ford", "Tommy Hilfiger"],
  U: ["UGG", "Under Armour", "Uniqlo"],
  V: ["Valentino", "Vans", "Versace", "Victoria's Secret"],
  W: ["Wrangler"],
  X: ["Xtep"],
  Y: ["Yeezy", "Yves Saint Laurent"],
  Z: ["Zara", "Zegna"]
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function BrandsPage() {
  // State to track which letter is currently clicked (Defaults to 'A')
  const [activeLetter, setActiveLetter] = useState("A");

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans text-black pb-20">
      
      {/* 1. HERO BANNER */}
      <div className="bg-[#EAE8E3] w-full py-16 md:py-24 flex flex-col items-center justify-center border-b border-gray-200 text-center px-4 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none flex justify-around items-center">
          <span className="text-9xl font-black italic">NIKE</span>
          <span className="text-9xl font-black">GUCCI</span>
          <span className="text-9xl font-black italic">ZARA</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4">
            World <span className="text-[#E3000F] bg-white px-2 leading-none inline-block transform -skew-x-12">of</span> Brands
          </h1>
          <p className="text-gray-700 font-medium max-w-xl mx-auto text-sm md:text-base tracking-wide">
            Discover our curated collection of the world's most iconic fashion, footwear, and accessory brands.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-12">
        <h2 className="text-2xl md:text-3xl font-black uppercase text-center tracking-widest mb-10">
          Shop By Brand
        </h2>

        {/* 2. THE A-Z FILTER BAR */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-16 border-b border-gray-200 pb-8">
          {ALPHABET.map((letter) => {
            // Check if we actually have brands for this letter
            const hasBrands = BRANDS_DATA[letter] && BRANDS_DATA[letter].length > 0;
            const isActive = activeLetter === letter;

            return (
              <button
                key={letter}
                onClick={() => hasBrands && setActiveLetter(letter)}
                disabled={!hasBrands}
                className={`
                  w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-[13px] md:text-sm font-bold transition-all duration-200
                  ${isActive 
                    ? "bg-[#E3000F] text-white shadow-md transform scale-110" 
                    : hasBrands 
                      ? "bg-white text-gray-800 border border-gray-200 hover:border-black hover:bg-gray-50 cursor-pointer" 
                      : "bg-transparent text-gray-300 cursor-not-allowed"
                  }
                `}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* 3. THE BRAND LIST DISPLAY */}
        <div className="bg-white p-8 md:p-12 rounded-xl border border-gray-100 shadow-sm min-h-[300px]">
          <h3 className="text-4xl font-black text-gray-900 border-b-4 border-[#E3000F] inline-block pb-2 mb-8">
            {activeLetter}
          </h3>
          
          {BRANDS_DATA[activeLetter] && BRANDS_DATA[activeLetter].length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-8">
              {BRANDS_DATA[activeLetter].map((brand) => (
                <li key={brand} className="flex items-center gap-2 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#E3000F] transition-colors"></div>
                  <Link 
                    href={`#`} 
                    className="text-[15px] text-gray-600 hover:text-black hover:font-bold transition-all"
                  >
                    {brand}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No brands found starting with the letter {activeLetter}.</p>
          )}
        </div>

      </div>
    </div>
  );
}