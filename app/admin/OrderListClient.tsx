"use client";

import React, { useState } from "react";
import { ShoppingBag, Search, Package, Download } from "lucide-react";
import OrderStatusSelect from "./OrderStatusSelect";

export default function OrderListClient({ initialOrders }: { initialOrders: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  // 1. FILTER LOGIC
  const filteredOrders = initialOrders.filter((order) => {
    // Check Tabs First
    if (activeTab !== "ALL" && order.status !== activeTab) return false;

    // Check Search Bar Second
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesId = order.id.toLowerCase().includes(searchLower);
      const matchesName = (order.user?.name || "").toLowerCase().includes(searchLower);
      const matchesEmail = (order.user?.email || "").toLowerCase().includes(searchLower);
      
      if (!matchesId && !matchesName && !matchesEmail) return false;
    }

    return true;
  });

  const tabs = ["ALL", "PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];

  // 🟢 CSV EXPORT LOGIC
  const handleExportCSV = () => {
    // 1. Create the Headers
    const headers = ["Order Ref", "Date", "Client Name", "Client Email", "Total Pieces", "Total Value (TSH)", "Status"];
    
    // 2. Map the filtered data to rows
    const rows = filteredOrders.map(order => {
      const itemCount = order.items.reduce((sum: any, item: any) => sum + item.quantity, 0);
      return [
        order.id.slice(-6).toUpperCase(),
        new Date(order.createdAt).toLocaleDateString("en-GB"),
        `"${order.user?.name || "Guest"}"`, // Quotes prevent comma issues in names
        order.user?.email || "N/A",
        itemCount,
        order.totalAmount,
        order.status
      ];
    });

    // 3. Combine and Download
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `McCollins_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-1000">
      
      {/* 🟢 EDITORIAL HEADER */}
      <div className="px-6 md:px-8 py-6 border-b border-gray-200 bg-[#FDFBF7] flex flex-col gap-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-serif text-[#1A1A1A] mb-1 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" strokeWidth={2} /> Recent Orders
            </h2>
            <p className="text-xs text-gray-500 font-medium">Track, manage, and fulfill client purchases.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-4 py-2 rounded-sm border border-[#D4AF37]/20">
              {filteredOrders.length} Orders
            </span>
            {/* 🟢 EXPORT BUTTON */}
            <button 
              onClick={handleExportCSV}
              className="bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-[#1A1A1A] px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors shadow-sm ml-auto sm:ml-0"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          {/* LUXURY FILTER TABS */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-sm w-full md:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? "bg-[#1A1A1A] text-[#D4AF37] shadow-md" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* LUXURY SEARCH BAR */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
            <input 
              type="text" 
              placeholder="Search ID, Client, or Email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 text-sm font-medium border border-gray-200 rounded-sm w-full outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all bg-white text-[#1A1A1A]"
            />
          </div>
        </div>
      </div>
      
      {/* EDITORIAL TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-400 bg-white">
              <th className="px-6 md:px-8 py-5 font-bold">Order Details</th>
              <th className="px-6 py-5 font-bold">Client Profile</th>
              <th className="px-6 py-5 font-bold">Curated Pieces</th>
              <th className="px-6 py-5 font-bold">Total Value</th>
              <th className="px-6 md:px-8 py-5 font-bold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Search className="w-12 h-12 mb-4 text-gray-300" strokeWidth={1} />
                    <h3 className="text-xl font-serif text-gray-800 mb-2">No Orders Found</h3>
                    <p className="text-sm text-gray-500">There are no client orders matching this criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const itemCount = order.items.reduce((sum: any, item: any) => sum + item.quantity, 0);
                
                return (
                  <tr key={order.id} className="hover:bg-[#FDFBF7] transition-colors group">
                    <td className="px-6 md:px-8 py-5">
                      <div className="font-bold text-[11px] text-[#D4AF37] uppercase tracking-widest mb-1.5">
                        REF: {order.id.slice(-6)} 
                      </div>
                      <div className="text-sm font-bold text-[#1A1A1A]">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", { 
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-sm text-[#1A1A1A] mb-1">
                        {order.user?.name || "Guest Checkout"}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        {order.user?.email || "No email provided"}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-bold text-[#1A1A1A] mb-2 uppercase tracking-widest">
                        {itemCount} {itemCount === 1 ? 'Piece' : 'Pieces'}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {order.items.map((orderItem: any) => (
                          <div key={orderItem.id} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="font-black text-[#D4AF37]">{orderItem.quantity}x</span>
                            <span className="line-clamp-2 leading-tight font-medium">
                              {orderItem.product?.name || "Exclusive Item"} 
                              {orderItem.size && <span className="font-bold text-[#1A1A1A] ml-1">({orderItem.size})</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[#1A1A1A] font-bold text-sm">
                      Tsh {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 md:px-8 py-5 text-right">
                       <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}