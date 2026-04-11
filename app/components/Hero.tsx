"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Hero() {
  const [campaign, setCampaign] = useState({
    title: "Elevate Your Everyday.",
    subtitle: "Discover the new standard of premium craftsmanship, curated exclusively for Tanzania.",
    buttonText: "DISCOVER THE COLLECTION",
    buttonLink: "/products",
    backgroundImage: "https://images.unsplash.com/photo-1593030761757-71fae4630b05?q=80&w=2000&auto=format&fit=crop"
  });

  // Ask the backend for the latest campaign on load
  useEffect(() => {
    fetch('/api/admin/hero')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setCampaign({
            title: data.title,
            subtitle: data.subtitle,
            buttonText: data.buttonText,
            buttonLink: data.buttonLink,
            backgroundImage: data.backgroundImage
          });
        }
      })
      .catch(err => console.error("Failed to load campaign", err));
  }, []);

  return (
    <section className="relative h-[85vh] lg:h-screen w-full flex items-center justify-center overflow-hidden bg-black animate-in fade-in duration-700">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40 transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${campaign.backgroundImage})` }}
      />
      
      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center mt-12 md:mt-0">
        
        <span className="text-gray-300 tracking-[0.3em] text-[10px] md:text-xs font-bold uppercase mb-4 md:mb-6 animate-in slide-in-from-bottom-4 duration-500">
          Colman Looks Exclusive
        </span>
        
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white tracking-tighter mb-4 md:mb-6 leading-[1.1] animate-in slide-in-from-bottom-6 duration-700">
          {campaign.title}
        </h1>
        
        <p className="text-gray-300 text-sm md:text-base max-w-lg mx-auto mb-8 md:mb-10 font-medium animate-in slide-in-from-bottom-8 duration-700 delay-100">
          {campaign.subtitle}
        </p>
        
        <Link 
          href={campaign.buttonLink} 
          className="border border-white text-white px-8 md:px-10 py-3 md:py-4 text-xs md:text-sm font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 animate-in slide-in-from-bottom-10 duration-700 delay-200"
        >
          {campaign.buttonText}
        </Link>

      </div>
    </section>
  );
}