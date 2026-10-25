import Link from "next/link";
import { Package, TrendingUp, Tag, ArrowLeft, Plus } from "lucide-react";
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-gray-900 overflow-hidden isolate">
      {/* SLEEK ENTERPRISE SIDEBAR */}
      <aside className="w-[280px] bg-white border-r border-gray-200 flex flex-col hidden md:flex z-20 shadow-sm relative">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="bg-gray-900 p-2 rounded-md shadow-sm">
            <Package className="w-5 h-5 text-[#D4AF37]" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-gray-900">McCollins HQ</h1>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Enterprise Backoffice</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Overview</p>
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-gray-50 text-gray-900 font-medium text-sm">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            Dashboard
          </Link>
          
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-8 mb-2">Operations</p>
          <Link href="/admin/marketing" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors">
            <Tag className="w-4 h-4 text-gray-400" />
            Marketing & Campaigns
          </Link>
          <Link href="/admin/add-product" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors">
            <Plus className="w-4 h-4 text-gray-400" />
            Add Product
          </Link>
        </div>

        <div className="p-4 border-t border-gray-100 space-y-1 bg-gray-50/50">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors group">
            <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:-translate-x-1 transition-transform" />
            Live Storefront
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative z-10">
        {/* Dark Header Strip for contrast behind the content */}
        <div className="absolute top-0 left-0 w-full h-[280px] bg-gray-900 -z-10"></div>
        {children}
      </main>
    </div>
  );
}
