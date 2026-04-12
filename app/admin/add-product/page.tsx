"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Loader2, CheckCircle, Trash2, LayoutGrid, Link as LinkIcon, Sparkles } from "lucide-react";

// 🟢 THE NEW MCCOLLINS TAXONOMY
const TAXONOMY = {
  CATEGORIES: {
    "Ready to Wear": ["New Arrivals", "Dresses", "Tailored Suits", "Jackets & Coats", "Knitwear", "Tops & Shirts"],
    "Footwear": ["Classic Boots", "Heels & Wedges", "Premium Sneakers", "Formal Shoes", "Sandals"],
    "Accessories": ["Luxury Bags", "Leather Belts", "Fine Jewellery", "Sunglasses", "Watches"]
  },
  BRANDS: [
    "Colman Looks", 
    "McCollins Exclusive", 
    "Heritage Collection", 
    "General Stock"
  ],
  COLLECTIONS: {
    "Trending": ["Summer Staples", "Office Elegance", "Wedding Guest", "Streetwear"],
    "Essentials": ["Premium Tees", "Classic Denim", "Outerwear", "Loungewear"],
    "Other": ["None"]
  }
};

type DraftProduct = {
  id: string; 
  file: File | null;
  previewUrl: string;
  name: string;
  price: string;
  brand: string;
  category: string;
  department: string; 
  collection: string; // 🟢 NEW FIELD
  description: string;
  sizes: string; 
  stock: string; 
};

export default function AddProductPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftProduct[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [linkInput, setLinkInput] = useState("");

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newDrafts = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      name: "",
      price: "",
      brand: "McCollins Exclusive", 
      category: "Dresses",
      department: "Women", 
      collection: "None",
      description: "", 
      sizes: "S, M, L", 
      stock: "", 
    }));

    setDrafts((prev) => [...prev, ...newDrafts]);
    e.target.value = '';
  };

  const handleAddFromLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!linkInput.trim()) return;

    const newDraft: DraftProduct = {
      id: Math.random().toString(36).substring(7),
      file: null, 
      previewUrl: linkInput.trim(),
      name: "", 
      price: "",
      brand: "McCollins Exclusive",
      category: "Dresses",
      department: "Women",
      collection: "None",
      description: "",
      sizes: "S, M, L",
      stock: "", 
    };

    setDrafts((prev) => [...prev, newDraft]);
    setLinkInput(""); 
  };

  const updateDraft = (id: string, field: keyof DraftProduct, value: string) => {
    setDrafts((prev) => 
      prev.map((draft) => draft.id === id ? { ...draft, [field]: value } : draft)
    );
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => prev.filter((draft) => draft.id !== id));
  };

  const handlePublishAll = async () => {
    const hasEmptyFields = drafts.some(d => !d.price);
    if (hasEmptyFields) {
      alert("Please ensure all items have a Price set!");
      return;
    }

    setIsSubmitting(true);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      const uploadPromises = drafts.map(async (draft) => {
        let finalImageUrl = draft.previewUrl;

        if (draft.file) {
          const fileExt = draft.file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          
          const res = await fetch(`${supabaseUrl}/storage/v1/object/products/${fileName}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${supabaseKey}`,
              "Content-Type": draft.file.type,
            },
            body: draft.file,
          });

          if (!res.ok) throw new Error(`Supabase Upload Blocked`);
          finalImageUrl = `${supabaseUrl}/storage/v1/object/public/products/${fileName}`;
        }

        const sizeArray = draft.sizes.split(',').map(s => s.trim()).filter(s => s.length > 0);

        return {
          name: draft.name.trim() || "McCollins Exclusive Piece",
          price: Number(draft.price),
          brand: draft.brand,
          imageUrl: finalImageUrl,
          description: draft.description || null,
          category: draft.category,
          department: draft.department, 
          collection: draft.collection === "None" ? null : draft.collection, // Send to DB
          sizeType: "clothing",
          sizes: sizeArray,
          stock: draft.stock ? Number(draft.stock) : 10, 
          isAvailable: true,
        };
      });

      const finalProductsArray = await Promise.all(uploadPromises);

      const dbRes = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalProductsArray),
      });

      if (!dbRes.ok) throw new Error(`Database Error`);

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 2000);

    } catch (error: any) {
      alert("An error occurred during the batch upload.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1A1A1A] pb-20">
      
      {/* 🟢 LUXURY NAV */}
      <nav className="bg-[#0F1115] text-white px-6 md:px-10 py-5 flex items-center shadow-xl sticky top-0 z-50 border-b border-[#D4AF37]/20">
        <Link href="/admin" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#D4AF37] flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Command Center
        </Link>
      </nav>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-serif text-[#1A1A1A] flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-[#D4AF37]" /> The Digital Stockroom
            </h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">Upload editorial photos and catalog your new collections.</p>
          </div>
          
          {drafts.length > 0 && !success && (
            <button 
              onClick={handlePublishAll}
              disabled={isSubmitting}
              className="bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-[#0F1115] px-8 py-3.5 rounded-sm font-bold uppercase tracking-[0.15em] text-[10px] shadow-md flex items-center gap-2 transition-colors active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin"/> Curating...</>
              ) : (
                <><UploadCloud className="w-4 h-4"/> Publish {drafts.length} {drafts.length === 1 ? 'Piece' : 'Pieces'}</>
              )}
            </button>
          )}
        </div>

        {success ? (
          <div className="bg-white border border-gray-200 p-16 rounded-sm flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 shadow-sm">
            <CheckCircle className="w-16 h-16 mb-6 text-[#D4AF37]" strokeWidth={1.5} />
            <h2 className="text-4xl font-serif mb-2 text-[#1A1A1A]">Collection Live</h2>
            <p className="text-gray-500 font-medium">Your new pieces have been successfully cataloged.</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-200">
              <label htmlFor="multi-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 bg-[#FDFBF7] hover:bg-white hover:border-[#D4AF37] rounded-sm cursor-pointer transition-colors group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 group-hover:text-[#D4AF37] transition-colors">
                  <UploadCloud className="w-8 h-8 mb-3" />
                  <p className="text-[11px] font-bold uppercase tracking-widest">Select Editorial Images</p>
                  <p className="text-xs mt-2 font-medium">Upload multiple files to batch process.</p>
                </div>
                <input id="multi-upload" type="file" multiple accept="image/*" onChange={handleFilesSelected} className="hidden" />
              </label>

              <div className="flex items-center gap-4 my-6">
                <hr className="flex-1 border-gray-100" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">OR PULL FROM WEB</span>
                <hr className="flex-1 border-gray-100" />
              </div>

              <form onSubmit={handleAddFromLink} className="flex gap-3">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                  <input
                    type="url"
                    placeholder="Paste an image URL here..."
                    className="w-full bg-[#FDFBF7] border border-gray-200 rounded-sm pl-12 pr-4 py-3.5 text-sm outline-none focus:border-[#D4AF37] focus:bg-white transition-colors text-[#1A1A1A] font-medium"
                    value={linkInput}
                    onChange={e => setLinkInput(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={!linkInput} className="bg-[#0F1115] hover:bg-[#D4AF37] text-white hover:text-[#0F1115] px-8 py-3.5 rounded-sm font-bold uppercase tracking-widest text-[10px] disabled:opacity-50 transition-colors">
                  Add Link
                </button>
              </form>
            </div>

            {drafts.length > 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {drafts.map((draft, index) => (
                  <div key={draft.id} className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-200 flex flex-col md:flex-row gap-8 relative group hover:border-[#D4AF37]/50 transition-colors">
                    
                    <button onClick={() => removeDraft(draft.id)} className="absolute top-4 right-4 bg-white border border-gray-200 p-2 rounded-sm text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all z-10 hidden md:block group-hover:block hover:scale-110">
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="w-full md:w-48 h-60 bg-[#FDFBF7] rounded-sm overflow-hidden shrink-0 border border-gray-100 relative">
                      <img src={draft.previewUrl} alt="Preview" className="w-full h-full object-cover mix-blend-multiply" />
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-x-6 gap-y-5 items-start">
                      
                      <div className="sm:col-span-3">
                         <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Item Name</label>
                         <input type="text" value={draft.name} onChange={(e) => updateDraft(draft.id, 'name', e.target.value)} placeholder="e.g. Minimalist Silk Dress" className="w-full border-b border-gray-200 focus:border-[#D4AF37] bg-transparent pb-2 outline-none font-serif text-xl text-[#1A1A1A] placeholder:text-gray-300" />
                      </div>
                      
                      <div className="sm:col-span-1">
                         <label className="block text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest mb-1.5">Price (Tsh) *</label>
                         <div className="relative">
                           <span className="absolute left-0 top-1 text-gray-400 text-sm font-bold">Tsh</span>
                           <input type="number" value={draft.price} onChange={(e) => updateDraft(draft.id, 'price', e.target.value)} placeholder="0.00" className="w-full border-b border-gray-200 focus:border-[#D4AF37] bg-transparent pl-8 pb-2 outline-none font-bold text-[#1A1A1A] text-lg" />
                         </div>
                      </div>

                      {/* 🟢 THE 4 CLEAN DROPDOWNS */}
                      <div className="sm:col-span-1">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Department</label>
                        <select value={draft.department} onChange={(e) => updateDraft(draft.id, 'department', e.target.value)} className="w-full border-b border-gray-200 focus:border-[#D4AF37] bg-transparent pb-2 outline-none text-[#1A1A1A] font-bold text-xs uppercase tracking-wider cursor-pointer">
                          <option value="Men">Men</option>
                          <option value="Women">Women</option>
                          <option value="Kids">Kids</option>
                          <option value="Unisex">Unisex</option>
                        </select>
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Category</label>
                        <select value={draft.category} onChange={(e) => updateDraft(draft.id, 'category', e.target.value)} className="w-full border-b border-gray-200 focus:border-[#D4AF37] bg-transparent pb-2 outline-none text-[#1A1A1A] font-bold text-xs uppercase tracking-wider cursor-pointer">
                          {Object.entries(TAXONOMY.CATEGORIES).map(([groupName, items]) => (
                            <optgroup key={groupName} label={groupName}>
                              {items.map(item => <option key={item} value={item}>{item}</option>)}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Brand / Designer</label>
                        <select value={draft.brand} onChange={(e) => updateDraft(draft.id, 'brand', e.target.value)} className="w-full border-b border-gray-200 focus:border-[#D4AF37] bg-transparent pb-2 outline-none text-[#1A1A1A] font-bold text-xs uppercase tracking-wider cursor-pointer">
                          {TAXONOMY.BRANDS.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                        </select>
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Collection (Tag)</label>
                        <select value={draft.collection} onChange={(e) => updateDraft(draft.id, 'collection', e.target.value)} className="w-full border-b border-gray-200 focus:border-[#D4AF37] bg-transparent pb-2 outline-none text-[#1A1A1A] font-bold text-xs uppercase tracking-wider cursor-pointer">
                          {Object.entries(TAXONOMY.COLLECTIONS).map(([groupName, items]) => (
                            <optgroup key={groupName} label={groupName}>
                              {items.map(item => <option key={item} value={item}>{item}</option>)}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2 mt-2">
                         <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Available Sizes</label>
                         <input type="text" value={draft.sizes} onChange={(e) => updateDraft(draft.id, 'sizes', e.target.value)} placeholder="S, M, L..." className="w-full border-b border-gray-200 focus:border-[#D4AF37] bg-transparent pb-2 outline-none font-bold text-[#1A1A1A] text-xs uppercase tracking-wider" />
                      </div>

                      <div className="sm:col-span-2 mt-2">
                         <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Inventory Quantity (Optional)</label>
                         <input type="number" min="0" placeholder="Unlimited" value={draft.stock} onChange={(e) => updateDraft(draft.id, 'stock', e.target.value)} className="w-full border-b border-gray-200 focus:border-[#D4AF37] bg-transparent pb-2 outline-none font-bold text-[#1A1A1A] text-xs" />
                      </div>

                      <div className="sm:col-span-4 mt-2">
                         <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Editorial Description</label>
                         <input type="text" value={draft.description} onChange={(e) => updateDraft(draft.id, 'description', e.target.value)} placeholder="Describe the materials, fit, and inspiration..." className="w-full border-b border-gray-200 focus:border-[#D4AF37] bg-transparent pb-2 outline-none text-gray-600 text-sm" />
                      </div>

                      <button onClick={() => removeDraft(draft.id)} className="md:hidden w-full flex items-center justify-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest py-3 bg-red-50 rounded-sm mt-4 sm:col-span-4 border border-red-100">
                        <Trash2 className="w-4 h-4" /> Remove Piece
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}