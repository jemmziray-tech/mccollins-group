// app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react"; // <-- ADDED FOR SESSION DETECTION
import { 
  ShoppingCart, 
  Menu, 
  Search,
  MapPin,
  MessageCircle,
  X,
  Trash2,
  ShieldCheck
} from "lucide-react";

// IMPORT THE GLOBAL BRAIN!
import { useCart } from "./context/CartContext";

// IMPORT AI ASSISTANT
import FashionAssistant from "./components/FashionAssistant";

// IMPORT THE NEW MODERN FOOTER
import Footer from "./components/SiteFooter"; 

// --- CURATED MEN'S FASHION INVENTORY ---
const displayInventory = [
  { 
    id: "prod_1", 
    name: "Classic White Premium Tee", 
    brand: "Colman Looks", 
    price: 15000, 
    category: "Shirts",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800",
    description: "The perfect everyday white tee. Tailored fit, 100% breathable cotton, and designed to never lose its shape."
  },
  { 
    id: "prod_2", 
    name: "Vintage Wash Denim Jacket", 
    brand: "Colman Looks", 
    price: 45000, 
    category: "Outerwear",
    imageUrl: "https://images.unsplash.com/photo-1555583743-991174c11425?q=80&w=800",
    description: "A rugged, timeless denim jacket with a vintage wash. Perfect for layering over tees or hoodies."
  },
  { 
    id: "prod_3", 
    name: "Slim Fit Black Jeans", 
    brand: "Colman Looks", 
    price: 35000, 
    category: "Denim",
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800",
    description: "Premium stretch denim that moves with you. A staple black jean for any modern wardrobe."
  },
  { 
    id: "prod_4", 
    name: "Heavyweight Street Hoodie", 
    brand: "Urban TZ", 
    price: 30000, 
    category: "Outerwear",
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800",
    description: "Ultra-soft heavyweight fleece. Drop shoulders and a relaxed fit for ultimate comfort."
  },
  { 
    id: "prod_5", 
    name: "Leather Chelsea Boots", 
    brand: "Colman Looks", 
    price: 85000, 
    category: "Footwear",
    imageUrl: "https://images.unsplash.com/photo-1499013819532-e4ff41b00669?q=80&w=800",
    description: "Genuine suede leather with a durable rubber sole. Elevates any casual or smart-casual outfit."
  },
  { 
    id: "prod_6", 
    name: "Minimalist Silver Watch", 
    brand: "Luxe Time", 
    price: 55000, 
    category: "Accessories",
    imageUrl: "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=800",
    description: "Stainless steel mesh band with a clean, minimalist watch face. Water-resistant and elegant."
  }
];

export default function McCollinsGroupAmazon() {
  const { data: session } = useSession(); // <-- GRAB LOGGED IN STATUS
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  // WE NOW PULL EVERYTHING FROM THE GLOBAL CONTEXT
  const { cart, addToCart, removeFromCart, cartTotal, cartCount, isCartOpen, setIsCartOpen } = useCart();

  const WHATSAPP_NUMBER = "255743924467"; 

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("API Connection Failed");
        const data = await res.json();
        
        if (data.length === 0) { 
          setProducts(displayInventory);
        } else {
          setProducts(data);
        }
      } catch (error) {
        setProducts(displayInventory);
      }
    }
    fetchProducts();
  }, []);

  const displayedProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleGeneralSupport = () => {
    const msg = `Hujambo McCollins! Nina swali kuhusu nguo zenu.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // THE MASTER WHATSAPP CHECKOUT BUILDER
  const handleMasterCheckout = () => {
    if (cart.length === 0) return;
    
    let orderDetails = "Hujambo McCollins! Ninaomba ku-place order hii:\n\n";
    
    cart.forEach(item => {
      orderDetails += `▪️ ${item.quantity}x ${item.name} - Tsh ${(item.price * item.quantity).toLocaleString()}\n`;
    });

    orderDetails += `\n*TOTAL: Tsh ${cartTotal.toLocaleString()}*\n\nJe, hivi vitu vyote vipo store?`;
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderDetails)}`, "_blank");
  };

  return (
      <div className="min-h-screen bg-[#EAEDED] font-sans text-[#0F1111] relative overflow-x-hidden animate-in fade-in duration-500 ease-in-out">
      
      {/* --- THE CART DRAWER (SLIDES FROM RIGHT) --- */}
      <div 
        className={`fixed inset-0 z-[200] bg-black/50 transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
        onClick={() => setIsCartOpen(false)}
      ></div>
      
      <div className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-white shadow-2xl z-[250] transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* Drawer Header */}
        <div className="p-5 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5"/> Your Cart ({cartCount})
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600"/>
          </button>
        </div>

        {/* Drawer Items List */}
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-50"/>
              <p>Your cart is empty.</p>
              <button onClick={() => setIsCartOpen(false)} className="mt-4 text-[#007185] hover:underline font-medium">
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item, index) => (
                <div key={index} className="flex gap-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1">{item.name}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-[#C7511F]">Tsh {item.price.toLocaleString()}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">Qty: {item.quantity}</span>
                        <button onClick={() => removeFromCart(item.id, item.size)} className="text-red-500 hover:text-red-700 transition-colors">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer (Checkout) */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-200 bg-gray-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-600">Subtotal</span>
              <span className="text-xl font-bold text-gray-900">Tsh {cartTotal.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleMasterCheckout}
              className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] py-3.5 rounded-xl font-bold shadow-sm flex justify-center items-center gap-2 transition-transform active:scale-95"
            >
              <MessageCircle className="w-5 h-5" /> Checkout via WhatsApp
            </button>
            <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3"/> Safe and secure order processing
            </p>
          </div>
        )}
      </div>

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col md:flex-row overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-20 bg-white/80 p-1 rounded-full hover:bg-gray-200 transition-colors shadow-sm"
            >
              <X className="w-6 h-6 text-gray-800" />
            </button>

            <div className="md:w-1/2 bg-gray-50 h-64 md:h-auto relative">
              <img 
                src={quickViewProduct.imageUrl} 
                alt={quickViewProduct.name} 
                className="w-full h-full object-cover absolute inset-0"
              />
            </div>

            <div className="md:w-1/2 p-8 flex flex-col bg-white">
              <span className="text-[#007185] font-bold text-sm uppercase tracking-wider mb-2">{quickViewProduct.brand}</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{quickViewProduct.name}</h2>
              <div className="text-2xl font-normal text-[#0F1111] mb-4">
                <span className="text-sm align-top relative top-1">Tsh</span> {Number(quickViewProduct.price || 0).toLocaleString()}
              </div>
              
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {quickViewProduct.description || "Premium quality menswear curated for the modern gentleman."}
              </p>

              <div className="mt-auto space-y-3">
                <button 
                  onClick={() => {
                    addToCart(quickViewProduct); // Adds to global cart
                    setQuickViewProduct(null); // Closes modal
                    setIsCartOpen(true); // Opens the drawer to show them it worked!
                  }}
                  className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] py-3 rounded-full font-bold shadow-sm flex justify-center items-center gap-2 transition-transform active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH BAR & CATEGORY NAV (Top Row Removed!) */}
      <div className="bg-[#131921] text-white flex flex-col px-4 py-3 gap-3 shadow-md transition-all duration-300 relative z-40">
        <div className="flex items-center gap-4 w-full">
          <div className="hidden lg:flex items-center border border-transparent hover:border-white p-1 rounded cursor-pointer flex-shrink-0 transition-colors duration-200">
            <MapPin className="w-5 h-5 text-gray-300 mr-1 mt-2" />
            <div className="flex flex-col text-sm leading-tight">
              <span className="text-[#CCCCCC] text-[11px]">Deliver to</span>
              <span className="font-bold">Tanzania</span>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex flex-1 w-full rounded-md overflow-hidden bg-white h-10 focus-within:ring-4 focus-within:ring-[#f90] focus-within:ring-opacity-50 transition-all duration-200">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-100 border-r border-gray-300 text-black text-xs px-2 outline-none cursor-pointer hidden md:block w-auto font-medium"
            >
              <option value="All">All Men's</option>
              <option value="Shirts">Shirts & Tees</option>
              <option value="Denim">Jeans & Denim</option>
              <option value="Outerwear">Jackets & Outerwear</option>
              <option value="Footwear">Shoes & Boots</option>
              <option value="Accessories">Accessories</option>
            </select>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shirts, jackets, jeans..." 
              className="flex-1 px-3 text-black outline-none w-full"
            />
            <button className="bg-[#febd69] hover:bg-[#f3a847] px-4 flex items-center justify-center transition-colors duration-200">
              <Search className="w-5 h-5 text-slate-900" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#232F3E] text-white px-4 py-1 flex items-center gap-4 text-sm font-medium">
        <button className="flex items-center gap-1 border border-transparent hover:border-white p-1 rounded transition-colors duration-200">
          <Menu className="w-5 h-5" /> All
        </button>
        <span className="cursor-pointer border border-transparent hover:border-white p-1 rounded hidden md:inline transition-colors duration-200">New Arrivals</span>
        <span className="cursor-pointer border border-transparent hover:border-white p-1 rounded hidden md:inline transition-colors duration-200">Best Sellers</span>
        <span className="cursor-pointer border border-transparent hover:border-white p-1 rounded hidden md:inline transition-colors duration-200">Customer Service</span>
      </div>

      {/* MASCULINE HERO BANNER */}
      <div className="relative w-full h-[300px] md:h-[400px] bg-gray-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=2071" 
          alt="Men's Fashion Banner" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay animate-in zoom-in-105 duration-1000 ease-out"
        />
        <div className="absolute top-1/4 left-10 md:left-20 text-white z-20 animate-in slide-in-from-left-8 duration-700 delay-150 fill-mode-both">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Elevate Your<br/>Everyday Look.</h2>
          <p className="text-lg text-gray-200">Premium menswear curated for Tanzania.</p>
        </div>
        <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-[#EAEDED] to-transparent z-10"></div>
      </div>

      {/* OVERLAPPING GRID */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 relative z-20 -mt-32 md:-mt-64 mb-10">
        
        {searchQuery === "" && selectedCategory === "All" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
            <div className="bg-white p-5 flex flex-col h-[420px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-bold mb-4">Latest Arrivals</h2>
              <div className="flex-grow relative mb-4 cursor-pointer overflow-hidden rounded group" onClick={() => setSelectedCategory("Outerwear")}>
                <img src="https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1000" className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" alt="Latest Men's Fashion" />
              </div>
              <button onClick={() => setSelectedCategory("Outerwear")} className="text-left text-[#007185] hover:text-[#C7511F] hover:underline text-[13px] font-medium transition-colors">Shop the new collection</button>
            </div>

            <div className="bg-white p-5 flex flex-col h-[420px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-bold mb-4">Wardrobe Essentials</h2>
              <div className="flex-grow grid grid-cols-2 gap-4 mb-4">
                 <div className="flex flex-col cursor-pointer group" onClick={() => setSelectedCategory("Shirts")}><div className="overflow-hidden rounded mb-1 h-28"><img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=500" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt="Shirts" /></div><span className="text-xs group-hover:text-[#C7511F] transition-colors">Shirts & Tees</span></div>
                 <div className="flex flex-col cursor-pointer group" onClick={() => setSelectedCategory("Denim")}><div className="overflow-hidden rounded mb-1 h-28"><img src="https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=500" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt="Denim" /></div><span className="text-xs group-hover:text-[#C7511F] transition-colors">Denim</span></div>
                 <div className="flex flex-col cursor-pointer group" onClick={() => setSelectedCategory("Outerwear")}><div className="overflow-hidden rounded mb-1 h-28"><img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=500" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt="Outerwear" /></div><span className="text-xs group-hover:text-[#C7511F] transition-colors">Jackets</span></div>
                 <div className="flex flex-col cursor-pointer group" onClick={() => setSelectedCategory("Footwear")}><div className="overflow-hidden rounded mb-1 h-28"><img src="https://images.unsplash.com/photo-1499013819532-e4ff41b00669?q=80&w=500" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt="Footwear" /></div><span className="text-xs group-hover:text-[#C7511F] transition-colors">Shoes</span></div>
              </div>
              <button onClick={() => setSelectedCategory("All")} className="text-left text-[#007185] hover:text-[#C7511F] hover:underline text-[13px] font-medium transition-colors">Shop all categories</button>
            </div>

            <div className="bg-white p-5 flex flex-col h-[420px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-bold mb-4">Accessories & Gear</h2>
              <div className="flex-grow relative mb-4 cursor-pointer overflow-hidden rounded group" onClick={() => setSelectedCategory("Accessories")}>
                <img src="https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=1000" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Accessories" />
              </div>
              <button onClick={() => setSelectedCategory("Accessories")} className="text-left text-[#007185] hover:text-[#C7511F] hover:underline text-[13px] font-medium transition-colors">Shop watches & more</button>
            </div>

            {/* --- REPLACED SIGN-IN CARD WITH FOOTWEAR --- */}
            <div className="bg-white p-5 flex flex-col h-[420px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-bold mb-4">Trending Footwear</h2>
              <div className="flex-grow relative mb-4 cursor-pointer overflow-hidden rounded group" onClick={() => setSelectedCategory("Footwear")}>
                <img 
                  src="https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=800&auto=format&fit=crop" 
                  alt="Chelsea Boots" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold text-gray-900 shadow-sm">
                  Hot
                </div>
              </div>
              <button onClick={() => setSelectedCategory("Footwear")} className="text-left text-[#007185] hover:text-[#C7511F] hover:underline text-[13px] font-medium transition-colors">
                Shop footwear collection
              </button>
            </div>
          </div>
        )}

        {/* DYNAMIC PRODUCT INVENTORY */}
        <div className="bg-white p-5 shadow-sm min-h-[400px] rounded-sm">
          <div className="flex items-end gap-4 mb-6 pb-2 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-[#0F1111]">
              {searchQuery !== "" ? `Results for "${searchQuery}"` : selectedCategory !== "All" ? `${selectedCategory} Collection` : "Discover our inventory"}
            </h2>
            <span className="text-gray-500 text-sm mb-1">{displayedProducts.length} items</span>
            
            {(searchQuery !== "" || selectedCategory !== "All") && (
              <button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }} className="ml-auto text-[#007185] hover:text-[#C7511F] hover:underline text-sm font-medium transition-colors">
                Clear Filters
              </button>
            )}
          </div>
          
          {displayedProducts.length === 0 ? (
            <div className="text-center py-20 animate-in fade-in duration-500">
              <h3 className="text-xl font-bold text-gray-700">No products found.</h3>
              <p className="text-gray-500 mt-2">Try checking your spelling or clearing your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {displayedProducts.map((p: any, idx: number) => (
                <div 
                  key={p.id} 
                  onClick={() => setQuickViewProduct(p)} 
                  className="group cursor-pointer flex flex-col animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="bg-[#F8F8F8] h-48 w-full flex items-center justify-center mb-2 overflow-hidden rounded relative">
                    <img src={p.imageUrl} className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105" alt={p.name} />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <span className="bg-white text-gray-900 text-xs px-3 py-1 rounded shadow uppercase font-bold transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">Quick View</span>
                    </div>
                  </div>
                  <h4 className="text-[14px] font-medium text-[#007185] group-hover:text-[#C7511F] line-clamp-2 leading-tight transition-colors">{p.name}</h4>
                  <div className="text-xl font-normal text-[#0F1111] mt-1">
                    <span className="text-[11px] align-top relative top-1">Tsh</span> {Number(p.price || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* --- FULL WIDTH SIGN-IN STRIP (ONLY SHOWS IF LOGGED OUT) --- */}
        {!session && (
          <div className="w-full bg-white border-t border-b border-gray-200 mt-8 mb-8 py-8 flex flex-col items-center justify-center text-center px-4 shadow-sm rounded-sm">
            <p className="text-sm font-medium text-gray-900 mb-2">
              See personalized recommendations
            </p>
            <Link href="/login" className="w-full max-w-[240px]">
              <button className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] py-1.5 rounded-lg font-bold shadow-sm transition-transform active:scale-95 mb-2">
                Sign in securely
              </button>
            </Link>
            <p className="text-[11px] text-gray-600 font-medium tracking-wide">
              New customer? <Link href="/login" className="text-[#007185] hover:text-[#C7511F] hover:underline ml-1">Start here.</Link>
            </p>
          </div>
        )}

      </div>

      {/* --- YOUR NEW MODERN FOOTER REPLACES THE OLD ONE --- */}
      <Footer />

      <FashionAssistant />
    </div>
  );
}