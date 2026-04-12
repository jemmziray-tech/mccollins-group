"use client";

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ orders }: { orders: any[] }) {
  
  // 🟢 SMART LOGIC: Group orders by date for the last 7 days
  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    });

    return last7Days.map(date => {
      // Find all completed orders for this specific date
      const dailyRevenue = orders
        .filter(order => order.status === "COMPLETED" && order.createdAt.startsWith(date))
        .reduce((sum, order) => sum + order.totalAmount, 0);

      // Format date for the X-Axis (e.g., "Apr 12")
      const displayDate = new Date(date).toLocaleDateString("en-GB", { month: 'short', day: 'numeric' });

      return { date: displayDate, revenue: dailyRevenue };
    });
  }, [orders]);

  // Custom Tooltip for that Luxury Vibe
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F1115] border border-[#D4AF37]/30 p-3 rounded-sm shadow-xl">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{label}</p>
          <p className="text-[#D4AF37] font-serif text-lg">TSH {payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-6 duration-700 w-full mb-12">
      <div className="mb-6">
        <h2 className="text-xl font-serif text-[#1A1A1A] mb-1">Revenue Overview</h2>
        <p className="text-xs text-gray-500 font-medium">Completed transactions over the last 7 days.</p>
      </div>
      
      {/* 🟢 Responsive Container ensures it works on Mobile and Desktop! */}
      <div className="w-full h-[300px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              {/* The Signature McCollins Gold Gradient */}
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }}
              tickFormatter={(val) => `Tsh ${val >= 1000 ? (val / 1000) + 'k' : val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#D4AF37" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#goldGradient)" 
              activeDot={{ r: 6, fill: '#0F1115', stroke: '#D4AF37', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}