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

  // Dynamic styling based on the current status
  let bgColor = "bg-orange-100 text-orange-700 border-orange-200";
  if (status === "COMPLETED") bgColor = "bg-green-100 text-green-700 border-green-200";
  if (status === "CANCELLED") bgColor = "bg-red-100 text-red-700 border-red-200";

  return (
    <div className="relative inline-block text-left">
      {isLoading && <Loader2 className="w-4 h-4 animate-spin absolute -left-6 top-1.5 text-gray-400" />}
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={isLoading}
        className={`appearance-none font-bold text-xs px-3 py-1.5 rounded-full border outline-none cursor-pointer pr-8 transition-colors shadow-sm ${bgColor}`}
      >
        <option value="PENDING">PENDING</option>
        <option value="COMPLETED">COMPLETED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>
      
      {/* Custom Dropdown Arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-60">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
}