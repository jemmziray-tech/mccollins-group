"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  PackageSearch,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Loader2,
  Sparkles,
} from "lucide-react";
import { TAXONOMY } from "@/lib/product-taxonomy";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [existingHoverUrl, setExistingHoverUrl] = useState<string>("");
  const [newHoverFile, setNewHoverFile] = useState<File | null>(null);
  const [hoverPreviewUrl, setHoverPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    brand: "McCollins Exclusive",
    description: "",
    category: "Dresses",
    department: "Women",
    collection: "None",
    sizes: "S, M, L",
    sizeType: "clothing",
    stock: "10",
    isAvailable: true,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products?id=${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();

        setFormData({
          id: data.id,
          name: data.name || "",
          price: data.price ? data.price.toString() : "",
          brand: data.brand || "McCollins Exclusive",
          description: data.description || "",
          category: data.category || "New Arrivals",
          department: data.department || "Unisex",
          collection: data.collection || "None",
          sizes: Array.isArray(data.sizes) ? data.sizes.join(", ") : (data.sizes || "S, M, L"),
          sizeType: data.sizeType || "clothing",
          stock: data.stock !== undefined ? data.stock.toString() : "10",
          isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
        });

        setExistingImageUrl(data.imageUrl || "");
        setPreviewUrl(data.imageUrl || null);

        setExistingHoverUrl(data.hoverImageUrl || "");
        setHoverPreviewUrl(data.hoverImageUrl || null);
      } catch (error) {
        setNotification({ type: "error", message: "Failed to load product data." });
      } finally {
        setIsFetching(false);
      }
    };

    if (params.id) fetchProduct();
  }, [params.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleHoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewHoverFile(file);
      setHoverPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);

    try {
      let finalImageUrl = existingImageUrl;
      let finalHoverUrl = existingHoverUrl;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Primary Image upload if changed
      if (newImageFile) {
        const fileExt = newImageFile.name.split(".").pop();
        const fileName = `main-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/products/${fileName}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": newImageFile.type,
          },
          body: newImageFile,
        });

        if (!uploadRes.ok) throw new Error("Failed to upload primary image to Supabase");
        finalImageUrl = `${supabaseUrl}/storage/v1/object/public/products/${fileName}`;
      }

      // Hover Image upload if changed
      if (newHoverFile) {
        const hExt = newHoverFile.name.split(".").pop();
        const hName = `hover-${Date.now()}-${Math.random().toString(36).substring(2)}.${hExt}`;

        const hUploadRes = await fetch(`${supabaseUrl}/storage/v1/object/products/${hName}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": newHoverFile.type,
          },
          body: newHoverFile,
        });

        if (!hUploadRes.ok) throw new Error("Failed to upload hover image to Supabase");
        finalHoverUrl = `${supabaseUrl}/storage/v1/object/public/products/${hName}`;
      }

      const sizeArray = formData.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
          sizes: sizeArray,
          imageUrl: finalImageUrl,
          hoverImageUrl: finalHoverUrl || null,
          collection: formData.collection === "None" ? null : formData.collection,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update product");
      }

      setNotification({ type: "success", message: "Product updated successfully!" });

      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1200);
    } catch (error: any) {
      setNotification({
        type: "error",
        message: error.message || "Something went wrong while updating.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-sans pb-20 text-[#1A1A1A]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2.5 bg-white rounded-sm shadow-sm text-gray-500 hover:text-[#D4AF37] transition-colors border border-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#1A1A1A] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" /> Edit Product Catalog
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Refine pricing, inventory stock, imagery, and collection metadata.
              </p>
            </div>
          </div>
        </div>

        {notification && (
          <div
            className={`mb-6 p-4 rounded-sm flex items-center gap-3 shadow-sm ${
              notification.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium text-sm">{notification.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Main Details & Images */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PackageSearch className="w-5 h-5 text-[#D4AF37]" /> Basic Information
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                    Product Name *
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-sm focus:outline-none focus:border-[#D4AF37] text-gray-900 font-serif text-lg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-sm focus:outline-none focus:border-[#D4AF37] resize-none text-gray-700 text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Media Cards: Primary & Hover Images */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6 space-y-6">
              <h2 className="text-base font-bold text-gray-900">Media & Photography</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Primary Image */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Primary Image
                  </label>
                  <div className="relative w-full h-56 bg-gray-50 border-2 border-dashed border-gray-200 rounded-sm flex flex-col items-center justify-center overflow-hidden group cursor-pointer hover:border-[#D4AF37] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {previewUrl ? (
                      <>
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity z-0">
                          <UploadCloud className="w-7 h-7 text-white mb-1" />
                          <span className="text-white text-[10px] font-bold uppercase tracking-wider">
                            Change Photo
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-xs font-bold">Select Primary</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lifestyle Hover Image */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Hover Swap Image (Optional)
                  </label>
                  <div className="relative w-full h-56 bg-gray-50 border-2 border-dashed border-gray-200 rounded-sm flex flex-col items-center justify-center overflow-hidden group cursor-pointer hover:border-[#D4AF37] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHoverImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {hoverPreviewUrl ? (
                      <>
                        <img src={hoverPreviewUrl} alt="Hover Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity z-0">
                          <UploadCloud className="w-7 h-7 text-white mb-1" />
                          <span className="text-white text-[10px] font-bold uppercase tracking-wider">
                            Change Hover
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-xs font-bold">Select Hover</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Settings, Taxonomy & Inventory */}
          <div className="space-y-6">
            <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Pricing & Inventory</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                    Price (Tsh) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-bold">Tsh</span>
                    <input
                      required
                      type="number"
                      className="w-full border border-gray-200 pl-12 pr-4 py-2 rounded-sm focus:outline-none focus:border-[#D4AF37] text-gray-900 font-bold"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                    Inventory Stock *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full border border-gray-200 px-4 py-2 rounded-sm focus:outline-none focus:border-[#D4AF37] text-gray-900 font-bold text-sm"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                    Brand / Designer *
                  </label>
                  <select
                    className="w-full border border-gray-200 px-3 py-2 rounded-sm focus:outline-none focus:border-[#D4AF37] text-gray-900 bg-white text-xs font-bold uppercase tracking-wider"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  >
                    {TAXONOMY.BRANDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                    Available Sizes (Comma separated)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 px-4 py-2 rounded-sm focus:outline-none focus:border-[#D4AF37] text-gray-900 font-bold text-xs uppercase"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="S, M, L, XL"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Taxonomy & Placement</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                    Department
                  </label>
                  <select
                    className="w-full border border-gray-200 px-3 py-2 rounded-sm focus:outline-none focus:border-[#D4AF37] text-gray-900 bg-white text-xs font-bold uppercase tracking-wider"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    {TAXONOMY.DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                    Category
                  </label>
                  <select
                    className="w-full border border-gray-200 px-3 py-2 rounded-sm focus:outline-none focus:border-[#D4AF37] text-gray-900 bg-white text-xs font-bold uppercase tracking-wider"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {Object.entries(TAXONOMY.CATEGORIES).map(([groupName, items]) => (
                      <optgroup key={groupName} label={groupName}>
                        {items.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                    Collection (Tag)
                  </label>
                  <select
                    className="w-full border border-gray-200 px-3 py-2 rounded-sm focus:outline-none focus:border-[#D4AF37] text-gray-900 bg-white text-xs font-bold uppercase tracking-wider"
                    value={formData.collection}
                    onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                  >
                    {Object.entries(TAXONOMY.COLLECTIONS).map(([groupName, items]) => (
                      <optgroup key={groupName} label={groupName}>
                        {items.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                    Size Type
                  </label>
                  <select
                    className="w-full border border-gray-200 px-3 py-2 rounded-sm focus:outline-none focus:border-[#D4AF37] text-gray-900 bg-white text-xs font-bold"
                    value={formData.sizeType}
                    onChange={(e) => setFormData({ ...formData, sizeType: e.target.value })}
                  >
                    {TAXONOMY.SIZE_TYPES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Product is Active & Available
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                disabled={isLoading}
                type="submit"
                className="w-full bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-[#0F1115] font-bold uppercase tracking-[0.15em] text-[11px] py-3.5 rounded-sm shadow-sm disabled:opacity-70 flex items-center justify-center transition-colors active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving Updates...
                  </>
                ) : (
                  "Update Product"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}