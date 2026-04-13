// components/SaveCartForm.tsx
"use client";

import React, { useState } from 'react';
import { MessageCircle, CheckCircle2, Loader2, Bookmark } from 'lucide-react';

// We pass the current cart items into this component so it knows what to save!
export default function SaveCartForm({ currentCart }: { currentCart: any[] }) {
  const [whatsapp, setWhatsapp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSaveCart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsapp) return;
    
    setIsLoading(true);

    try {
      const res = await fetch('/api/cart/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp, cartItems: currentCart }),
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("Error saving cart.");
    } finally {
      setIsLoading(false);
    }
  };

  if (currentCart.length === 0) return null; // Don't show if cart is empty

  if (isSuccess) {
    return (
      <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-6 rounded-sm flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
        <CheckCircle2 className="w-8 h-8 text-[#997A00] mb-3" />
        <h4 className="text-[#1A1A1A] font-serif text-lg">Cart Secured</h4>
        <p className="text-sm text-gray-600 mt-1">We've saved your selections. Our concierge will send your private link via WhatsApp shortly.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF7] border border-gray-200 p-6 rounded-sm mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-[#1A1A1A] p-2 rounded-full">
          <Bookmark className="w-4 h-4 text-[#D4AF37]" />
        </div>
        <div>
          <h4 className="text-[#1A1A1A] font-serif text-lg leading-tight">Shopping for later?</h4>
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1">Save your cart via WhatsApp</p>
        </div>
      </div>
      
      <form onSubmit={handleSaveCart} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MessageCircle className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="tel"
            required
            placeholder="WhatsApp Number (e.g. +255...)"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full bg-white border border-gray-200 pl-10 pr-4 py-3 rounded-sm text-sm focus:border-[#D4AF37] outline-none transition-all font-medium"
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading || !whatsapp}
          className="bg-[#1A1A1A] text-white px-6 py-3 rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0F1115] disabled:opacity-50 flex items-center justify-center transition-colors min-w-[140px]"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save My Cart"}
        </button>
      </form>
    </div>
  );
}