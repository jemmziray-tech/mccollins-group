// components/SiteFooter.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
// 🟢 FIXED: Removed 'Instagram' from this import to prevent Vercel build crash
import { ArrowUp, MapPin, Mail, MessageCircle } from 'lucide-react';

export default function SiteFooter() {
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/marketing/badges')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBadges(data);
        }
      })
      .catch(err => console.error("Error loading trust badges:", err));
  }, []);

  const WHATSAPP_SALES = "255678405111";
  const WHATSAPP_SUPPORT = "255693485566"; 
  const INSTAGRAM_LINK = "https://www.instagram.com/_lwah.o?igsh=MTVha3V2a2ExdW40Mg==%22;"; 
  const TIKTOK_LINK = "https://tiktok.com/@mccollinsgroup"; 

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="contact" className="bg-[#0A0A0A] text-white pt-20 pb-10 border-t border-gray-200">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 pb-8 border-b border-white/10 gap-8">
          <div className="max-w-md">
            <h2 className="text-3xl font-serif text-white mb-4">McCollins Group.</h2>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Curating timeless luxury and bespoke fashion for the modern visionary. Delivering excellence directly to your doorstep across Tanzania.
            </p>
          </div>
          
          <button 
            onClick={scrollToTop}
            className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-white transition-colors"
          >
            Back to Top
            <span className="p-3 border border-white/10 rounded-full group-hover:border-white/30 transition-colors">
              <ArrowUp className="w-4 h-4" />
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="space-y-6">
            <h3 className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-[0.2em]">Boutique</h3>
            <ul className="space-y-4 text-sm text-gray-400 font-light">
              <li><Link href="/" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/#categories" className="hover:text-white transition-colors">Our Brands</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Bespoke Tailoring</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-[0.2em]">Client Services</h3>
            <ul className="space-y-4 text-sm text-gray-400 font-light">
              <li><Link href="/" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Size Guide</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-[0.2em]">Contact</h3>
            <ul className="space-y-4 text-sm text-gray-400 font-light">
              <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-500" /> Dar es Salaam, Tanzania</li>
              <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-500" /> info@mccollinsgroup.com</li>
              <li className="flex items-center gap-3 group">
                <MessageCircle className="w-4 h-4 text-gray-500 group-hover:text-[#25D366] transition-colors" /> 
                <a href={`https://wa.me/${WHATSAPP_SALES}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Sales: +{WHATSAPP_SALES}</a>
              </li>
              <li className="flex items-center gap-3 group">
                <MessageCircle className="w-4 h-4 text-gray-500 group-hover:text-[#25D366] transition-colors" /> 
                <a href={`https://wa.me/${WHATSAPP_SUPPORT}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Support: +{WHATSAPP_SUPPORT}</a>
              </li>
            </ul>
          </div>

          <div className="space-y-6 md:pl-8 md:border-l border-white/10">
            <h3 className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-[0.2em]">The Inner Circle</h3>
            <p className="text-sm text-gray-400 font-light">Subscribe for private editorial access and early collection releases.</p>
            <div className="flex border-b border-white/20 pb-2 focus-within:border-white transition-colors">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-transparent w-full outline-none text-sm text-white placeholder-gray-600"
              />
              <button className="text-[10px] font-bold uppercase tracking-widest hover:text-[#D4AF37] transition-colors">Join</button>
            </div>
            
            <div className="flex gap-4 pt-4">
              {/* 🟢 FIXED: Reverted to raw SVG for Instagram */}
              <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href={TIKTOK_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.96-.5 3.96-1.55 5.62-1.04 1.65-2.58 2.98-4.43 3.65-1.85.67-3.92.74-5.83.2-1.92-.54-3.6-1.63-4.82-3.13-1.22-1.5-1.94-3.35-2.07-5.28-.14-1.93.3-3.89 1.25-5.59.95-1.7 2.37-3.09 4.14-3.9 1.77-.8 3.8-.98 5.7-.51v4.04c-1.07-.36-2.27-.36-3.33 0-.94.31-1.75.92-2.3 1.75-.55.83-.8 1.84-.71 2.84.09 1 .52 1.93 1.22 2.64.7.71 1.66 1.15 2.66 1.24 1.01.09 2.02-.13 2.87-.62.85-.49 1.5-1.23 1.86-2.13.36-.9.46-1.9.29-2.88V.02z" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {badges.length > 0 && (
          <div className="pt-10 pb-6 border-t border-white/10 flex flex-col items-center justify-center">
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Secured & Trusted By</p>
             <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
               {badges.map((badge) => (
                 <img 
                   key={badge.id}
                   src={badge.imageUrl} 
                   alt={badge.name || "Trust Badge"} 
                   title={badge.name || "Trust Badge"}
                   className="h-7 md:h-9 object-contain grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 hover:scale-105"
                 />
               ))}
             </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-[10px] text-gray-600 uppercase tracking-widest">
          <p>&copy; {new Date().getFullYear()} McCollins Group. All Rights Reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}