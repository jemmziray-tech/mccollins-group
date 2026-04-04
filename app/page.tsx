"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShoppingCart, 
  Menu, 
  Search,
  MapPin,
  MessageCircle // Added for the WhatsApp Bubble
} from "lucide-react";

// --- THE DISPLAY INVENTORY (Now with Categories for filtering!) ---
const displayInventory = [
  { 
    id: "prod_1", 
    name: "Vintage Denim Jacket", 
    brand: "Colman Looks", 
    price: 45000, 
    category: "Fashion",
    imageUrl: "https://images.unsplash.com/photo-1555583743-991174c11425?q=80&w=1973" 
  },
  { 
    id: "prod_2", 
    name: "Fresh Organic Avocados", 
    brand: "Nataka Afya", 
    price: 8500, 
    category: "Food",
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=1975" 
  },
  { 
    id: "prod_3", 
    name: "The Innovator's Playbook", 
    brand: "Akili Hub", 
    price: 35000, 
    category: "Education",
    imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2112" 
  },
  { 
    id: "prod_4", 
    name: "Heavyweight Street Tee", 
    brand: "Colman Looks", 
    price: 25000, 
    category: "Fashion",
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1974" 
  }
];

export default function McCollinsGroupAmazon() {
  const [products, setProducts] = useState<any[]>([]);
  
  // NEW: Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // YOUR OFFICIAL BUSINESS DETAILS
  const WHATSAPP_NUMBER = "255700000000"; // Update to your real number

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
        console.error("McCollins Debug: Using display data due to DB error.", error);
        setProducts(displayInventory);
      }
    }
    fetchProducts();
  }, []);

  // NEW: The Filtering Logic
  // This runs instantly every time a user types a letter or changes the dropdown
  const displayedProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleWhatsAppOrder = (pName: string, pPrice: any) => {
    const formattedPrice = Number(pPrice || 0).toLocaleString();
    const msg = `Hujambo McCollins Group! Natamani kuagiza ${pName} ya Tsh ${formattedPrice}. Ipo store?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleGeneralSupport = () => {
    const msg = `Hujambo McCollins Group! Nina swali kuhusu huduma zenu.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#EAEDED] font-sans text-[#0F1111] relative">
      
      {/* NEW: Floating WhatsApp Live Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={handleGeneralSupport}
          className="bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-2xl transition-transform transform hover:scale-110 flex items-center justify-center group relative"
        >
          <MessageCircle className="w-8 h-8" />
          {/* Tooltip that shows on hover */}
          <span className="absolute right-16 bg-white text-[#0F1111] text-xs font-bold px-3 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with us live!
          </span>
        </button>
      </div>

      {/* 1. AMAZON STYLE MAIN NAVBAR */}
      <nav className="bg-[#131921] text-white flex flex-col md:flex-row items-center px-4 py-2 gap-4">
        
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <Link href="/" className="flex items-center border border-transparent hover:border-white p-1 rounded">
            <h1 className="text-2xl font-bold tracking-tighter">
              McCollins<span className="text-[#febd69]">.</span>
            </h1>
          </Link>
          
          <div className="hidden lg:flex items-center border border-transparent hover:border-white p-1 rounded cursor-pointer">
            <MapPin className="w-5 h-5 text-gray-300 mr-1 mt-2" />
            <div className="flex flex-col text-sm leading-tight">
              <span className="text-[#CCCCCC] text-[11px]">Deliver to</span>
              <span className="font-bold">Tanzania</span>
            </div>
          </div>
        </div>

        {/* UPDATED: Dynamic Search Bar */}
        <div className="flex flex-1 w-full rounded-md overflow-hidden bg-white h-10 focus-within:ring-4 focus-within:ring-[#f90] focus-within:ring-opacity-50">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-100 border-r border-gray-300 text-black text-xs px-2 outline-none cursor-pointer hidden md:block w-auto"
          >
            <option value="All">All</option>
            <option value="Fashion">Fashion</option>
            <option value="Food">Food</option>
            <option value="Education">Education</option>
          </select>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search McCollins" 
            className="flex-1 px-3 text-black outline-none w-full"
          />
          <button className="bg-[#febd69] hover:bg-[#f3a847] px-4 flex items-center justify-center transition-colors">
            <Search className="w-5 h-5 text-slate-900" />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-sm">
          <Link href="/admin" className="flex flex-col border border-transparent hover:border-white p-2 rounded leading-tight">
            <span className="text-xs font-normal">Hello, Admin</span>
            <span className="font-bold">Account & Dashboard</span>
          </Link>
          
          <div className="flex flex-col border border-transparent hover:border-white p-2 rounded leading-tight cursor-pointer">
            <span className="text-xs font-normal">Returns</span>
            <span className="font-bold">& Orders</span>
          </div>

          <div className="flex items-end border border-transparent hover:border-white p-2 rounded cursor-pointer relative">
            <ShoppingCart className="w-8 h-8" />
            <span className="absolute top-1 left-[22px] text-[#f08804] font-bold text-sm">
              {displayedProducts.length} {/* Updates cart number to match search results! */}
            </span>
            <span className="font-bold ml-1 hidden lg:block">Cart</span>
          </div>
        </div>
      </nav>

      {/* Secondary Nav Bar */}
      <div className="bg-[#232F3E] text-white px-4 py-1 flex items-center gap-4 text-sm font-medium">
        <button className="flex items-center gap-1 border border-transparent hover:border-white p-1 rounded">
          <Menu className="w-5 h-5" /> All
        </button>
        <span className="cursor-pointer border border-transparent hover:border-white p-1 rounded hidden md:inline">Today's Deals</span>
        <span className="cursor-pointer border border-transparent hover:border-white p-1 rounded hidden md:inline">Customer Service</span>
      </div>

      {/* 2. HERO CAROUSEL BACKGROUND */}
      <div className="relative w-full h-[300px] md:h-[400px] bg-gradient-to-r from-blue-100 to-teal-100 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070" 
          alt="Hero Banner" 
          className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-multiply"
        />
        <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-[#EAEDED] to-transparent z-10"></div>
      </div>

      {/* 3. THE AMAZON OVERLAPPING GRID */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 relative z-20 -mt-32 md:-mt-64 mb-10">
        
        {/* Only show category cards if the user IS NOT searching. If they are searching, get straight to the products! */}
        {searchQuery === "" && selectedCategory === "All" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
            <div className="bg-white p-5 flex flex-col h-[420px] shadow-sm">
              <h2 className="text-xl font-bold mb-4">Elevate your Style</h2>
              <div className="flex-grow relative mb-4 cursor-pointer" onClick={() => setSelectedCategory("Fashion")}>
                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000" className="absolute inset-0 w-full h-full object-cover" alt="Fashion" />
              </div>
              <button onClick={() => setSelectedCategory("Fashion")} className="text-left text-[#007185] hover:text-[#C7511F] hover:underline text-[13px] font-medium">
                Shop Colman Looks
              </button>
            </div>

            <div className="bg-white p-5 flex flex-col h-[420px] shadow-sm">
              <h2 className="text-xl font-bold mb-4">Fresh Organic Groceries</h2>
              <div className="flex-grow grid grid-cols-2 gap-4 mb-4" onClick={() => setSelectedCategory("Food")}>
                 <div className="flex flex-col cursor-pointer"><img src="https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=500" className="h-28 object-cover mb-1" alt="Veg" /><span className="text-xs">Vegetables</span></div>
                 <div className="flex flex-col cursor-pointer"><img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=500" className="h-28 object-cover mb-1" alt="Fruits" /><span className="text-xs">Fresh Fruits</span></div>
                 <div className="flex flex-col cursor-pointer"><img src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=500" className="h-28 object-cover mb-1" alt="Spices" /><span className="text-xs">Spices</span></div>
                 <div className="flex flex-col cursor-pointer"><img src="https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=500" className="h-28 object-cover mb-1" alt="Grains" /><span className="text-xs">Grains</span></div>
              </div>
              <button onClick={() => setSelectedCategory("Food")} className="text-left text-[#007185] hover:text-[#C7511F] hover:underline text-[13px] font-medium">
                Explore Nataka Afya
              </button>
            </div>

            <div className="bg-white p-5 flex flex-col h-[420px] shadow-sm">
              <h2 className="text-xl font-bold mb-4">Learn and Grow</h2>
              <div className="flex-grow relative mb-4 cursor-pointer" onClick={() => setSelectedCategory("Education")}>
                <img src="https://images.unsplash.com/photo-1524901548305-08eeddc35080?q=80&w=1000" className="absolute inset-0 w-full h-full object-cover" alt="Education" />
              </div>
              <button onClick={() => setSelectedCategory("Education")} className="text-left text-[#007185] hover:text-[#C7511F] hover:underline text-[13px] font-medium">
                Visit Akili Hub
              </button>
            </div>

            <div className="bg-white p-5 flex flex-col h-[420px] shadow-sm">
              <h2 className="text-xl font-bold mb-4">Sign in for the best experience</h2>
              <Link href="/admin" className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] text-sm py-2 rounded-lg text-center font-medium shadow-sm mb-4">
                Sign in securely
              </Link>
              <div className="flex-grow relative mt-2 cursor-pointer border-t border-gray-200 pt-4">
                <img src="https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=1000" className="absolute inset-0 w-full h-full object-cover mt-4" alt="Promo" />
              </div>
            </div>
          </div>
        )}

        {/* 4. DYNAMIC PRODUCT INVENTORY */}
        <div className="bg-white p-5 shadow-sm min-h-[400px]">
          <div className="flex items-end gap-4 mb-6 pb-2 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-[#0F1111]">
              {searchQuery !== "" ? `Results for "${searchQuery}"` : selectedCategory !== "All" ? `${selectedCategory} Inventory` : "Discover our inventory"}
            </h2>
            <span className="text-gray-500 text-sm mb-1">{displayedProducts.length} items</span>
            
            {/* Clear Filters Button */}
            {(searchQuery !== "" || selectedCategory !== "All") && (
              <button 
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                className="ml-auto text-[#007185] hover:text-[#C7511F] hover:underline text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          {displayedProducts.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold text-gray-700">No products found.</h3>
              <p className="text-gray-500 mt-2">Try checking your spelling or clearing your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {displayedProducts.map((p: any) => (
                <div key={p.id} className="group cursor-pointer flex flex-col">
                  <div className="bg-[#F8F8F8] h-48 w-full flex items-center justify-center mb-2 overflow-hidden rounded">
                    <img src={p.imageUrl} className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-110" alt={p.name} />
                  </div>
                  <h4 className="text-[14px] font-medium text-[#007185] group-hover:text-[#C7511F] line-clamp-2 leading-tight">{p.name}</h4>
                  <div className="text-xl font-normal text-[#0F1111] mt-1">
                    <span className="text-[11px] align-top relative top-1">Tsh</span> {Number(p.price || 0).toLocaleString()}
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleWhatsAppOrder(p.name, p.price); }}
                    className="mt-3 w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] text-[12px] py-2 rounded-full text-center font-medium shadow-sm transition-colors"
                  >
                    Buy via WhatsApp
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 5. AMAZON FOOTER */}
      <footer className="mt-10">
        <div className="bg-[#37475A] hover:bg-[#485769] text-white text-center py-4 text-[13px] font-medium cursor-pointer transition-colors" onClick={() => window.scrollTo(0, 0)}>
          Back to top
        </div>
        <div className="bg-[#232F3E] py-10 text-center text-gray-300 text-sm">
          <div className="flex justify-center gap-8 mb-6 font-medium">
            <span className="hover:underline cursor-pointer">Conditions of Use</span>
            <span className="hover:underline cursor-pointer">Privacy Notice</span>
            <span className="hover:underline cursor-pointer">Help</span>
          </div>
          <p>© 2026, McCollins Group International, or its affiliates</p>
        </div>
      </footer>

    </div>
  );
}