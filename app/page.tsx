"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation"; 
import { 
  ShoppingCart, 
  Menu, 
  Search,
  MapPin,
  MessageCircle,
  X,
  Trash2,
  ShieldCheck,
  Loader2,
  Heart
} from "lucide-react";

import { useCart } from "./context/CartContext";
import { useWishlist } from "./context/WishlistContext"; 
import FashionAssistant from "./components/FashionAssistant";
import Footer from "./components/SiteFooter"; 
import CategoryBubbles from "./components/CategoryBubbles";

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
  }
];

// 🟢 THE FIX STEP 1: Rename the main function to a local component
function StoreContent() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { cart, addToCart, removeFromCart, cartTotal, cartCount, isCartOpen, setIsCartOpen } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const WHATSAPP_NUMBER = "255678405111"; 

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("API Connection Failed");
        const data = await res.json();
        if (data.length === 0) setProducts(displayInventory);
        else setProducts(data);
      } catch (error) {
        setProducts(displayInventory);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    const queryFromMenu = searchParams.get('q');
    const categoryFromMenu = searchParams.get('category');
    
    if (queryFromMenu) {
      setSearchQuery(queryFromMenu);
      setTimeout(() => window.scrollTo({ top: 600, behavior: 'smooth' }), 100);
    } else {
      setSearchQuery("");
    }

    if (categoryFromMenu) {
      setSelectedCategory(categoryFromMenu);
    } else {
      setSelectedCategory("All");
    }
  }, [searchParams]);

  const displayedProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    if (searchQuery === "") return matchesCategory;

    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term !== '&' && term !== 'and' && term.trim() !== '');
    const matchesSearch = searchTerms.some(term => 
      (product.name && product.name.toLowerCase().includes(term)) || 
      (product.brand && product.brand.toLowerCase().includes(term)) ||
      (product.category && product.category.toLowerCase().includes(term))
    );

    return matchesSearch && matchesCategory;
  });

  const handleMasterCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true); 

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cart,
          totalAmount: cartTotal,
          userEmail: session?.user?.email 
        }),
      });

      if (!res.ok) alert(`🚨 Backend Error: Status ${res.status}`);
      else alert("✅ Order saved to database perfectly!");
    } catch (error) {
      alert("🚨 Network Error.");
    }

    let orderDetails = "Hujambo McCollins! Ninaomba ku-place order hii:\n\n";
    cart.forEach(item => {
      orderDetails += `▪️ ${item.quantity}x ${item.name} - Tsh ${(item.price * item.quantity).toLocaleString()}\n`;
    });
    orderDetails += `\n*TOTAL: Tsh ${cartTotal.toLocaleString()}*\n\nJe, hivi vitu vyote vipo store?`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderDetails)}`, "_blank");
    setIsCheckingOut(false);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    router.push("/");
  };

  const toggleWishlist = (e: React.MouseEvent, product: any) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
      <div className="min-h-screen bg-[#F7F8FA] font-sans text-[#0F1111] relative overflow-x-hidden animate-in fade-in duration-500 ease-in-out">
      
      <CategoryBubbles />

      {/* --- THE SLIDE-OUT CART DRAWER --- */}
      <div 
        className={`fixed inset-0 z-[200] bg-black/50 transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
        onClick={() => setIsCartOpen(false)}
      ></div>
      
      <div className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-white shadow-2xl z-[250] transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-5 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5"/> Your Cart ({cartCount})
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600"/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-50"/>
              <p>Your cart is empty.</p>
              <button onClick={() => setIsCartOpen(false)} className="mt-4 text-[#007185] hover:underline font-medium">Continue shopping</button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item, index) => (
                <div key={index} className="flex gap-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.name} 
                      fill 
                      sizes="80px"
                      className="object-cover mix-blend-multiply" 
                    />
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

        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-200 bg-gray-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-600">Subtotal</span>
              <span className="text-xl font-bold text-gray-900">Tsh {cartTotal.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleMasterCheckout} 
              disabled={isCheckingOut}
              className={`w-full hover:bg-black border border-black text-white py-3.5 rounded-xl font-bold shadow-sm flex justify-center items-center gap-2 transition-transform active:scale-95 ${isCheckingOut ? 'bg-gray-800 opacity-80' : 'bg-black'}`}
            >
              {isCheckingOut ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing Order...</>
              ) : (
                <><MessageCircle className="w-5 h-5" /> Checkout via WhatsApp</>
              )}
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
            <button onClick={() => setQuickViewProduct(null)} className="absolute top-4 right-4 z-20 bg-white/80 p-1 rounded-full hover:bg-gray-200 transition-colors shadow-sm">
              <X className="w-6 h-6 text-gray-800" />
            </button>

            <div className="md:w-1/2 bg-gray-50 h-64 md:h-auto relative">
              <Image 
                src={quickViewProduct.imageUrl} 
                alt={quickViewProduct.name} 
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div className="md:w-1/2 p-8 flex flex-col bg-white">
              <span className="text-[#E3000F] font-bold text-sm uppercase tracking-wider mb-2">{quickViewProduct.brand}</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{quickViewProduct.name}</h2>
              <div className="text-2xl font-normal text-[#0F1111] mb-4">
                <span className="text-sm align-top relative top-1">Tsh</span> {Number(quickViewProduct.price || 0).toLocaleString()}
              </div>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">{quickViewProduct.description}</p>
              <div className="mt-auto space-y-3">
                <button onClick={() => { addToCart(quickViewProduct); setQuickViewProduct(null); setIsCartOpen(true); }} className="w-full bg-black hover:bg-zinc-800 text-white py-3 rounded-full font-bold shadow-sm flex justify-center items-center gap-2 transition-transform active:scale-95">
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HERO BANNER */}
      <div className="relative w-full h-[300px] md:h-[450px] bg-gray-900 overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=2071" 
          alt="Fashion Banner" 
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60 mix-blend-overlay animate-in zoom-in-105 duration-1000 ease-out"
        />
        <div className="absolute top-1/3 left-5 md:left-20 text-white z-20 animate-in slide-in-from-left-4 md:slide-in-from-left-8 duration-700 delay-150 fill-mode-both pr-4">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-2 leading-tight uppercase">Elevate Your<br/>Everyday Look.</h2>
          <p className="text-base md:text-lg text-gray-200">Premium fashion curated for Tanzania.</p>
        </div>
      </div>

      {/* OVERLAPPING GRID */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 relative z-20 -mt-16 md:-mt-32 mb-10">
        
        {searchQuery === "" && selectedCategory === "All" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
            <div className="bg-white p-5 flex flex-col h-[420px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-bold mb-4 uppercase">Latest Arrivals</h2>
              <div className="flex-grow relative mb-4 cursor-pointer overflow-hidden rounded group" onClick={() => setSelectedCategory("Outerwear")}>
                <Image src="https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1000" alt="Latest Men's Fashion" fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-105" />
              </div>
              <button onClick={() => setSelectedCategory("Outerwear")} className="text-left text-black hover:text-[#E3000F] hover:underline text-[13px] font-bold uppercase tracking-wider transition-colors">Shop the new collection</button>
            </div>

            <div className="bg-white p-5 flex flex-col h-[420px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-bold mb-4 uppercase">Wardrobe Essentials</h2>
              <div className="flex-grow grid grid-cols-2 gap-4 mb-4">
                 <div className="flex flex-col cursor-pointer group" onClick={() => setSelectedCategory("Shirts")}><div className="relative overflow-hidden rounded mb-1 h-28"><Image src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=500" alt="Shirts" fill sizes="(max-width: 768px) 50vw, 15vw" className="object-cover transition-transform duration-300 group-hover:scale-110" /></div><span className="text-xs font-bold uppercase group-hover:text-[#E3000F] transition-colors">Shirts & Tees</span></div>
                 <div className="flex flex-col cursor-pointer group" onClick={() => setSelectedCategory("Denim")}><div className="relative overflow-hidden rounded mb-1 h-28"><Image src="https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=500" alt="Denim" fill sizes="(max-width: 768px) 50vw, 15vw" className="object-cover transition-transform duration-300 group-hover:scale-110" /></div><span className="text-xs font-bold uppercase group-hover:text-[#E3000F] transition-colors">Denim</span></div>
                 <div className="flex flex-col cursor-pointer group" onClick={() => setSelectedCategory("Outerwear")}><div className="relative overflow-hidden rounded mb-1 h-28"><Image src="https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=500" alt="Outerwear" fill sizes="(max-width: 768px) 50vw, 15vw" className="object-cover transition-transform duration-300 group-hover:scale-110" /></div><span className="text-xs font-bold uppercase group-hover:text-[#E3000F] transition-colors">Jackets</span></div>
                 <div className="flex flex-col cursor-pointer group" onClick={() => setSelectedCategory("Footwear")}><div className="relative overflow-hidden rounded mb-1 h-28"><Image src="https://images.unsplash.com/photo-1499013819532-e4ff41b00669?q=80&w=500" alt="Footwear" fill sizes="(max-width: 768px) 50vw, 15vw" className="object-cover transition-transform duration-300 group-hover:scale-110" /></div><span className="text-xs font-bold uppercase group-hover:text-[#E3000F] transition-colors">Shoes</span></div>
              </div>
              <button onClick={() => setSelectedCategory("All")} className="text-left text-black hover:text-[#E3000F] hover:underline text-[13px] font-bold uppercase tracking-wider transition-colors">Shop all categories</button>
            </div>

            <div className="bg-white p-5 flex flex-col h-[420px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-bold mb-4 uppercase">Accessories & Gear</h2>
              <div className="flex-grow relative mb-4 cursor-pointer overflow-hidden rounded group" onClick={() => setSelectedCategory("Accessories")}>
                <Image src="https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=1000" alt="Accessories" fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <button onClick={() => setSelectedCategory("Accessories")} className="text-left text-black hover:text-[#E3000F] hover:underline text-[13px] font-bold uppercase tracking-wider transition-colors">Shop watches & more</button>
            </div>

            <div className="bg-white p-5 flex flex-col h-[420px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-bold mb-4 uppercase">Trending Footwear</h2>
              <div className="flex-grow relative mb-4 cursor-pointer overflow-hidden rounded group" onClick={() => setSelectedCategory("Footwear")}>
                <Image src="https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=800&auto=format&fit=crop" alt="Chelsea Boots" fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-2 right-2 bg-black px-2 py-1 rounded text-xs font-bold text-white shadow-sm uppercase tracking-wider">Hot</div>
              </div>
              <button onClick={() => setSelectedCategory("Footwear")} className="text-left text-black hover:text-[#E3000F] hover:underline text-[13px] font-bold uppercase tracking-wider transition-colors">Shop footwear collection</button>
            </div>
          </div>
        )}

        {/* DYNAMIC PRODUCT INVENTORY */}
        <div className="bg-white p-5 md:p-8 shadow-sm min-h-[400px] rounded-sm">
          <div className="flex items-end gap-4 mb-8 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F1111]">
              {searchQuery !== "" ? `Results for "${searchQuery}"` : selectedCategory !== "All" ? `${selectedCategory} Collection` : "Discover our inventory"}
            </h2>
            <span className="text-gray-500 text-sm mb-1 font-bold">{displayedProducts.length} items</span>
            
            {(searchQuery !== "" || selectedCategory !== "All") && (
              <button onClick={clearAllFilters} className="ml-auto text-black hover:text-[#E3000F] hover:underline text-sm font-bold uppercase transition-colors cursor-pointer">
                Clear Filters
              </button>
            )}
          </div>
          
          {displayedProducts.length === 0 ? (
            <div className="text-center py-20 animate-in fade-in duration-500">
              <h3 className="text-xl font-bold text-gray-700">No products found.</h3>
              <p className="text-gray-500 mt-2">Try clearing your filters or selecting a different category.</p>
              <button onClick={clearAllFilters} className="mt-4 bg-black text-white px-6 py-2 rounded font-bold uppercase tracking-wider text-xs">View All Products</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
              {displayedProducts.map((p: any, idx: number) => (
                
                <div key={p.id} className="group flex flex-col relative animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: `${idx * 50}ms` }}>
                  
                  <button 
                    onClick={(e) => toggleWishlist(e, p)}
                    className="absolute top-2 right-2 z-20 p-2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full shadow-sm transition-all hover:scale-110 active:scale-95"
                    aria-label="Save to Wishlist"
                  >
                    <Heart className={`w-4 h-4 transition-colors ${isInWishlist(p.id) ? 'fill-[#E3000F] text-[#E3000F]' : 'text-gray-600 hover:text-black'}`} />
                  </button>

                  <Link href={`/product/${p.id}`} className="cursor-pointer block w-full">
                    <div className="bg-[#F8F8F8] h-56 w-full flex items-center justify-center mb-3 overflow-hidden rounded relative border border-gray-100">
                      <Image 
                        src={p.imageUrl} 
                        alt={p.name} 
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                        className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110 p-2" 
                      />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 pointer-events-none">
                        <span className="bg-white text-black text-[11px] px-4 py-2 rounded-full shadow-lg uppercase font-bold tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                          View Details
                        </span>
                      </div>
                    </div>
                    <h4 className="text-[13px] font-bold text-gray-900 group-hover:text-[#E3000F] line-clamp-2 leading-tight transition-colors uppercase tracking-wide">{p.name}</h4>
                    <div className="text-lg font-bold text-[#0F1111] mt-2">
                      <span className="text-[10px] align-top relative top-1 text-gray-500">TSH</span> {Number(p.price || 0).toLocaleString()}
                    </div>
                  </Link>
                  
                </div>
              ))}
            </div>
          )}
        </div>
        
        {!session && (
          <div className="w-full bg-white border border-gray-200 mt-10 mb-8 py-10 flex flex-col items-center justify-center text-center px-4 shadow-sm rounded-sm">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">See personalized recommendations</p>
            <Link href="/login" className="w-full max-w-[240px]">
              <button className="w-full bg-black hover:bg-zinc-800 text-white py-3 rounded-full font-bold shadow-sm transition-transform active:scale-95 uppercase tracking-widest text-[13px]">Sign in securely</button>
            </Link>
          </div>
        )}

      </div>
      <Footer />
      <FashionAssistant />
    </div>
  );
}

// 🟢 THE FIX STEP 2: Create a new default export wrapped in Suspense!
export default function McCollinsGroupAmazonExport() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>}>
      <StoreContent />
    </Suspense>
  );
}