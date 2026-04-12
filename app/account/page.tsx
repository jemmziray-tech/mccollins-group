"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Package, LogOut, ShieldAlert, Clock, ArrowRight, Loader2, ShoppingBag, ChevronRight } from 'lucide-react';
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] font-sans pt-24">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37] mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Securing VIP Session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans pt-20 md:pt-28">
      
      {/* 🟢 LUXURY PAGE HEADER */}
      <div className="bg-[#0F1115] text-white py-12 md:py-16 px-4 md:px-8 mt-[-1px] border-b border-[#D4AF37]/20">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#D4AF37]">Client Lounge</span>
          </nav>
          
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight mb-2">My Account</h1>
          <p className="text-[#D4AF37] font-bold uppercase tracking-[0.2em] text-[10px]">
            Welcome back, {session.user?.name || "Shopper"}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* LEFT: VIP SIDEBAR MENU */}
          <div className="w-full md:w-72 flex-shrink-0">
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden sticky top-32">
              <nav className="flex flex-col">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-4 p-5 text-left font-bold text-[11px] tracking-[0.15em] uppercase transition-colors border-l-2 ${activeTab === 'orders' ? 'border-[#D4AF37] bg-[#FDFBF7] text-[#D4AF37]' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-black'}`}
                >
                  <Package className="w-4 h-4" /> Order History
                </button>
                
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-4 p-5 text-left font-bold text-[11px] tracking-[0.15em] uppercase transition-colors border-l-2 ${activeTab === 'profile' ? 'border-[#D4AF37] bg-[#FDFBF7] text-[#D4AF37]' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-black'}`}
                >
                  <User className="w-4 h-4" /> Profile Details
                </button>

                {/* THE SECRET ADMIN BUTTON */}
                {isAdmin && (
                  <div className="border-t border-gray-100 bg-[#0F1115] p-3">
                    <Link href="/admin" className="w-full flex items-center gap-3 p-4 font-bold text-[11px] tracking-[0.15em] uppercase text-[#D4AF37] hover:bg-white/5 rounded-sm transition-colors border border-[#D4AF37]/30">
                      <ShieldAlert className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  </div>
                )}

                <div className="border-t border-gray-100">
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })} 
                    className="w-full flex items-center gap-4 p-5 text-left font-bold text-[11px] tracking-[0.15em] uppercase text-red-500 hover:bg-red-50 transition-colors border-l-2 border-transparent"
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
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-serif mb-8 text-[#1A1A1A] border-b border-gray-200 pb-4">Order History</h2>
                
                {isLoadingOrders ? (
                  <div className="bg-white p-16 rounded-sm shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mb-4" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Retrieving Records...</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-16 flex flex-col items-center text-center">
                    <div className="bg-[#FDFBF7] p-6 rounded-sm border border-gray-100 mb-6">
                      <ShoppingBag className="w-10 h-10 text-[#D4AF37]" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-serif text-2xl mb-3">No Recent Orders</h3>
                    <p className="text-sm text-gray-500 mb-8 max-w-sm leading-relaxed">Your purchase history is currently empty. Explore our latest collections to find your next statement piece.</p>
                    <Link href="/" className="inline-block bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-[#0F1115] text-[11px] font-bold uppercase tracking-[0.2em] py-4 px-10 rounded-sm transition-colors shadow-sm">
                      Discover Collection
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => {
                      const itemCount = order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                      const orderDate = new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: 'numeric', month: 'short', year: 'numeric'
                      });

                      return (
                        <div key={order.id} className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden hover:border-[#D4AF37] transition-colors group">
                          <div className="px-6 md:px-8 py-5 border-b border-gray-100 bg-[#FDFBF7] flex flex-wrap gap-6 justify-between items-center">
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Date</p>
                              <p className="font-medium text-gray-900 text-sm">{orderDate}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Total Amount</p>
                              <p className="font-bold text-[#D4AF37] text-sm">TSH {order.totalAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Order Ref</p>
                              <p className="font-mono text-xs text-gray-600">#{order.id.slice(-6).toUpperCase()}</p>
                            </div>
                            <div className="ml-auto flex items-center">
                              <span className={`px-4 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 border ${
                                order.status === "COMPLETED" ? "bg-green-50 text-green-700 border-green-200" : 
                                order.status === "PENDING" ? "bg-[#D4AF37]/10 text-[#997A00] border-[#D4AF37]/30" : 
                                "bg-red-50 text-red-700 border-red-200"
                              }`}>
                                {order.status === "PENDING" && <Clock className="w-3 h-3" />}
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="px-6 md:px-8 py-5 flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-600">
                              {itemCount} {itemCount !== 1 ? 'Pieces' : 'Piece'} in this order
                            </p>
                            <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] group-hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors border-b border-transparent group-hover:border-[#D4AF37] pb-0.5">
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
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-serif mb-8 text-[#1A1A1A] border-b border-gray-200 pb-4">Profile Details</h2>
                <div className="bg-white p-8 md:p-10 rounded-sm shadow-sm border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Full Name</label>
                      <div className="w-full bg-[#FDFBF7] border border-gray-200 px-5 py-4 rounded-sm text-gray-900 font-serif text-lg">
                        {session.user?.name || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Email Address</label>
                      <div className="w-full bg-[#FDFBF7] border border-gray-200 px-5 py-4 rounded-sm text-gray-600 font-medium text-sm">
                        {session.user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 pt-8 border-t border-gray-100">
                     <p className="text-xs text-gray-500 italic">To update your credentials, please contact the McCollins concierge service or manage your connected Google Account.</p>
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