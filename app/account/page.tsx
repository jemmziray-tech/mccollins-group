"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Package, LogOut, ShieldAlert, Clock, ArrowRight, Loader2, ShoppingBag } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react'; 
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('orders'); 
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const ADMIN_EMAILS = [
    "jem.mziray@gmail.com",
    "nyombicolins04@gmail.com", 
    "festomcrowland@gmail.com" 
  ];

  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email); 

  useEffect(() => {
    async function fetchMyOrders() {
      if (!session?.user?.email) return;
      
      try {
        const res = await fetch(`/api/orders/history?email=${session.user.email}`);
        if (!res.ok) throw new Error("Failed to fetch orders");
        
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoadingOrders(false);
      }
    }

    if (session?.user?.email) {
      fetchMyOrders();
    }
  }, [session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Securing your session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-black">
      
      {/* Page Header */}
      <div className="bg-black text-white py-10 px-4 md:px-8 mt-[-1px]">
        <div className="max-w-[1000px] mx-auto">
          <h1 className="text-3xl font-black tracking-tight uppercase mb-1">My Account</h1>
          <p className="text-gray-400 font-medium text-sm">Welcome back, {session.user?.name || "Shopper"}</p>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* LEFT: SIDEBAR MENU */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
              <nav className="flex flex-col">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-3 p-4 text-left font-bold text-[12px] tracking-wider uppercase transition-colors border-l-4 ${activeTab === 'orders' ? 'border-black bg-gray-50 text-black' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-black'}`}
                >
                  <Package className="w-4 h-4" /> Order History
                </button>
                
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-3 p-4 text-left font-bold text-[12px] tracking-wider uppercase transition-colors border-l-4 ${activeTab === 'profile' ? 'border-black bg-gray-50 text-black' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-black'}`}
                >
                  <User className="w-4 h-4" /> Profile Details
                </button>

                {/* THE SECRET ADMIN BUTTON */}
                {isAdmin && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-2">
                    <Link href="/admin" className="w-full flex items-center gap-3 p-3 font-bold text-[12px] tracking-wider uppercase bg-black text-white hover:bg-zinc-800 rounded-lg transition-colors">
                      <ShieldAlert className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  </div>
                )}

                <div className="border-t border-gray-100 mt-1">
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })} 
                    className="w-full flex items-center gap-3 p-4 text-left font-bold text-[12px] tracking-wider uppercase text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* RIGHT: MAIN CONTENT AREA */}
          <div className="flex-grow">
            
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold mb-6">Order History</h2>
                
                {isLoadingOrders ? (
                  <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 flex justify-center items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-2">No Recent Orders</h3>
                    <p className="text-xs text-gray-500 mb-6">You haven't placed any orders with us yet.</p>
                    <Link href="/" className="inline-block bg-black text-white text-xs font-bold uppercase tracking-wider py-3 px-8 rounded-full hover:bg-zinc-800 transition-transform active:scale-95">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      // Calculate total items in this order
                      const itemCount = order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                      const orderDate = new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: 'numeric', month: 'long', year: 'numeric'
                      });

                      return (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 justify-between items-center">
                            <div>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Order Placed</p>
                              <p className="font-medium text-gray-900 text-sm">{orderDate}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total</p>
                              <p className="font-bold text-gray-900 text-sm">TSH {order.totalAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Order ID</p>
                              <p className="font-mono text-xs text-gray-600">#{order.id.slice(-6).toUpperCase()}</p>
                            </div>
                            <div className="ml-auto flex items-center">
                              <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                                order.status === "COMPLETED" ? "bg-green-100 text-green-700" : 
                                order.status === "PENDING" ? "bg-orange-100 text-orange-700" : 
                                "bg-red-100 text-red-700"
                              }`}>
                                {order.status === "PENDING" && <Clock className="w-3 h-3" />}
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="px-6 py-4 flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-600">
                              {itemCount} item{itemCount !== 1 ? 's' : ''} in this order
                            </p>
                            <button className="text-[11px] font-bold uppercase tracking-widest text-[#007185] hover:text-[#C7511F] flex items-center gap-1 transition-colors">
                              View Details <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold mb-6">Profile Details</h2>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                      <div className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg text-gray-900 font-medium text-sm">
                        {session.user?.name || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                      <div className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg text-gray-600 font-medium text-sm">
                        {session.user?.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}