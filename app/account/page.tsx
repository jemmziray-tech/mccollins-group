"use client";

import React from 'react';
import Link from 'next/link';
import { User, Package, Settings, LogOut } from 'lucide-react';
// If you are using NextAuth, uncomment the next line to enable Sign Out:
// import { signOut } from 'next-auth/react'; 

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 font-sans">
      <div className="max-w-4xl mx-auto px-4">
        
        <h1 className="text-3xl font-black tracking-tight mb-8">MY ACCOUNT</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Sidebar Menu */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit space-y-2">
            <button className="w-full flex items-center gap-3 p-3 font-bold text-[13px] tracking-wider uppercase bg-gray-50 text-black rounded-lg">
              <User className="w-4 h-4" /> Profile Details
            </button>
            <button className="w-full flex items-center gap-3 p-3 font-bold text-[13px] tracking-wider uppercase text-gray-500 hover:bg-gray-50 hover:text-black rounded-lg transition-colors">
              <Package className="w-4 h-4" /> Order History
            </button>
            <button className="w-full flex items-center gap-3 p-3 font-bold text-[13px] tracking-wider uppercase text-gray-500 hover:bg-gray-50 hover:text-black rounded-lg transition-colors">
              <Settings className="w-4 h-4" /> Settings
            </button>
            
            <div className="pt-4 mt-4 border-t border-gray-100">
              <button 
                // onClick={() => signOut({ callbackUrl: '/' })} 
                className="w-full flex items-center gap-3 p-3 font-bold text-[13px] tracking-wider uppercase text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Welcome Back!</h2>
            <p className="text-gray-600 text-sm mb-8">
              This is your personal dashboard. From here you can manage your orders, update your shipping addresses, and adjust your account settings.
            </p>
            
            <div className="bg-[#F7F8FA] p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-2">No Recent Orders</h3>
              <p className="text-xs text-gray-500 mb-4">You haven't placed any orders yet.</p>
              <Link href="/" className="inline-block bg-black text-white text-xs font-bold uppercase tracking-wider py-3 px-6 hover:bg-[#E3000F] transition-colors">
                Start Shopping
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}