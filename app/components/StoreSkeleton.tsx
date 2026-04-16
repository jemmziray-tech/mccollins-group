// app/components/StoreSkeleton.tsx
import React from "react";

export default function StoreSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] w-full animate-pulse">
      
      {/* 1. Hero / Navigation Area Skeleton */}
      <div className="w-full h-[50vh] bg-gray-200 mb-16"></div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6">
        {/* 2. Collection Title Skeleton */}
        <div className="flex flex-col gap-2 mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded-sm"></div>
          <div className="h-4 w-48 bg-gray-100 rounded-sm"></div>
        </div>

        {/* 3. Product Grid Skeleton (Perfectly matches your StoreClient grid) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {/* We generate 10 blank cards to fill the screen */}
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col">
              {/* Image Placeholder (Exactly 3/4 aspect ratio) */}
              <div className="w-full aspect-[3/4] bg-gray-200 rounded-sm mb-4"></div>
              
              {/* Brand Text Placeholder */}
              <div className="h-2 w-16 bg-gray-200 rounded-sm mb-2"></div>
              
              {/* Product Title Placeholder (Two lines) */}
              <div className="h-3 w-3/4 bg-gray-200 rounded-sm mb-1.5"></div>
              <div className="h-3 w-1/2 bg-gray-200 rounded-sm mb-3"></div>
              
              {/* Price Placeholder */}
              <div className="h-4 w-24 bg-gray-300 rounded-sm mt-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}