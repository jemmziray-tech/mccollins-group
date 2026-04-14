// app/admin/BespokeStatusSelect.tsx (or components/BespokeStatusSelect.tsx depending on your structure)
"use client";

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function BespokeStatusSelect({ requestId, initialStatus }: { requestId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const statuses = [
    "Pending Review", 
    "Consulted", 
    "In Production", 
    "Ready for Fitting",
    "Completed", 
    "Cancelled"
  ];

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setIsLoading(true);

    try {
      const res = await fetch('/api/bespoke', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update");
    } catch (error) {
      alert("Failed to update status.");
      setStatus(initialStatus); // Revert on failure
    } finally {
      setIsLoading(false);
    }
  };

  // Luxury color coding for the Master Tailor Queue
  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Pending Review': return 'text-[#997A00] bg-[#D4AF37]/10 border-[#D4AF37]/30'; // Gold
      case 'Consulted': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'In Production': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'Ready for Fitting': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'Completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'Cancelled': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  return (
    <div className="relative inline-block">
      {isLoading && (
        <div className="absolute -left-6 top-1/2 -translate-y-1/2">
          <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />
        </div>
      )}
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={isLoading}
        className={`appearance-none text-[10px] font-bold uppercase tracking-widest border px-4 py-1.5 rounded-full outline-none cursor-pointer transition-colors ${getStatusColor(status)}`}
        style={{ textAlignLast: 'center' }}
      >
        {statuses.map((s) => (
          <option key={s} value={s} className="bg-[#1A1A1A] text-white">
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}