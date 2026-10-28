"use client";

import React, { useState } from 'react';
import { Archive, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ productId }: { productId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    // 1. Safety Check
    const confirmDelete = window.confirm("Archive this product? It will leave the storefront. Previous orders and images will be preserved.");
    if (!confirmDelete) return;

    // 2. Trigger Loading State
    setIsDeleting(true);

    try {
      // 3. Call the DELETE API Route
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 4. Refresh the page data instantly behind the scenes!
        router.refresh();
      } else {
        const data = await response.json();
        alert(`Failed to archive: ${data.error}`);
        setIsDeleting(false); // Turn off loading so they can try again
      }
    } catch (error) {
      console.error("Archive Error:", error);
      alert("A network error occurred while trying to archive the product.");
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Archive Product"
      aria-label="Archive product"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
    </button>
  );
}