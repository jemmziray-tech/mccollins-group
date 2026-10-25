"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

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

  const isVideo = campaign.backgroundImage?.match(/\.(mp4|webm)$/i);

  // Framer Motion variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section className="relative h-[85vh] lg:h-screen w-full flex items-center justify-center overflow-hidden bg-[#0F1115]">
      
      {/* 🌟 EDITORIAL NOISE OVERLAY */}
      <div className="absolute inset-0 bg-noise z-10 mix-blend-overlay opacity-50" />
      
      {/* 🌟 SMART BACKGROUND WITH KEN BURNS EFFECT */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
      >
        {isVideo ? (
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-60"
          >
            <source src={campaign.backgroundImage} type={`video/${campaign.backgroundImage.split('.').pop()}`} />
          </video>
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center opacity-60"
            style={{ backgroundImage: `url(${campaign.backgroundImage})` }}
          />
        )}
      </motion.div>
      
      {/* 🌟 GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/40 to-transparent z-10" />

      {/* 🌟 CONTENT WITH FRAMER MOTION STAGGER */}
      <motion.div 
        className="relative z-20 text-center px-4 md:px-8 max-w-5xl mx-auto flex flex-col items-center mt-12 md:mt-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        <motion.span 
          variants={itemVariants}
          className="text-white/80 tracking-editorial text-[10px] md:text-[11px] font-bold uppercase mb-6"
        >
          McCollins Exclusive
        </motion.span>
        
        <motion.h1 
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-6 leading-[1.05]"
        >
          {campaign.title}
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-white/70 text-sm md:text-base lg:text-lg max-w-2xl mx-auto mb-10 md:mb-12 font-medium"
        >
          {campaign.subtitle}
        </motion.p>
        
        <motion.div variants={itemVariants}>
          <Link 
            href={campaign.buttonLink} 
            className="group relative overflow-hidden inline-flex items-center justify-center border border-white/30 bg-transparent text-white px-8 md:px-12 py-4 md:py-5 text-[11px] md:text-xs font-bold tracking-editorial uppercase transition-all duration-500 hover:border-white hover:text-[#0F1115]"
          >
            <span className="absolute inset-0 bg-white translate-y-[100%] transition-transform duration-500 ease-[0.16,1,0.3,1] group-hover:translate-y-0" />
            <span className="relative z-10">{campaign.buttonText}</span>
          </Link>
        </motion.div>

      </motion.div>
    </section>
  );
}