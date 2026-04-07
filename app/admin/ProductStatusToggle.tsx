// app/admin/ProductStatusToggle.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProductStatusToggle({ productId, initialStatus }: { productId: string, initialStatus: boolean }) {
  const [isAvailable, setIsAvailable] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleStatus = async () => {
    const newStatus = !isAvailable; // Flips true to false, or false to true
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/products/update-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, isAvailable: newStatus }),
      });
      
      if (res.ok) {
        setIsAvailable(newStatus);
        router.refresh(); // Refreshes the page data silently
      } else {
        alert("Failed to update product status.");
      }
    } catch (error) {
      alert("Network error updating status.");
    }
    
    setIsLoading(false);
  };

  return (
    <button
      onClick={toggleStatus}
      disabled={isLoading}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm border ${
        isAvailable 
          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
          : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
      )}
      {isAvailable ? "Active" : "Hidden"}
    </button>
  );
}