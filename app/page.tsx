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
  Heart,
  ArrowRight
} from "lucide-react";

import { useCart } from "./context/CartContext";
import { useWishlist } from "./context/WishlistContext"; 
import FashionAssistant from "./components/FashionAssistant";
import Footer from "./components/SiteFooter"; 
import CategoryBubbles from "./components/CategoryBubbles";
import Hero from "./components/Hero"; 

const displayInventory = [
  { 
    id: "prod_1", 
    name: "Classic White Premium Tee", 
    brand: "Colman Looks", 
    price: 15000, 
    category: "Shirts",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800",
    hoverImageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800",
    description: "The perfect everyday white tee. Tailored fit, 100% breathable cotton, and designed to never lose its shape."
  },
  { 
    id: "prod_2", 
    name: "Vintage Wash Denim Jacket", 
    brand: "Colman Looks", 
    price: 45000, 
    category: "Outerwear",
    imageUrl: "https://images.unsplash.com/photo-1555583743-991174c11425?q=80&w=800",
    hoverImageUrl: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=800",
    description: "A rugged, timeless denim jacket with a vintage wash. Perfect for layering over tees or hoodies."
  }
];

function StoreContent() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // 🟢 NEW: Manage the Guest Checkout UI
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "details">("cart");
  const [guestDetails, setGuestDetails] = useState({ name: "", phone: "", area: "" });

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
      setTimeout(() => {
        document.getElementById('inventory-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      setSearchQuery("");
    }

    if (categoryFromMenu) {
      setSelectedCategory(categoryFromMenu);
    } else {
      setSelectedCategory("All");
    }
  }, [searchParams]);

  // --- FILTERS FOR COLLECTIONS & INVENTORY ---
  const displayedProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    if (searchQuery === "") return matchesCategory;

    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term !== '&' && term !== 'and' && term.trim() !== '');
    const matchesSearch = searchTerms.some(term => 
      (product.name && product.name.toLowerCase().includes(term)) || 
      (product.brand && product.brand.toLowerCase().includes(term)) ||
      (product.category && product.category.toLowerCase().includes(term)) ||
      (product.department && product.department.toLowerCase().includes(term))
    );
    return matchesSearch && matchesCategory;
  });

  // Dynamic Collection Arrays
  const colmanCollection = products.filter(p => p.brand === "Colman Looks");
  const trendingCollection = products.slice(0, 8); // Grab a mix of products for trending

  // --- UPGRADED CHECKOUT HANDLER ---
  const handleMasterCheckout = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    if (cart.length === 0) return;
    setIsCheckingOut(true); 

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cart, 
          totalAmount: cartTotal, 
          userEmail: session?.user?.email,
          customerName: guestDetails.name,
          customerPhone: `${guestDetails.phone} (${guestDetails.area})` 
        }),
      });
      if (!res.ok) console.error("Backend Error");
    } catch (error) {
      console.error("Network Error.");
    }

    // Format the perfect WhatsApp Message including their details!
    let orderDetails = `Hujambo McCollins! Ninaomba ku-place order hii:\n\n`;
    orderDetails += `*Jina:* ${guestDetails.name}\n*Simu:* ${guestDetails.phone}\n*Eneo:* ${guestDetails.area}\n\n`;
    orderDetails += `*Mzigo Wangu:*\n`;
    
    cart.forEach(item => {
      orderDetails += `▪️ ${item.quantity}x ${item.name} - Tsh ${(item.price * item.quantity).toLocaleString()}\n`;
    });
    orderDetails += `\n*TOTAL: Tsh ${cartTotal.toLocaleString()}*\n\nJe, hivi vitu vyote vipo store?`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderDetails)}`, "_blank");
    
    // Reset the cart UI after sending them to WhatsApp
    setIsCheckingOut(false);
    setCheckoutStep("cart");
    setIsCartOpen(false);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    router.push("/");
  };

  const toggleWishlist = (e: React.MouseEvent, product: any) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    if (isInWishlist(product.id)) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  // 🟢 REUSABLE PRODUCT CARD COMPONENT
  const ProductCard = ({ p, idx = 0 }: { p: any, idx?: number }) => (
    <div className="group flex flex-col relative animate-in fade-in fill-mode-both" style={{ animationDelay: `${idx * 50}ms` }}>
      <button 
        onClick={(e) => toggleWishlist(e, p)}
        className="absolute top-3 right-3 z-20 p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-sm transition-all hover:scale-110 active:scale-95"
        aria-label="Save to Wishlist"
      >
        <Heart className={`w-4 h-4 transition-colors ${isInWishlist(p.id) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-600 hover:text-black'}`} />
      </button>

      <Link href={`/product/${p.id}`} className="cursor-pointer block w-full">
        <div className="group relative bg-[#F8F8F8] aspect-[3/4] w-full overflow-hidden rounded-sm transition-all duration-500 mb-4">
          <Image 
            src={p.imageUrl} 
            alt={p.name} 
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
            className={`object-cover transition-all duration-700 ease-in-out ${p.hoverImageUrl ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`} 
          />
          {p.hoverImageUrl && (
            <Image 
              src={p.hoverImageUrl} 
              alt={`${p.name} lifestyle`} 
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
              className="object-cover absolute inset-0 opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100" 
            />
          )}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 flex items-end justify-center transition-opacity duration-300 pointer-events-none">
            <span className="bg-white/95 text-black text-[10px] px-6 py-2.5 rounded-full shadow-lg uppercase font-bold tracking-[0.2em] transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              View Details
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-1 block">{p.brand}</span>
        <h4 className="text-[13px] font-bold text-gray-900 line-clamp-2 leading-tight transition-colors uppercase tracking-wide">{p.name}</h4>
        <div className="text-sm font-bold text-[#0F1111] mt-2">
          <span className="text-[10px] align-top relative top-[2px] text-gray-500 mr-1">TSH</span> 
          {Number(p.price || 0).toLocaleString()}
        </div>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1A1A1A] relative overflow-x-hidden animate-in fade-in duration-500 ease-in-out">
      
      {/* --- CART DRAWER --- */}
      <div className={`fixed inset-0 z-[200] bg-black/50 transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-white shadow-2xl z-[250] transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        <div className="p-5 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> Your Cart ({cartCount})</h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-600"/></button>
        </div>

        {/* 🟢 NEW: DYNAMIC CART UI */}
        <div className="flex-1 overflow-y-auto p-5">
          {checkoutStep === "cart" ? (
            cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-50"/>
                <p>Your cart is empty.</p>
                <button onClick={() => setIsCartOpen(false)} className="mt-4 text-[#D4AF37] hover:underline font-bold uppercase text-sm">Continue shopping</button>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                      <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover mix-blend-multiply" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1">{item.name}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-[#D4AF37]">Tsh {item.price.toLocaleString()}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">Qty: {item.quantity}</span>
                          <button onClick={() => removeFromCart(item.id, item.size)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <form id="checkout-form" onSubmit={handleMasterCheckout} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <button type="button" onClick={() => setCheckoutStep("cart")} className="text-sm font-bold text-[#D4AF37] mb-2 flex items-center gap-1 hover:text-black transition-colors">
                   ← Back to Cart
                </button>
                <h3 className="text-2xl font-serif text-gray-900">Delivery Details</h3>
                <p className="text-xs text-gray-500 mt-1">Please provide your details so we can process your order.</p>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name</label>
                <input required type="text" value={guestDetails.name} onChange={e => setGuestDetails({...guestDetails, name: e.target.value})} className="w-full border border-gray-300 px-4 py-3 rounded-sm focus:ring-2 focus:ring-black outline-none bg-gray-50" placeholder="e.g. John Doe" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">WhatsApp Number</label>
                <input required type="tel" value={guestDetails.phone} onChange={e => setGuestDetails({...guestDetails, phone: e.target.value})} className="w-full border border-gray-300 px-4 py-3 rounded-sm focus:ring-2 focus:ring-black outline-none bg-gray-50" placeholder="e.g. 07XX XXX XXX" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Delivery Area</label>
                <input required type="text" value={guestDetails.area} onChange={e => setGuestDetails({...guestDetails, area: e.target.value})} className="w-full border border-gray-300 px-4 py-3 rounded-sm focus:ring-2 focus:ring-black outline-none bg-gray-50" placeholder="e.g. Masaki, Dar es Salaam" />
              </div>
            </form>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-600">Subtotal</span>
              <span className="text-xl font-bold text-gray-900">Tsh {cartTotal.toLocaleString()}</span>
            </div>
            
            {checkoutStep === "cart" ? (
              <button onClick={() => setCheckoutStep("details")} className="w-full hover:bg-gray-800 text-white py-4 rounded-sm font-bold shadow-sm flex justify-center items-center gap-2 transition-transform active:scale-95 uppercase tracking-widest text-sm bg-[#1A1A1A]">
                Proceed to Checkout
              </button>
            ) : (
              <button form="checkout-form" type="submit" disabled={isCheckingOut} className={`w-full hover:bg-gray-800 text-white py-4 rounded-sm font-bold shadow-sm flex justify-center items-center gap-2 transition-transform active:scale-95 uppercase tracking-widest text-sm ${isCheckingOut ? 'bg-gray-800 opacity-80' : 'bg-[#D4AF37] text-black'}`}>
                {isCheckingOut ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><MessageCircle className="w-5 h-5" /> Confirm via WhatsApp</>}
              </button>
            )}
          </div>
        )}
      </div>

      <Hero />
      <div className="relative z-30 bg-white shadow-sm border-b border-gray-100">
        <CategoryBubbles />
      </div>

      {/* LUXURY CURATED CAROUSELS */}
      {searchQuery === "" && selectedCategory === "All" && (
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 relative z-20 mt-16 mb-16 space-y-20">
          
          {/* Collection 1: The Colman Looks */}
          {colmanCollection.length > 0 && (
            <section>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-3xl font-serif text-[#1A1A1A]">The Colman Collection</h2>
                  <p className="text-gray-500 text-sm mt-1">Exclusive pieces defining timeless elegance.</p>
                </div>
                <button onClick={() => setSelectedCategory("All")} className="hidden md:flex items-center gap-1 text-sm font-bold uppercase tracking-widest text-[#D4AF37] hover:text-black transition-colors">
                  Shop All <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {colmanCollection.map((p) => (
                  <div key={p.id} className="min-w-[260px] md:min-w-[300px] snap-start">
                    <ProductCard p={p} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Collection 2: Trending Now */}
          {trendingCollection.length > 0 && (
            <section>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-3xl font-serif text-[#1A1A1A]">Trending Now</h2>
                  <p className="text-gray-500 text-sm mt-1">Our most coveted pieces this season.</p>
                </div>
              </div>
              
              <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {trendingCollection.map((p) => (
                  <div key={p.id} className="min-w-[260px] md:min-w-[300px] snap-start">
                    <ProductCard p={p} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* STANDARD INVENTORY GRID */}
      <div id="inventory-section" className="max-w-[1500px] mx-auto px-4 sm:px-6 bg-white py-12 md:py-16 shadow-sm min-h-[400px] scroll-mt-24">
        <div className="flex items-end gap-4 mb-8 pb-4 border-b border-gray-100">
          <h2 className="text-3xl font-serif text-[#1A1A1A]">
            {searchQuery !== "" ? `Results for "${searchQuery}"` : selectedCategory !== "All" ? `${selectedCategory}` : "All Products"}
          </h2>
          <span className="text-gray-500 text-sm mb-1.5 font-medium">{displayedProducts.length} items</span>
          
          {(searchQuery !== "" || selectedCategory !== "All") && (
            <button onClick={clearAllFilters} className="ml-auto text-[#D4AF37] hover:text-black text-sm font-bold uppercase transition-colors cursor-pointer tracking-widest">
              Clear Filters
            </button>
          )}
        </div>
        
        {displayedProducts.length === 0 ? (
          <div className="text-center py-20 animate-in fade-in duration-500">
            <h3 className="text-xl font-serif text-gray-700">No products found.</h3>
            <p className="text-gray-500 mt-2">Try clearing your filters or selecting a different category.</p>
            <button onClick={clearAllFilters} className="mt-6 border border-black text-black hover:bg-black hover:text-white px-8 py-3 font-bold uppercase tracking-widest text-xs transition-colors">View All Products</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
            {displayedProducts.map((p: any, idx: number) => (
              <ProductCard key={p.id} p={p} idx={idx} />
            ))}
          </div>
        )}
      </div>
        
      {!session && (
        <div className="max-w-[1500px] mx-auto w-full bg-[#131921] text-white mt-10 mb-8 py-16 flex flex-col items-center justify-center text-center px-4 shadow-sm rounded-sm">
          <h3 className="text-2xl font-serif mb-2">Join the McCollins Group</h3>
          <p className="text-sm text-gray-400 mb-8 max-w-md">Create an account to save your wishlist, track orders, and receive exclusive access to new arrivals.</p>
          <Link href="/login" className="w-full max-w-[240px]">
            <button className="w-full bg-[#D4AF37] hover:bg-[#b5952f] text-black py-4 rounded-sm font-bold shadow-sm transition-transform active:scale-95 uppercase tracking-widest text-[13px]">Create Account</button>
          </Link>
        </div>
      )}

      <Footer />
      <FashionAssistant />
    </div>
  );
}

export default function McCollinsGroupAmazonExport() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" /></div>}>
      <StoreContent />
    </Suspense>
  );
}