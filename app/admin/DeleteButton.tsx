"use client";

import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ productId }: { productId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    // 1. Safety Check
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this product? This cannot be undone.");
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
        alert(`Failed to delete: ${data.error}`);
        setIsDeleting(false); // Only turn off loading if it failed (if it succeeded, the page refreshes anyway)
      }
    } catch (error) {
      console.error(error);
      alert("Network error occurred while trying to delete.");
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Delete Product"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}