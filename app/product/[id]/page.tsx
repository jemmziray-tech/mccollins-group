"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  RefreshCcw, 
  Loader2,
  ChevronRight,
  Ruler,
  Star
} from "lucide-react";

import { useCart } from "@/app/context/CartContext";
import Footer from "@/app/components/SiteFooter";
// 🟢 IMPORT THE NEW BESPOKE FORM
import BespokeForm from "@/app/components/BespokeForm"; 

// Fallback data for testing
const displayInventory = [
  { 
    id: "prod_1", 
    name: "Classic White Premium Tee", 
    brand: "Colman Looks", 
    price: 15000, 
    category: "Shirts",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800",
    hoverImageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800",
    description: "The perfect everyday white tee. Tailored fit, 100% breathable cotton, and designed to never lose its shape.",
    sizes: ["S", "M", "L", "XL"]
  },
  { 
    id: "prod_2", 
    name: "Vintage Wash Denim Jacket", 
    brand: "Colman Looks", 
    price: 45000, 
    category: "Outerwear",
    imageUrl: "https://images.unsplash.com/photo-1555583743-991174c11425?q=80&w=800",
    description: "A rugged, timeless denim jacket with a vintage wash. Perfect for layering over tees or hoodies.",
    sizes: ["M", "L", "XL"]
  }
];

export default function ProductDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeImage, setActiveImage] = useState<string>("");

  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products?id=${productId}`);
        const data = await res.ok ? await res.json() : null;
        
        if (data && data.isAvailable) {
          setProduct(data);
          setActiveImage(data.imageUrl);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Database fetch failed, checking fallbacks...");
      }

      const fallbackItem = displayInventory.find(item => item.id === productId);
      
      if (fallbackItem) {
        setProduct(fallbackItem);
        setActiveImage(fallbackItem.imageUrl);
      } else {
        router.push("/");
      }
      
      setIsLoading(false);
    }

    if (productId) fetchProduct();
  }, [productId, router]);

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Please select a size before adding to cart.");
      return;
    }

    const productToAdd = { ...product, selectedSize };
    addToCart(productToAdd);
    setIsCartOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center pt-24">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37] mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Curating Details...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1A1A1A] flex flex-col pt-24">
      
      <div className="flex-grow max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Luxury Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-10">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/?q=${product.category}`} className="hover:text-black transition-colors">{product.category}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#D4AF37] truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* Product Grid */}
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-24 relative">
          
          {/* LEFT: VIP Image Gallery */}
          <div className="w-full lg:w-[55%] flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-700">
            {/* Main Stage Image */}
            <div className="relative w-full aspect-[4/5] bg-white rounded-sm overflow-hidden border border-gray-100 shadow-sm group">
              <Image 
                src={activeImage} 
                alt={product.name} 
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-contain mix-blend-multiply p-4 md:p-8 transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            
            {/* Thumbnail Strip */}
            {product.hoverImageUrl && (
               <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                  <div 
                    onClick={() => setActiveImage(product.imageUrl)}
                    className={`relative w-24 h-28 bg-white shrink-0 rounded-sm overflow-hidden cursor-pointer transition-all duration-300 ${activeImage === product.imageUrl ? 'border-2 border-[#D4AF37] opacity-100' : 'border border-gray-200 opacity-60 hover:opacity-100'}`}
                  >
                      <Image src={product.imageUrl} alt="View 1" fill className="object-contain p-2 mix-blend-multiply" />
                  </div>
                  <div 
                    onClick={() => setActiveImage(product.hoverImageUrl)}
                    className={`relative w-24 h-28 bg-white shrink-0 rounded-sm overflow-hidden cursor-pointer transition-all duration-300 ${activeImage === product.hoverImageUrl ? 'border-2 border-[#D4AF37] opacity-100' : 'border border-gray-200 opacity-60 hover:opacity-100'}`}
                  >
                      <Image src={product.hoverImageUrl} alt="View 2" fill className="object-cover mix-blend-multiply" />
                  </div>
               </div>
            )}
          </div>

          {/* RIGHT: Editorial Product Details (Sticky on Desktop) */}
          <div className="w-full lg:w-[45%] flex flex-col pt-2 md:pt-4 animate-in fade-in slide-in-from-right-4 duration-700 lg:sticky lg:top-32 lg:self-start lg:h-fit">
            
            {/* Title & Price */}
            <div className="mb-8 border-b border-gray-200 pb-8">
              <Link href={`/?q=${product.brand}`} className="text-[#D4AF37] font-bold text-[11px] uppercase tracking-[0.2em] mb-4 hover:text-black transition-colors inline-block">
                {product.brand || "McCollins Exclusive"}
              </Link>
              
              {/* The Playfair Display Luxury Title */}
              <h1 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] leading-[1.1] mb-6">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
                  <span className="text-sm align-top relative top-1.5 mr-1 text-gray-500">TSH</span> 
                  {Number(product.price).toLocaleString()}
                </div>
                
                {/* Simulated Review Stars for trust */}
                <div className="hidden md:flex items-center gap-1 border-l border-gray-300 pl-4">
                  <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                  <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                  <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                  <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                  <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                  <span className="text-[10px] text-gray-500 font-bold ml-1 tracking-widest border-b border-gray-300">REVIEWS</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium">Taxes & duties included. Delivery calculated at checkout.</p>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A]">Select Size</h3>
                  <button className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-[#D4AF37] border-b border-gray-300 hover:border-[#D4AF37] pb-0.5 flex items-center gap-1 transition-colors">
                    <Ruler className="w-3 h-3" /> Size Guide
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[4rem] h-12 px-4 rounded-sm border font-bold text-sm transition-all duration-300 ${
                        selectedSize === size 
                          ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-lg shadow-black/10 scale-105' 
                          : 'border-gray-300 bg-white text-gray-600 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {!selectedSize && <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-bold mt-4">* Please select a size</p>}
              </div>
            )}

            {/* Editorial Description */}
            <div className="mb-10">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A] mb-4">The Details</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {product.description || "A premium essential for your wardrobe. Designed with exceptional quality and crafted for everyday comfort, ensuring you leave a lasting impression."}
              </p>
            </div>

            {/* Checkout Area */}
            <div className="mt-auto">
              
              {/* Urgency Banner */}
              <div className="bg-[#0F1115] text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] text-center py-2.5 mb-4 rounded-sm flex items-center justify-center gap-2">
                <Truck className="w-3 h-3" /> Free Delivery in Dar es Salaam
              </div>

              <button 
                onClick={handleAddToCart}
                className="w-full bg-[#1A1A1A] hover:bg-[#D4AF37] hover:text-[#0F1115] text-white py-4 md:py-5 rounded-sm font-bold uppercase tracking-[0.2em] text-xs shadow-xl flex justify-center items-center gap-3 transition-colors duration-300"
              >
                <ShoppingCart className="w-4 h-4" /> 
                {selectedSize ? `Add Size ${selectedSize} to Cart` : "Add to Cart"}
              </button>

              {/* 🟢 NEW MADE-TO-MEASURE / BESPOKE FORM */}
              <BespokeForm productName={product.name} />
            </div>

            {/* Luxury Trust Signals */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col items-center justify-center text-center gap-2 group">
                <Truck className="w-5 h-5 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Express<br/>Shipping</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center gap-2 border-l border-r border-gray-200 group">
                <ShieldCheck className="w-5 h-5 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Secure<br/>Checkout</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center gap-2 group">
                <RefreshCcw className="w-5 h-5 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Free<br/>Returns</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}