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
  Ruler
} from "lucide-react";

import { useCart } from "@/app/context/CartContext";
import Footer from "@/app/components/SiteFooter";

// Fallback data for testing
const displayInventory = [
  { 
    id: "prod_1", 
    name: "Classic White Premium Tee", 
    brand: "Colman Looks", 
    price: 15000, 
    category: "Shirts",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800",
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
  
  // 🟢 NEW: State to track which size the user selected
  const [selectedSize, setSelectedSize] = useState<string>("");

  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products?id=${productId}`);
        const data = await res.ok ? await res.json() : null;
        
        if (data && data.isAvailable) {
          setProduct(data);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Database fetch failed, checking fallbacks...");
      }

      const fallbackItem = displayInventory.find(item => item.id === productId);
      
      if (fallbackItem) {
        setProduct(fallbackItem);
      } else {
        router.push("/");
      }
      
      setIsLoading(false);
    }

    if (productId) fetchProduct();
  }, [productId, router]);

  const handleAddToCart = () => {
    // 🟢 Prevent adding to cart if size is required but not selected
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Please select a size before adding to cart!");
      return;
    }

    // Attach the selected size to the product payload
    const productToAdd = { ...product, selectedSize };
    addToCart(productToAdd);
    setIsCartOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center pt-24">
        <Loader2 className="w-10 h-10 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500 font-medium uppercase tracking-widest text-sm">Loading details...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-white font-sans text-[#0F1111] flex flex-col pt-24">
      
      <div className="flex-grow max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-8">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/?category=${product.category}`} className="hover:text-black transition-colors">{product.category}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* Product Grid */}
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
          
          {/* LEFT: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/5] bg-[#F8F8F8] rounded-2xl overflow-hidden border border-gray-100">
              <Image 
                src={product.imageUrl} 
                alt={product.name} 
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain mix-blend-multiply p-4 md:p-8 transition-transform duration-700"
              />
            </div>
            {/* Display Hover Image as thumbnail if it exists */}
            {product.hoverImageUrl && (
               <div className="grid grid-cols-4 gap-4">
                  <div className="relative aspect-square bg-[#F8F8F8] rounded-xl border-2 border-black overflow-hidden cursor-pointer">
                      <Image src={product.imageUrl} alt="Thumbnail 1" fill className="object-contain p-2 mix-blend-multiply" />
                  </div>
                  <div className="relative aspect-square bg-[#F8F8F8] rounded-xl border border-gray-200 hover:border-gray-400 overflow-hidden cursor-pointer transition-colors">
                      <Image src={product.hoverImageUrl} alt="Thumbnail 2" fill className="object-cover mix-blend-multiply" />
                  </div>
               </div>
            )}
          </div>

          {/* RIGHT: Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col pt-2 md:pt-4 animate-in fade-in slide-in-from-right-4 duration-500">
            
            {/* Title & Price */}
            <div className="mb-8 border-b border-gray-100 pb-8">
              <Link href={`/brands`} className="text-[#E3000F] font-black text-sm uppercase tracking-widest mb-3 hover:underline inline-block">
                {product.brand || "McCollins Exclusive"}
              </Link>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-6">
                {product.name}
              </h1>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">
                <span className="text-lg align-top relative top-1.5 mr-1 text-gray-500">TSH</span> 
                {Number(product.price).toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 font-medium mt-2">Tax included. Delivery calculated at checkout.</p>
            </div>

            {/* 🟢 NEW: Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Select Size</h3>
                  <button className="text-xs text-gray-500 hover:text-black underline flex items-center gap-1 transition-colors">
                    <Ruler className="w-3 h-3" /> Size Guide
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3.5rem] h-12 px-4 rounded border font-bold text-sm transition-all duration-200 ${
                        selectedSize === size 
                          ? 'border-black bg-black text-white shadow-md scale-105' 
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {!selectedSize && <p className="text-xs text-[#E3000F] font-medium mt-3">* Please select a size to continue</p>}
              </div>
            )}

            {/* Description */}
            <div className="mb-10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Product Details</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                {product.description || "A premium essential for your wardrobe. Designed with exceptional quality and crafted for everyday comfort and style."}
              </p>
            </div>

            {/* Add to Cart Action */}
            <div className="mt-auto pt-6 border-t border-gray-100">
              <button 
                onClick={handleAddToCart}
                className="w-full bg-black hover:bg-zinc-800 text-white py-4 md:py-5 rounded-xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-black/10 flex justify-center items-center gap-3 transition-all active:scale-[0.98]"
              >
                <ShoppingCart className="w-5 h-5" /> 
                {selectedSize ? `Add ${selectedSize} to Cart` : "Add to Cart"}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 py-6 border-t border-gray-100">
              <div className="flex items-center gap-3 text-gray-600">
                <Truck className="w-5 h-5 text-gray-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <ShieldCheck className="w-5 h-5 text-gray-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Secure Checkout</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <RefreshCcw className="w-5 h-5 text-gray-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Easy Returns</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}