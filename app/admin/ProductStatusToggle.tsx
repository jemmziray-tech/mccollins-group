"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProductStatusToggle({ productId, initialStatus }: { productId: string, initialStatus: boolean }) {
  const [isAvailable, setIsAvailable] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleStatus = async () => {
    setIsLoading(true);
    const newStatus = !isAvailable;
    
    // Optimistically update the UI so it feels instant
    setIsAvailable(newStatus);

    try {
      // Call our new PATCH API route
      const response = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, isAvailable: newStatus })
      });

      if (!response.ok) {
        // If the database fails, revert the toggle back to normal
        setIsAvailable(!newStatus);
        alert("Failed to update product visibility.");
      } else {
        router.refresh();
      }
    } catch (error) {
      setIsAvailable(!newStatus);
      alert("Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={toggleStatus}
        disabled={isLoading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
          isAvailable ? 'bg-green-500' : 'bg-gray-300'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span 
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${
            isAvailable ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      ) : (
        <span className={`text-xs font-bold uppercase tracking-wider ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
          {isAvailable ? 'Visible' : 'Hidden'}
        </span>
      )}
    </div>
  );
}