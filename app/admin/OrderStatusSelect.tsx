// app/admin/OrderStatusSelect.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function OrderStatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/orders/update-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, newStatus }),
      });
      
      if (res.ok) {
        setStatus(newStatus);
        // Magic Next.js feature: This silently refreshes the server data so your Revenue updates instantly!
        router.refresh(); 
      } else {
        alert("Failed to update order status.");
      }
    } catch (error) {
      alert("Network error updating status.");
    }
    
    setIsLoading(false);
  };

  // 🟢 LUXURY STYLING: Dynamic styling based on the current status
  let bgColor = "bg-[#D4AF37]/10 text-[#997A00] border-[#D4AF37]/30"; // Default: PENDING
  
  if (status === "PROCESSING") {
    bgColor = "bg-[#1A1A1A] text-white border-[#1A1A1A]";
  } else if (status === "COMPLETED") {
    bgColor = "bg-green-50 text-green-700 border-green-200";
  } else if (status === "CANCELLED") {
    bgColor = "bg-red-50 text-red-700 border-red-200";
  }

  return (
    <div className="relative inline-block text-left group">
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin absolute -left-6 top-1.5 text-[#D4AF37]" />}
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={isLoading}
        className={`appearance-none font-bold text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-sm border outline-none cursor-pointer pr-8 transition-colors shadow-sm ${bgColor} hover:shadow-md disabled:opacity-70`}
      >
        <option value="PENDING">PENDING</option>
        <option value="PROCESSING">PROCESSING</option>
        <option value="COMPLETED">COMPLETED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>
      
      {/* 🟢 Custom Sharp Dropdown Arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-60 group-hover:opacity-100 transition-opacity">
        <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
}