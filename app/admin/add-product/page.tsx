"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Loader2, CheckCircle, Trash2, LayoutGrid, Link as LinkIcon } from "lucide-react";

const MEGA_MENU_DATA = {
  FASHION: {
    Clothing: ["New Arrivals", "Dresses", "Jeans", "Jackets & Coats", "Knitwear", "Tops & T-Shirts"],
    Shoes: ["Boots", "Heels & Wedges", "Sneakers", "Pumps & Slip-Ons", "Sandals", "Slippers"],
    "Formal Wear": ["Formal Dresses", "Tops & Shirts", "Shorts", "Skirts", "Pants", "Suits"],
    Accessories: ["Bags & Purses", "Belts", "Jewellery", "Sunglasses", "Watches", "Hats & Caps"]
  },
  DRESSES: {
    "By Length": ["Mini", "Midi", "Maxi", "Midaxi", "Knee-Length"],
    "By Style": ["Wrap", "Bodycon", "Shirt", "Slip", "A-Line"],
    "Occasion": ["Casual", "Party", "Workwear", "Wedding Guest", "Evening"]
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

  // 1. Add via File Upload
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newDrafts = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      name: "",
      price: "",
      brand: "Colman Looks", 
      category: "Tops & T-Shirts",
      department: "Men", 
      description: "", 
      sizes: "S, M, L, XL", 
      stock: "", // 🟢 Default to empty since it is optional!
    }));

    setDrafts((prev) => [...prev, ...newDrafts]);
    e.target.value = '';
  };

  // 2. Add via Image Link
  const handleAddFromLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!linkInput.trim()) return;

    const newDraft: DraftProduct = {
      id: Math.random().toString(36).substring(7),
      file: null, 
      previewUrl: linkInput.trim(),
      name: "", 
      price: "",
      brand: "Colman Looks",
      category: "Tops & T-Shirts",
      department: "Men",
      description: "",
      sizes: "S, M, L, XL",
      stock: "", // 🟢 Default to empty since it is optional!
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
    const hasEmptyFields = drafts.some(d => !d.price || !d.brand);
    if (hasEmptyFields) {
      alert("Please fill out the Price and Brand for all selected items!");
      return;
    }

    setIsSubmitting(true);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      const uploadPromises = drafts.map(async (draft) => {
        let finalImageUrl = draft.previewUrl;

        // Upload to Supabase if it's a file
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

          if (!res.ok) {
             const errorText = await res.text();
             throw new Error(`Supabase Upload Blocked: ${errorText}`);
          }
          finalImageUrl = `${supabaseUrl}/storage/v1/object/public/products/${fileName}`;
        }

        const sizeArray = draft.sizes
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        return {
          name: draft.name.trim() || "McCollins Exclusive",
          price: Number(draft.price),
          brand: draft.brand,
          imageUrl: finalImageUrl,
          description: draft.description || null,
          category: draft.category,
          department: draft.department, 
          sizeType: "clothing",
          sizes: sizeArray,
          // 🟢 If they leave it blank, default to 10 in the background to keep Prisma happy
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

      if (!dbRes.ok) {
         const dbError = await dbRes.text();
         throw new Error(`Database Error: ${dbError}`);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 2000);

    } catch (error: any) {
      console.error(error);
      alert(error.message || "An error occurred during the batch upload.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 pb-20">
      <nav className="bg-[#131921] text-white px-6 py-4 flex items-center shadow-md sticky top-0 z-50">
        <Link href="/admin" className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <LayoutGrid className="w-6 h-6 text-[#007185]" /> Batch Product Uploader
            </h1>
            <p className="text-gray-500 text-sm mt-1">Select multiple photos or paste image links to quickly add inventory.</p>
          </div>
          
          {drafts.length > 0 && !success && (
            <button 
              onClick={handlePublishAll}
              disabled={isSubmitting}
              className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] px-6 py-2.5 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin"/> Uploading...</>
              ) : (
                <><UploadCloud className="w-4 h-4"/> Publish {drafts.length} {drafts.length === 1 ? 'Product' : 'Products'}</>
              )}
            </button>
          )}
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-12 rounded-xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 shadow-sm">
            <CheckCircle className="w-20 h-20 mb-4 text-green-500" />
            <h2 className="text-3xl font-black">Success!</h2>
            <p className="mt-2 text-green-600 font-medium">All {drafts.length} products are now live in the database.</p>
            <p className="text-sm text-green-500 mt-4">Returning to dashboard...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <label htmlFor="multi-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-[#f2f8f9] hover:border-[#007185] rounded-lg cursor-pointer transition-colors group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 group-hover:text-[#007185]">
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <p className="text-sm font-bold">Click to select product images</p>
                  <p className="text-xs mt-1">You can select multiple files at once!</p>
                </div>
                <input id="multi-upload" type="file" multiple accept="image/*" onChange={handleFilesSelected} className="hidden" />
              </label>

              <div className="flex items-center gap-4 my-4">
                <hr className="flex-1 border-gray-100" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">OR PULL FROM WEB</span>
                <hr className="flex-1 border-gray-100" />
              </div>

              <form onSubmit={handleAddFromLink} className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    placeholder="Paste an image URL here (e.g., https://example.com/image.jpg)"
                    className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-4 py-3 text-sm outline-none focus:border-[#007185] transition-colors"
                    value={linkInput}
                    onChange={e => setLinkInput(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={!linkInput} className="bg-[#131921] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-black disabled:opacity-50 transition-colors">
                  Add Link
                </button>
              </form>
            </div>

            {drafts.length > 0 && (
              <div className="space-y-4 animate-in fade-in duration-500">
                {drafts.map((draft, index) => (
                  <div key={draft.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6 relative group">
                    
                    <button onClick={() => removeDraft(draft.id)} className="absolute -top-3 -right-3 bg-white border border-gray-200 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-colors z-10 hidden md:block group-hover:block">
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="w-full md:w-40 h-40 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                      <img src={draft.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-x-4 gap-y-3 items-start">
                      
                      <div className="sm:col-span-3">
                         <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Name (Optional)</label>
                         <input type="text" value={draft.name} onChange={(e) => updateDraft(draft.id, 'name', e.target.value)} placeholder="e.g. Minimalist Hoodie" className="w-full border-b-2 border-gray-200 focus:border-[#007185] bg-transparent px-2 py-1.5 outline-none font-medium text-gray-900 text-sm" />
                      </div>
                      
                      <div className="sm:col-span-1">
                         <label className="block text-[11px] font-bold text-[#E3000F] uppercase tracking-wider mb-1">Price (Tsh) *</label>
                         <div className="relative">
                           <span className="absolute left-2 top-1.5 text-gray-400 text-sm font-bold">Tsh</span>
                           <input type="number" value={draft.price} onChange={(e) => updateDraft(draft.id, 'price', e.target.value)} placeholder="35000" className="w-full border-b-2 border-gray-200 focus:border-[#007185] bg-transparent pl-10 pr-2 py-1.5 outline-none font-bold text-[#B12704] text-sm" />
                         </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Department *</label>
                        <div className="relative">
                          <select 
                            value={draft.department} 
                            onChange={(e) => updateDraft(draft.id, 'department', e.target.value)} 
                            className="w-full border-b-2 border-gray-200 focus:border-[#007185] bg-transparent px-2 py-1.5 outline-none text-gray-900 font-medium text-sm cursor-pointer appearance-none"
                          >
                            <option value="Men">Men</option>
                            <option value="Women">Women</option>
                            <option value="Kids">Kids</option>
                            <option value="Unisex">Unisex</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Category *</label>
                        <div className="relative">
                          <select 
                            value={draft.category} 
                            onChange={(e) => updateDraft(draft.id, 'category', e.target.value)} 
                            className="w-full border-b-2 border-gray-200 focus:border-[#007185] bg-transparent px-2 py-1.5 outline-none text-gray-900 font-medium text-sm cursor-pointer appearance-none"
                          >
                            <option value="" disabled>Select Category...</option>
                            {Object.entries(MEGA_MENU_DATA).map(([mainNav, subMenus]) => (
                              Object.entries(subMenus).map(([groupName, items]) => (
                                <optgroup key={`${mainNav}-${groupName}`} label={`${mainNav} > ${groupName}`}>
                                  {items.map(item => (
                                    <option key={item} value={item}>{item}</option>
                                  ))}
                                </optgroup>
                              ))
                            ))}
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                         <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Sizes</label>
                         <input type="text" value={draft.sizes} onChange={(e) => updateDraft(draft.id, 'sizes', e.target.value)} placeholder="S, M, L..." className="w-full border-b-2 border-gray-200 focus:border-[#007185] bg-transparent px-2 py-1.5 outline-none font-medium text-gray-900 text-sm" />
                      </div>

                      <div className="sm:col-span-2">
                         {/* 🟢 Removed the red text and the asterisk! */}
                         <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Stock Qty (Optional)</label>
                         <input type="number" min="0" placeholder="e.g. 10" value={draft.stock} onChange={(e) => updateDraft(draft.id, 'stock', e.target.value)} className="w-full border-b-2 border-gray-200 focus:border-[#007185] bg-transparent px-2 py-1.5 outline-none font-medium text-gray-900 text-sm" />
                      </div>

                      <div className="sm:col-span-4">
                         <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                         <input type="text" value={draft.description} onChange={(e) => updateDraft(draft.id, 'description', e.target.value)} placeholder="Add a short description..." className="w-full border-b-2 border-gray-200 focus:border-[#007185] bg-transparent px-2 py-1.5 outline-none text-gray-600 text-sm" />
                      </div>

                      <button onClick={() => removeDraft(draft.id)} className="md:hidden w-full flex items-center justify-center gap-2 text-red-500 text-sm font-bold py-2 bg-red-50 rounded-lg mt-2 sm:col-span-4">
                        <Trash2 className="w-4 h-4" /> Remove Item
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