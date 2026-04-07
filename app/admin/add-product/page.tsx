// app/admin/add-product/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Loader2, CheckCircle, Trash2, LayoutGrid } from "lucide-react";

// The shape of our temporary local products before they go to the database
type DraftProduct = {
  id: string; // Temporary ID for React
  file: File;
  previewUrl: string;
  name: string;
  price: string;
  brand: string;
  category: string;
};

export default function AddProductPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftProduct[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // 1. HANDLE BATCH FILE DROPS
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Convert the files into our "Draft" objects
    const newDrafts = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      name: "",
      price: "",
      brand: "McCollins", // Default brand to save typing!
      category: "Shirts", // Default category
    }));

    setDrafts((prev) => [...prev, ...newDrafts]);
    // Clear the input so you can select more files if needed
    e.target.value = '';
  };

  // 2. UPDATE A SPECIFIC DRAFT'S DATA
  const updateDraft = (id: string, field: keyof DraftProduct, value: string) => {
    setDrafts((prev) => 
      prev.map((draft) => draft.id === id ? { ...draft, [field]: value } : draft)
    );
  };

  // 3. REMOVE A DRAFT BEFORE UPLOADING
  const removeDraft = (id: string) => {
    setDrafts((prev) => prev.filter((draft) => draft.id !== id));
  };

  // 4. THE MASTER BATCH UPLOAD FUNCTION
  const handlePublishAll = async () => {
    // Validation
    const hasEmptyFields = drafts.some(d => !d.name || !d.price || !d.brand);
    if (hasEmptyFields) {
      alert("Please fill out the Name, Price, and Brand for all selected images!");
      return;
    }

    setIsSubmitting(true);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      // Step A: Upload all images to Supabase CONCURRENTLY for maximum speed
      const uploadPromises = drafts.map(async (draft) => {
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

        if (!res.ok) throw new Error("Image upload failed");

        // Return the clean data object ready for Prisma
        return {
          name: draft.name,
          price: Number(draft.price),
          brand: draft.brand,
          imageUrl: `${supabaseUrl}/storage/v1/object/public/products/${fileName}`,
          description: "Premium McCollins Fashion", // Default description for batch uploads
          category: draft.category,
          sizeType: "clothing",
          isAvailable: true,
        };
      });

      // Wait for all image uploads to finish
      const finalProductsArray = await Promise.all(uploadPromises);

      // Step B: Send the entire array to our new Bulk API route
      const dbRes = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalProductsArray),
      });

      if (!dbRes.ok) throw new Error("Failed to save products to database.");

      // Step C: Celebrate!
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 2000);

    } catch (error: any) {
      console.error(error);
      alert("An error occurred during the batch upload.");
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
            <p className="text-gray-500 text-sm mt-1">Select multiple photos to quickly add inventory.</p>
          </div>
          
          {/* Action Button (Top Right) */}
          {drafts.length > 0 && !success && (
            <button 
              onClick={handlePublishAll}
              disabled={isSubmitting}
              className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] px-6 py-2.5 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin"/> Uploading...</> : <><UploadCloud className="w-4 h-4"/> Publish {drafts.length} Products</>}
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
            
            {/* THE MASTER DROPZONE */}
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
              <label htmlFor="multi-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-[#f2f8f9] hover:border-[#007185] rounded-lg cursor-pointer transition-colors group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 group-hover:text-[#007185]">
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <p className="text-sm font-bold">Click to select product images</p>
                  <p className="text-xs mt-1">You can select multiple files at once!</p>
                </div>
                <input id="multi-upload" type="file" multiple accept="image/*" onChange={handleFilesSelected} className="hidden" />
              </label>
            </div>

            {/* THE DYNAMIC QUICK-EDIT LIST */}
            {drafts.length > 0 && (
              <div className="space-y-4 animate-in fade-in duration-500">
                {drafts.map((draft, index) => (
                  <div key={draft.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6 relative group">
                    
                    {/* Delete Button */}
                    <button onClick={() => removeDraft(draft.id)} className="absolute -top-3 -right-3 bg-white border border-gray-200 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-colors z-10 hidden md:block group-hover:block">
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Image Preview */}
                    <div className="w-full md:w-40 h-40 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                      <img src={draft.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>

                    {/* Quick Edit Inputs */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Product {index + 1} Name</label>
                        <input type="text" value={draft.name} onChange={(e) => updateDraft(draft.id, 'name', e.target.value)} placeholder="e.g. Minimalist Black Hoodie" className="w-full border-b-2 border-gray-200 focus:border-[#007185] bg-transparent px-2 py-2 outline-none font-medium text-gray-900 transition-colors" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Price (Tsh)</label>
                        <div className="relative">
                          <span className="absolute left-2 top-2 text-gray-400 text-sm font-bold">Tsh</span>
                          <input type="number" value={draft.price} onChange={(e) => updateDraft(draft.id, 'price', e.target.value)} placeholder="35000" className="w-full border-b-2 border-gray-200 focus:border-[#007185] bg-transparent pl-10 pr-2 py-2 outline-none font-bold text-[#B12704] transition-colors" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                        <select value={draft.category} onChange={(e) => updateDraft(draft.id, 'category', e.target.value)} className="w-full border-b-2 border-gray-200 focus:border-[#007185] bg-transparent px-2 py-2 outline-none text-gray-700 transition-colors cursor-pointer">
                          <option value="Shirts">Shirts & Tees</option>
                          <option value="Denim">Jeans & Denim</option>
                          <option value="Outerwear">Jackets & Outerwear</option>
                          <option value="Footwear">Shoes & Boots</option>
                          <option value="Accessories">Accessories</option>
                        </select>
                      </div>

                      {/* Mobile Delete Button */}
                      <button onClick={() => removeDraft(draft.id)} className="md:hidden w-full flex items-center justify-center gap-2 text-red-500 text-sm font-bold py-2 bg-red-50 rounded-lg mt-2">
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