"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Heart, Share2, ShoppingBag, MessageCircle, Info, Music } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';

import { ProductItem } from '@/lib/types';

type Product = ProductItem;

export default function ReelFeed({ products }: { products: Product[] }) {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { addToCart, setIsCartOpen } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Scroll snapping detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight } = container;
      if (!clientHeight) return;
      const newIndex = Math.round(scrollTop / clientHeight);
      if (newIndex !== activeVideoIndex && !isNaN(newIndex)) {
        setActiveVideoIndex(newIndex);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeVideoIndex]);

  const handleShare = async (product: Product) => {
    const text = `Check out ${product.name} by ${product.brand} on McCollins Group!`;
    const url = `${window.location.origin}/product/${product.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text, url });
      } catch (err) {}
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank');
    }
  };

  const handleDoubleTap = (e: React.MouseEvent, product: Product) => {
    const now = e.timeStamp;
    if (now - lastTap < 300) {
      // It's a double tap
      if (!isInWishlist(product.id)) {
        addToWishlist(product);
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    setLastTap(now);
  };

  if (!products || products.length === 0) return <div className="h-screen bg-black flex items-center justify-center text-white">No items to explore.</div>;

  return (
    <div 
      ref={containerRef}
      className="h-[100dvh] w-full bg-black overflow-y-auto snap-y snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden relative"
    >
      {/* Big Animated Heart for Double Tap */}
      <AnimatePresence>
        {showHeart && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
            animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="fixed inset-0 pointer-events-none z-[1000] flex items-center justify-center"
          >
            <Heart className="w-32 h-32 text-red-500 fill-red-500 drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {products.map((product, idx) => {
        const isActive = idx === activeVideoIndex;
        const isWished = isInWishlist(product.id);
        // Deterministic engagement numbers based on index and product id
        const likesCount = `${(((idx * 7 + 13) % 40) + 10).toFixed(1)}k`;
        const sharesCount = ((idx * 83 + 120) % 800) + 100;
        
        return (
          <div 
            key={product.id} 
            className="h-[100dvh] w-full snap-start relative flex items-center justify-center bg-black overflow-hidden"
            onClick={(e) => handleDoubleTap(e, product)}
          >
            
            {/* The Media */}
            <div className={`absolute inset-0 w-full h-full transition-transform duration-[10000ms] ease-linear ${isActive ? 'scale-105' : 'scale-100'}`}>
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
            </div>

            {/* Header Overlay (e.g. For you / Following) */}
            <div className="absolute top-16 left-0 right-0 flex justify-center gap-4 text-white/80 font-semibold z-20 pointer-events-none drop-shadow-md">
              <span className="text-white drop-shadow-md border-b-2 border-white pb-1">For You</span>
              <span className="opacity-60 hover:opacity-100 transition-opacity">Discover</span>
            </div>

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-0 left-0 right-20 p-4 pb-20 md:pb-8 text-white z-10 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 overflow-hidden flex items-center justify-center backdrop-blur-md">
                  <span className="text-white font-serif font-bold text-lg">{product.brand.charAt(0) || 'M'}</span>
                </div>
                <span className="font-bold text-[15px] drop-shadow-md">mccollins_{product.brand.toLowerCase().replace(/\s/g, '') || 'official'}</span>
                <button className="border border-white/50 text-white text-xs px-2 py-0.5 rounded-sm font-semibold hover:bg-white hover:text-black transition-colors ml-1">
                  Follow
                </button>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-medium leading-tight drop-shadow-md">{product.name}</h2>
                <p className="text-sm text-white/90 line-clamp-2 mt-1 drop-shadow-md">{product.description || "Tap to discover more details about this exclusive piece."}</p>
                <div className="mt-2 text-[#D4AF37] font-bold text-lg drop-shadow-md">Tsh {product.price.toLocaleString()}</div>
              </div>

              {/* Music Ticker */}
              <div className="flex items-center gap-2 text-sm text-white/80 mt-1 bg-black/20 backdrop-blur-sm rounded-full py-1 px-3 w-max max-w-[80%] border border-white/10">
                <Music className="w-3.5 h-3.5 shrink-0" />
                <div className="overflow-hidden whitespace-nowrap mask-image-fade">
                  <div className="animate-marquee inline-block">Original Audio - McCollins Exclusive • Original Audio - McCollins Exclusive</div>
                </div>
              </div>
            </div>

            {/* Floating Action Buttons (Right Side) */}
            <div className="absolute right-2 bottom-20 md:bottom-12 flex flex-col items-center gap-5 z-20 w-16">
              
              {/* Profile Icon */}
              <div className="relative mb-2 group cursor-pointer">
                <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                  <img src={product.imageUrl} className="w-full h-full object-cover" alt="Profile" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-black group-hover:scale-110 transition-transform">
                  +
                </div>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); isWished ? removeFromWishlist(product.id) : addToWishlist(product); }}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center group-active:scale-90 transition-transform">
                  <Heart className={`w-8 h-8 transition-colors ${isWished ? 'fill-red-500 text-red-500' : 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]'}`} />
                </div>
                <span className="text-white text-xs font-semibold drop-shadow-md">{isWished ? 'Liked' : likesCount}</span>
              </button>

              <button 
                onClick={(e) => { e.stopPropagation(); handleShare(product); }}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center group-active:scale-90 transition-transform">
                  <Share2 className="w-8 h-8 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" />
                </div>
                <span className="text-white text-xs font-semibold drop-shadow-md">{sharesCount}</span>
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    imageUrl: product.imageUrl,
                    size: 'OS'
                  });
                  setIsCartOpen(true);
                }}
                className="flex flex-col items-center gap-1 group mt-2"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-yellow-600 text-black flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.5)] group-active:scale-90 transition-transform">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="text-[#D4AF37] text-xs font-bold drop-shadow-md uppercase">Buy</span>
              </button>

              {/* Rotating Music Disc */}
              <div className="mt-6 w-12 h-12 rounded-full bg-neutral-800 border-8 border-neutral-900 flex items-center justify-center animate-[spin_4s_linear_infinite]">
                <div className="w-3 h-3 rounded-full bg-[#D4AF37] overflow-hidden" />
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
