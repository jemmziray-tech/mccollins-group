// app/admin/add-product/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Loader2, Image as ImageIcon, CheckCircle } from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    brand: "",
    description: "",
    category: "Shirts",
    sizeType: "clothing",
  });

  // Handle Text Inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create a temporary local URL so the admin can see the photo immediately
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  // THE MASTER SUBMIT FUNCTION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Please select an image for the product.");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // 1. UPLOAD IMAGE TO SUPABASE BUCKET
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`; // Unique name
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/products/${fileName}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": imageFile.type,
        },
        body: imageFile,
      });

      if (!uploadRes.ok) throw new Error("Image upload failed. Is your Supabase bucket public?");

      // 2. GET THE PUBLIC URL FROM SUPABASE
      const finalImageUrl = `${supabaseUrl}/storage/v1/object/public/products/${fileName}`;

      // 3. SAVE EVERYTHING TO YOUR PRISMA DATABASE
      const dbRes = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrl: finalImageUrl, // Inject the new Supabase URL!
        }),
      });

      if (!dbRes.ok) throw new Error("Failed to save product to database.");

      // Success! Show a checkmark, then go back to the dashboard
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1500);

    } catch (error: any) {
      console.error(error);
      alert(error.message || "An error occurred during upload.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 pb-12">
      {/* Navbar */}
      <nav className="bg-[#131921] text-white px-6 py-4 flex items-center shadow-md">
        <Link href="/admin" className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h1>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-8 rounded-xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
            <CheckCircle className="w-16 h-16 mb-4 text-green-500" />
            <h2 className="text-2xl font-bold">Product Published!</h2>
            <p className="mt-2 text-green-600">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* LEFT COLUMN: Main Details */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold mb-4 text-gray-800">Basic Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#febd69] focus:border-transparent outline-none" placeholder="e.g. Vintage Wash Denim Jacket" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#febd69] focus:border-transparent outline-none" placeholder="Describe the product material, fit, and style..."></textarea>
                    </div>
                  </div>
                </div>

                {/* NEW MEDIA UPLOAD SECTION */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold mb-4 text-gray-800">Product Image *</h3>
                  
                  <div className="flex flex-col items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${imagePreview ? 'border-[#febd69] bg-orange-50/30' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                      
                      {imagePreview ? (
                        <div className="relative w-full h-full p-2">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                            <p className="text-white font-bold flex items-center gap-2"><UploadCloud className="w-5 h-5"/> Change Photo</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                          <p className="mb-2 text-sm text-gray-500 font-medium">Click to upload a photo</p>
                          <p className="text-xs text-gray-400">PNG, JPG or WebP (MAX. 5MB)</p>
                        </div>
                      )}
                      
                      <input id="dropzone-file" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Pricing & Categories */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold mb-4 text-gray-800">Pricing & Brand</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (Tsh) *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500 text-sm">Tsh</span>
                        <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#febd69] outline-none" placeholder="45000" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                      <input required type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#febd69] outline-none" placeholder="e.g. McCollins" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold mb-4 text-gray-800">Organization</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select name="category" value={formData.category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#febd69] outline-none bg-white">
                        <option value="Shirts">Shirts & Tees</option>
                        <option value="Denim">Jeans & Denim</option>
                        <option value="Outerwear">Jackets & Outerwear</option>
                        <option value="Footwear">Shoes & Boots</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Size Type</label>
                      <select name="sizeType" value={formData.sizeType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#febd69] outline-none bg-white">
                        <option value="clothing">Clothing (S, M, L, XL)</option>
                        <option value="shoes">Shoes (40, 41, 42...)</option>
                        <option value="none">One Size / None</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full py-3.5 rounded-xl font-bold shadow-sm flex justify-center items-center gap-2 transition-all ${isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] active:scale-95'}`}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Uploading & Saving...</>
                  ) : (
                    <><UploadCloud className="w-5 h-5" /> Publish Product</>
                  )}
                </button>

              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}