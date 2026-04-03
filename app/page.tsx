"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  ArrowRight, 
  Menu, 
  MessageCircle, 
  X,
  Search,
  Shirt,
  Leaf,
  BookOpen
} from "lucide-react";
// Using react-icons for brands to avoid the lucide-react export error!
import { FaInstagram, FaTwitter } from "react-icons/fa";

// --- THE DISPLAY INVENTORY (Backup Data) ---
// If the database fails, the site uses this beautiful display data instead.
const displayInventory = [
  { 
    id: "prod_1", 
    name: "Vintage Denim Jacket", 
    brand: "Colman Looks", 
    price: 45000, 
    imageUrl: "https://images.unsplash.com/photo-1555583743-991174c11425?q=80&w=1973" 
  },
  { 
    id: "prod_2", 
    name: "Fresh Organic Avocados", 
    brand: "Nataka Afya", 
    price: 8500, 
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=1975" 
  },
  { 
    id: "prod_3", 
    name: "The Innovator's Playbook", 
    brand: "Akili Hub", 
    price: 35000, 
    imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2112" 
  },
  { 
    id: "prod_4", 
    name: "Heavyweight Street Tee", 
    brand: "Colman Looks", 
    price: 25000, 
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1974" 
  }
];

export default function McCollinsGroupUltimate() {
  const [products, setProducts] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // YOUR OFFICIAL BUSINESS DETAILS
  const WHATSAPP_NUMBER = "255700000000"; // Update to your real number

  useEffect(() => {
    // 1. Smooth Scroll Listener for the Glass Navbar
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    // 2. Database Fetch Logic with Safety Net
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("API Connection Failed");
        const data = await res.json();
        
        // If DB works but is empty, use the beautiful display data!
        if (data.length === 0) {
          setProducts(displayInventory);
        } else {
          setProducts(data);
        }
      } catch (error) {
        console.error("McCollins Debug: Using display data due to DB error.", error);
        // If DB completely fails (like your 405 error), use display data!
        setProducts(displayInventory);
      }
    }
    fetchProducts();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleWhatsAppOrder = (pName: string, pPrice: any) => {
    const formattedPrice = Number(pPrice || 0).toLocaleString();
    const msg = `Hujambo McCollins Group! Natamani kuagiza ${pName} ya Tsh ${formattedPrice}. Ipo store?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* 1. MOBILE MENU OVERLAY */}
      <div className={`fixed inset-0 z-[200] bg-slate-950 transition-all duration-700 ${mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className="p-10 flex justify-between items-center border-b border-white/5">
          <h2 className="text-white font-black uppercase tracking-tighter text-3xl">McCollins.</h2>
          <button onClick={() => setMobileMenuOpen(false)} className="text-white p-2 hover:rotate-90 transition-transform"><X className="w-10 h-10" /></button>
        </div>
        <div className="p-16 space-y-12">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block text-6xl font-black text-white uppercase tracking-tighter hover:text-blue-500 transition-colors">Home</Link>
          <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-6xl font-black text-blue-600 uppercase tracking-tighter hover:text-white transition-colors">Admin Portal</Link>
          <div className="pt-20 border-t border-white/5">
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Direct Support: {WHATSAPP_NUMBER}</p>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC GLASS NAVBAR */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 ${isScrolled ? "bg-white/90 backdrop-blur-2xl py-4 shadow-sm" : "bg-transparent py-10"}`}>
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button onClick={() => setMobileMenuOpen(true)} className={`transition-transform hover:scale-110 ${isScrolled ? "text-slate-900" : "text-white"}`}><Menu className="w-7 h-7" /></button>
            <h1 className={`text-3xl font-black tracking-tighter uppercase transition-colors duration-500 ${isScrolled ? "text-slate-900" : "text-white"}`}>
              McCollins<span className="text-blue-600 font-medium tracking-normal text-2xl">Group</span>
            </h1>
          </div>
          <div className="flex items-center space-x-8">
            <Search className={`w-6 h-6 hidden md:block cursor-pointer transition-colors ${isScrolled ? "text-slate-900" : "text-white"}`} />
            <div className="relative group cursor-pointer">
              <ShoppingBag className={`w-7 h-7 transition-transform group-hover:scale-110 ${isScrolled ? "text-slate-900" : "text-white"}`} />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ring-4 ring-white/10 shadow-lg">
                {products.length}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* 3. CINEMATIC HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974" className="w-full h-full object-cover animate-slow-zoom scale-110 opacity-30" alt="Hero Background" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-black/40"></div>
        </div>
        <div className="relative z-10 text-center px-6 mt-20">
          <p className="text-blue-500 font-black uppercase tracking-[0.8em] text-[10px] mb-8 animate-pulse">Tanzania's Premier Holding</p>
          <h2 className="text-7xl md:text-[140px] font-black text-white leading-[0.8] tracking-tighter mb-10 mix-blend-screen drop-shadow-2xl">
            ELEVATE <br /> EVERYDAY.
          </h2>
          <p className="text-white/70 font-black uppercase tracking-[0.4em] text-sm md:text-xl mb-16">
            Fashion • Organic Food • Education
          </p>
          <button className="px-20 py-7 bg-white text-slate-900 font-black uppercase text-xs tracking-widest rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-105">
            Discover Our World
          </button>
        </div>
      </section>

      {/* 4. THE THREE PILLARS */}
      <section className="max-w-7xl mx-auto px-8 -mt-32 relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FASHION */}
          <div className="bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 group hover:-translate-y-4 transition-all duration-500">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Shirt className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">Apparel & Style</h4>
              <h3 className="text-4xl font-black tracking-tighter uppercase mb-6 leading-none italic">Colman <br /> Looks.</h3>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">Premium curated fashion designed for the modern Tanzanian individual.</p>
              <div className="flex items-center text-slate-900 font-black text-xs uppercase tracking-widest group-hover:text-blue-600 transition-colors">Shop Fashion <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" /></div>
          </div>

          {/* FOOD */}
          <div className="bg-slate-900 p-12 rounded-[40px] shadow-2xl text-white group hover:-translate-y-4 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform relative z-10">
                <Leaf className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="text-green-400 font-black uppercase text-[10px] tracking-widest mb-2 relative z-10">Health & Groceries</h4>
              <h3 className="text-4xl font-black tracking-tighter uppercase mb-6 leading-none italic relative z-10">Nataka <br /> Afya.</h3>
              <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium relative z-10">Defining wellness through high-quality organic groceries and fresh produce.</p>
              <div className="flex items-center text-white font-black text-xs uppercase tracking-widest group-hover:text-green-400 transition-colors relative z-10">Order Fresh <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" /></div>
          </div>

          {/* EDUCATION */}
          <div className="bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 group hover:-translate-y-4 transition-all duration-500">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-indigo-600" />
              </div>
              <h4 className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">Learning & Growth</h4>
              <h3 className="text-4xl font-black tracking-tighter uppercase mb-6 leading-none italic">Akili <br /> Hub.</h3>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">Empowering the next generation with premier educational resources and books.</p>
              <div className="flex items-center text-slate-900 font-black text-xs uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Explore Hub <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" /></div>
          </div>
      </section>

      {/* 5. NOURISHED INVENTORY */}
      <section className="max-w-7xl mx-auto px-8 py-48">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 border-l-[12px] border-slate-900 pl-10">
          <h3 className="text-6xl md:text-7xl font-black tracking-tighter uppercase italic text-slate-900 leading-[0.85]">
            Featured <br /> Inventory.
          </h3>
          <p className="max-w-xs text-slate-500 font-bold text-sm mt-8 md:mt-0">Across Fashion, Food, and Education.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {products.map((p: any) => (
            <div key={p.id} className="group cursor-pointer">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-white mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                <img src={p.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={p.name} />
                
                {/* WHATSAPP ACTION OVERLAY */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-6 space-y-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleWhatsAppOrder(p.name, p.price); }}
                      className="w-full py-4 bg-green-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl flex items-center justify-center hover:bg-green-600 transition-transform transform hover:scale-105 shadow-xl"
                    >
                      <MessageCircle className="w-5 h-5 mr-3" /> Buy Now
                    </button>
                </div>
              </div>
              <div className="px-2">
                <h4 className="text-xl font-black tracking-tighter leading-tight uppercase text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">{p.name}</h4>
                <div className="flex justify-between items-center mt-3">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black uppercase tracking-widest">{p.brand}</span>
                  <p className="font-black text-slate-900 text-lg tracking-tighter italic">
                    Tsh {Number(p.price || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. GLOBAL FOOTER */}
      <footer className="bg-slate-950 text-white pt-40 pb-16 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center border-b border-white/10 pb-20 mb-10">
            <div className="mb-12 md:mb-0 text-center md:text-left">
              <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">McCollins.</h2>
              <p className="text-slate-500 font-bold text-sm tracking-widest uppercase mb-8">Fashion • Food • Education</p>
              <div className="flex justify-center md:justify-start space-x-8 text-slate-400">
                <FaInstagram className="w-7 h-7 hover:text-white cursor-pointer transition-colors" />
                <FaTwitter className="w-7 h-7 hover:text-white cursor-pointer transition-colors" />
                <Link href={`https://wa.me/${WHATSAPP_NUMBER}`}><MessageCircle className="w-7 h-7 hover:text-green-500 cursor-pointer transition-colors" /></Link>
              </div>
            </div>
            <div className="text-center md:text-right space-y-6">
               <Link href="/admin" className="inline-block bg-blue-600 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-full hover:bg-blue-500 transition-colors shadow-lg">
                 Admin Dashboard
               </Link>
            </div>
        </div>
        <div className="max-w-7xl mx-auto text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">© 2026 MCCOLLINS GROUP INTERNATIONAL. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes slow-zoom {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.2); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 40s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
}