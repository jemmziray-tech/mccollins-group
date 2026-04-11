"use client";

import React, { useState } from "react";
import { ShoppingBag, Search } from "lucide-react";
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

  const tabs = ["ALL", "PENDING", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      
      {/* 🟢 NEW: Header with Tabs and Search */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-4">
        
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gray-500" /> Recent Orders
          </h2>
          <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
            {filteredOrders.length} Orders
          </span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-200/60 p-1 rounded-lg w-full md:w-auto overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? "bg-white text-black shadow-sm" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search ID, Name, or Email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>
        </div>
      </div>
      
      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 bg-white">
              <th className="px-6 py-4 font-semibold">Order ID & Date</th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Items</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Search className="w-10 h-10 mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">No orders found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const itemCount = order.items.reduce((sum: any, item: any) => sum + item.quantity, 0);
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-gray-500 mb-1">
                        #{order.id.slice(-6).toUpperCase()} 
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", { 
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {order.user?.name || "Guest Checkout"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.user?.email || "No email provided"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900 mb-1.5">
                        {itemCount} item{itemCount !== 1 && 's'}
                      </div>
                      <div className="flex flex-col gap-1">
                        {order.items.map((orderItem: any) => (
                          <div key={orderItem.id} className="text-xs text-gray-600 flex items-start gap-1.5">
                            <span className="font-black text-gray-400">{orderItem.quantity}x</span>
                            <span className="line-clamp-2 leading-tight">
                              {orderItem.product?.name || "Unknown Product"} 
                              {orderItem.size && <span className="font-bold text-black ml-1">({orderItem.size})</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-bold">
                      Tsh {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
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