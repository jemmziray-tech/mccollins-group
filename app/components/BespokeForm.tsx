// components/BespokeForm.tsx
"use client";

import React, { useState } from 'react';
import { Scissors, Ruler, MessageCircle, CheckCircle2, Loader2, ChevronDown } from 'lucide-react';

export default function BespokeForm({ productName }: { productName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    clientName: "",
    whatsapp: "",
    chest: "",
    waist: "",
    length: "",
    designNotes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      clientName: formData.clientName,
      whatsapp: formData.whatsapp,
      productName: productName,
      measurements: {
        chest: formData.chest,
        waist: formData.waist,
        length: formData.length,
      },
      designNotes: formData.designNotes
    };

    try {
      const res = await fetch('/api/bespoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) setIsSuccess(true);
    } catch (error) {
      alert("Error submitting your request.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-8 rounded-sm text-center animate-in fade-in duration-500 mt-8">
        <CheckCircle2 className="w-10 h-10 text-[#997A00] mx-auto mb-4" />
        <h4 className="text-[#1A1A1A] font-serif text-xl mb-2">Request Received</h4>
        <p className="text-sm text-gray-600">Our Master Tailor will review your specifications and contact you via WhatsApp shortly to finalize your bespoke piece.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 border border-gray-200 rounded-sm overflow-hidden bg-white">
      {/* The Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#FDFBF7] p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="bg-[#1A1A1A] p-2.5 rounded-sm">
            <Scissors className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="text-left">
            <h4 className="text-[#1A1A1A] font-serif text-lg leading-tight group-hover:text-[#D4AF37] transition-colors">Made-to-Measure</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Request Custom Tailoring</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* The Expandable Form */}
      {isOpen && (
        <div className="p-6 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
          <p className="text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
            Please provide your exact measurements and any specific design alterations (e.g., specific collar type, longer sleeves, fitted waist) for the <strong>{productName}</strong>.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" placeholder="Full Name" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} className="w-full border border-gray-200 p-3 text-sm focus:border-[#D4AF37] outline-none" />
              <input required type="tel" placeholder="WhatsApp Number" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} className="w-full border border-gray-200 p-3 text-sm focus:border-[#D4AF37] outline-none" />
            </div>

            {/* Measurements */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Ruler className="w-4 h-4 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Key Measurements (inches or cm)</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input type="text" placeholder="Chest / Bust" value={formData.chest} onChange={(e) => setFormData({...formData, chest: e.target.value})} className="w-full border border-gray-200 p-3 text-sm text-center focus:border-[#D4AF37] outline-none" />
                <input type="text" placeholder="Waist" value={formData.waist} onChange={(e) => setFormData({...formData, waist: e.target.value})} className="w-full border border-gray-200 p-3 text-sm text-center focus:border-[#D4AF37] outline-none" />
                <input type="text" placeholder="Length" value={formData.length} onChange={(e) => setFormData({...formData, length: e.target.value})} className="w-full border border-gray-200 p-3 text-sm text-center focus:border-[#D4AF37] outline-none" />
              </div>
            </div>

            {/* Design Notes */}
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Custom Design Notes</span>
              <textarea 
                rows={3} 
                placeholder="e.g., Make it a slim fit, change the buttons to gold, crop the length by 2 inches..." 
                value={formData.designNotes} 
                onChange={(e) => setFormData({...formData, designNotes: e.target.value})} 
                className="w-full border border-gray-200 p-3 text-sm focus:border-[#D4AF37] outline-none resize-none"
              ></textarea>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-[#0F1115] p-4 font-bold uppercase tracking-widest text-[10px] transition-colors flex justify-center items-center">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Bespoke Request"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}