"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Add a simple confirmation dialog so the admin doesn't delete by mistake!
    const confirmed = window.confirm("Are you sure you want to delete this product? This action cannot be undone.");
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/products?id=${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }

      // Tell Next.js to refresh the server component so the product disappears!
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className={`p-2 rounded-lg transition-colors ${
        isDeleting ? "text-gray-400 bg-gray-50 cursor-not-allowed" : "text-red-600 hover:bg-red-50"
      }`} 
      title="Delete Product"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
