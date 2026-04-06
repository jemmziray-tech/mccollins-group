// app/admin/edit-product/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PackageSearch, ArrowLeft, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams(); // Grabs the [id] from the URL!
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notification, setNotification] = useState<{type: "success" | "error", message: string} | null>(null);
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    brand: "",
    imageUrl: "",
    description: "",
    category: "Outerwear",
    sizeType: "clothing", 
  });

  // Fetch the existing product data as soon as the page loads
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products?id=${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        // Pre-fill the form with the database data
        setFormData({
          id: data.id,
          name: data.name,
          price: data.price.toString(),
          brand: data.brand,
          imageUrl: data.imageUrl,
          description: data.description || "",
          category: data.category,
          sizeType: data.sizeType,
        });
      } catch (error) {
        setNotification({ type: "error", message: "Failed to load product data." });
      } finally {
        setIsFetching(false);
      }
    };

    if (params.id) fetchProduct();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);

    const finalImageUrl = formData.imageUrl.trim() === "" 
      ? "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800" 
      : formData.imageUrl;

    try {
      // Notice we are using PUT instead of POST
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, imageUrl: finalImageUrl }),
      });

      if (!res.ok) throw new Error("Failed to update product");

      setNotification({ type: "success", message: "Product updated successfully!" });
      
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1500);

    } catch (error) {
      setNotification({ type: "error", message: "Something went wrong while updating." });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">Loading product data...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-8 font-sans pb-20">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 bg-white rounded-md shadow-sm text-gray-500 hover:text-gray-900 transition-colors border border-gray-200">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 shadow-sm ${notification.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {notification.type === "success" ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PackageSearch className="w-5 h-5 text-[#007185]"/> Basic Information
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name *</label>
                  <input required type="text" 
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007185] text-gray-900"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea rows={5} 
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007185] resize-none text-gray-900"
                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Media Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Media</h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image URL</label>
                  <input type="url" 
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007185] text-gray-900"
                    value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} 
                  />
                </div>
                <div className="w-full md:w-48 h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center overflow-hidden flex-shrink-0">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Settings & Pricing */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pricing & Brand</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (Tsh) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-medium z-10">Tsh</span>
                    <input required type="number" 
                      className="w-full border border-gray-300 pl-12 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007185] text-gray-900 relative"
                      value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brand *</label>
                  <input required type="text" 
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007185] text-gray-900"
                    value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Organization</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                  <select 
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007185] text-gray-900 bg-white"
                    value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Shirts">Shirts & Tees</option>
                    <option value="Outerwear">Jackets & Outerwear</option>
                    <option value="Denim">Jeans & Denim</option>
                    <option value="Footwear">Shoes & Boots</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Size Type</label>
                  <select 
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007185] text-gray-900 bg-white"
                    value={formData.sizeType} onChange={(e) => setFormData({...formData, sizeType: e.target.value})}
                  >
                    <option value="clothing">Clothing (S, M, L, XL)</option>
                    <option value="shoes">Shoes (40, 41, 42, etc)</option>
                    <option value="none">One Size / Accessories</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button disabled={isLoading} type="submit" 
                className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold py-3.5 rounded-lg shadow-sm disabled:opacity-70 flex items-center justify-center transition-transform active:scale-95"
              >
                {isLoading ? "Updating..." : "Update Product"}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}