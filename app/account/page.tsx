"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Package, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react'; 

export default function AccountPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');

  // CHANGE THIS TO YOUR ACTUAL EMAIL:
  // If the logged-in user matches this email, they are flagged as the Admin!
  // 1. Create a VIP list of all your admin emails
  const ADMIN_EMAILS = [
    "jem.mziray@gmail.com",
    "nyombicolins04@gmail.com", // Replace with your 2nd admin
    "festomcrowland@gmail.com" // Replace with your 3rd admin, etc.
  ];

  // 2. Check if the logged-in user's email exists INSIDE that list
  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email); 

  // If the page is still figuring out if you are logged in, show a tiny loading state
  if (!session) {
    return <div className="min-h-screen flex items-center justify-center font-sans text-black">Loading your profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 font-sans text-black">
      <div className="max-w-4xl mx-auto px-4">
        
        <h1 className="text-3xl font-black tracking-tight mb-8">MY ACCOUNT</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* SIDEBAR MENU */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit space-y-2">
            
            {/* The 3 Interactive Tabs */}
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 p-3 font-bold text-[13px] tracking-wider uppercase rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <User className="w-4 h-4" /> Profile Details
            </button>
            
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 p-3 font-bold text-[13px] tracking-wider uppercase rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Package className="w-4 h-4" /> Order History
            </button>
            
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 p-3 font-bold text-[13px] tracking-wider uppercase rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
            
            {/* THE SECRET ADMIN BUTTON (Only shows if emails match) */}
            {isAdmin && (
              <div className="pt-4 mt-4 border-t border-gray-100">
                <Link href="/admin" className="w-full flex items-center gap-3 p-3 font-bold text-[13px] tracking-wider uppercase bg-black text-white hover:bg-[#E3000F] rounded-lg transition-colors">
                  <ShieldAlert className="w-4 h-4" /> Admin Dashboard
                </Link>
              </div>
            )}

            <div className="pt-4 mt-4 border-t border-gray-100">
              <button 
                onClick={() => signOut({ callbackUrl: '/' })} 
                className="w-full flex items-center gap-3 p-3 font-bold text-[13px] tracking-wider uppercase text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>

          {/* MAIN CONTENT AREA (Changes based on what tab you clicked) */}
          <div className="md:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold mb-6">Welcome Back, {session?.user?.name || 'Shopper'}!</h2>
                <div className="bg-[#F7F8FA] p-6 rounded-lg border border-gray-200">
                  <p className="text-sm font-bold text-gray-500 uppercase">Registered Email</p>
                  <p className="text-lg font-medium">{session?.user?.email}</p>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold mb-6">Your Orders</h2>
                <div className="bg-[#F7F8FA] p-6 rounded-lg border border-gray-200 text-center">
                  <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-bold text-sm uppercase tracking-wider mb-2">No Recent Orders</h3>
                  <p className="text-xs text-gray-500 mb-4">You haven't placed any orders yet.</p>
                  <Link href="/" className="inline-block bg-black text-white text-xs font-bold uppercase tracking-wider py-3 px-6 hover:bg-[#E3000F] transition-colors">
                    Start Shopping
                  </Link>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold mb-6">Account Settings</h2>
                <p className="text-sm text-gray-500">Preferences and address management will live here.</p>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
