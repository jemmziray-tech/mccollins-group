// app/admin/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { 
  Plus, 
  ArrowLeft, 
  Edit, 
  ShoppingBag, 
  AlertCircle,
  Package,
  Image as ImageIcon,
  Sparkles,
  Megaphone,
  TrendingUp,
  Users,
  MessageCircle, 
  Bookmark,
  Scissors, // 🟢 IMPORTED FOR BESPOKE SECTION
  Ruler     // 🟢 IMPORTED FOR BESPOKE SECTION
} from "lucide-react";

// Import our interactive components
import DeleteButton from "./DeleteButton";
import ProductStatusToggle from "./ProductStatusToggle";
import OrderListClient from "./OrderListClient"; 
import RevenueChart from "./RevenueChart"; 
import BespokeStatusSelect from "../components/BespokeStatusSelect"; // 🟢 IMPORTED NEW STATUS DROPDOWN

// Secure Database Connection
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default async function AdminDashboard() {
  // 1. FETCH PRODUCTS
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  // 2. FETCH ORDERS
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true, 
      items: {
        include: {
          product: true, 
        }
      }
    }
  });

  // 3. FETCH TOTAL REGISTERED CLIENTS
  const totalClients = await prisma.user.count();

  // 4. FETCH SAVED GUEST CARTS (LEADS)
  const savedCarts = await prisma.savedCart.findMany({
    orderBy: { createdAt: "desc" },
  });

  // 🟢 5. FETCH BESPOKE TAILORING REQUESTS
  const bespokeRequests = await prisma.bespokeRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  // FORMAT DATE SAFETY FIX
  const safeOrders = orders.map(order => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
  }));

  // CALCULATE LIVE BUSINESS METRICS
  const totalRevenue = orders
    .filter(order => order.status === "COMPLETED")
    .reduce((sum, order) => sum + order.totalAmount, 0);
    
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(order => order.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1A1A1A] pb-20">
      
      {/* THE VIP COMMAND CENTER NAV */}
      <nav className="bg-[#0F1115] text-white px-6 md:px-10 py-5 flex justify-between items-center border-b border-[#D4AF37]/20 sticky top-0 z-50 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-[#D4AF37] p-2 rounded-sm shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <Package className="w-5 h-5 text-[#0F1115]" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-serif tracking-tight leading-none text-white">Command Center</h1>
            <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">McCollins Group Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Live Store
          </Link>
          <Link 
            href="/admin/add-product" 
            className="bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-[#0F1115] px-5 py-2.5 rounded-sm font-bold uppercase tracking-[0.15em] text-[10px] shadow-md flex items-center gap-2 transition-colors active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* QUICK MARKETING ACCESS BAR */}
        <div className="bg-[#1A1A1A] rounded-sm p-5 md:p-6 flex flex-col md:flex-row items-center justify-between shadow-xl border border-[#D4AF37]/20 gap-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-5">
            <div className="bg-[#0F1115] border border-white/10 p-3 rounded-sm">
              <Megaphone className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-white font-serif text-2xl leading-none mb-1">Storefront Marketing</h2>
              <p className="text-gray-400 text-xs font-medium">Update your homepage banner, active campaigns, and trending editorial edits.</p>
            </div>
          </div>
          <Link 
            href="/admin/marketing" 
            className="bg-white hover:bg-[#D4AF37] text-[#1A1A1A] px-8 py-3 rounded-sm font-bold uppercase tracking-[0.15em] text-[10px] transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
          >
            Open Portal
          </Link>
        </div>
        
        {/* EDITORIAL KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="bg-white rounded-sm p-6 shadow-sm border border-gray-200 flex items-center gap-5 group hover:border-[#D4AF37] transition-colors">
            <div className="bg-[#FDFBF7] border border-gray-100 p-4 rounded-sm text-[#D4AF37] group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
              <h3 className="text-2xl font-serif text-gray-900 leading-none">Tsh {totalRevenue.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white rounded-sm p-6 shadow-sm border border-gray-200 flex items-center gap-5 group hover:border-gray-400 transition-colors">
            <div className="bg-[#FDFBF7] border border-gray-100 p-4 rounded-sm text-[#1A1A1A] group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
              <h3 className="text-2xl font-serif text-gray-900 leading-none">{totalOrdersCount}</h3>
            </div>
          </div>

          <div className="bg-white rounded-sm p-6 shadow-sm border border-gray-200 flex items-center gap-5 group hover:border-[#D4AF37] transition-colors relative overflow-hidden">
            <div className={`p-4 rounded-sm transition-transform group-hover:scale-110 ${pendingOrdersCount > 0 ? 'bg-[#D4AF37]/10 text-[#997A00] border border-[#D4AF37]/30' : 'bg-[#FDFBF7] border border-gray-100 text-gray-400'}`}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Action Required</p>
              <h3 className={`text-2xl font-serif leading-none ${pendingOrdersCount > 0 ? 'text-[#997A00]' : 'text-gray-900'}`}>
                {pendingOrdersCount} Pending
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-sm p-6 shadow-sm border border-gray-200 flex items-center gap-5 group hover:border-[#D4AF37] transition-colors">
            <div className="bg-[#FDFBF7] border border-gray-100 p-4 rounded-sm text-gray-800 group-hover:scale-110 transition-transform group-hover:text-[#D4AF37]">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Catalog Size</p>
              <h3 className="text-2xl font-serif text-gray-900 leading-none">{products.length} Pieces</h3>
            </div>
          </div>

          <div className="bg-white rounded-sm p-6 shadow-sm border border-gray-200 flex items-center gap-5 group hover:border-[#D4AF37] transition-colors xl:col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="bg-[#FDFBF7] border border-gray-100 p-4 rounded-sm text-gray-800 group-hover:scale-110 transition-transform group-hover:text-[#D4AF37]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Registered VIPs</p>
              <h3 className="text-2xl font-serif text-gray-900 leading-none">{totalClients} Clients</h3>
            </div>
          </div>
        </div>

        {/* INJECT INTERACTIVE REVENUE GRAPH HERE */}
        <RevenueChart orders={safeOrders} />

        {/* 🟢 THE NEW MASTER TAILOR VIP SECTION */}
        <div className="mb-12">
          <div className="bg-[#0F1115] rounded-sm shadow-xl border border-[#D4AF37]/20 overflow-hidden animate-in fade-in duration-700 relative text-white">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
            <div className="px-6 md:px-8 py-6 border-b border-white/10 flex justify-between items-center bg-[#1A1A1A]">
              <div className="flex items-center gap-4">
                <div className="bg-[#D4AF37]/10 p-2 rounded-sm border border-[#D4AF37]/30">
                  <Scissors className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-xl font-serif text-white mb-1">The Master Tailor Queue</h2>
                  <p className="text-xs text-gray-400 font-medium">Manage incoming bespoke and made-to-measure requests.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0F1115] bg-[#D4AF37] px-4 py-1.5 rounded-sm shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                {bespokeRequests.length} Requests
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-gray-500 bg-[#0F1115]">
                    <th className="px-6 md:px-8 py-5 font-bold">Client Profile</th>
                    <th className="px-6 py-5 font-bold">Garment Details</th>
                    <th className="px-6 py-5 font-bold">Client Notes</th>
                    <th className="px-6 py-5 font-bold">Status</th>
                    <th className="px-6 md:px-8 py-5 font-bold text-right">Consultation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bespokeRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <Ruler className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                        <p className="text-sm text-gray-400 font-medium">The tailor's queue is currently empty.</p>
                      </td>
                    </tr>
                  ) : (
                    bespokeRequests.map((request) => {
                      // Safely parse the JSON measurements
                      const measures = typeof request.measurements === 'string' 
                        ? JSON.parse(request.measurements) 
                        : request.measurements as any;
                      
                      const cleanPhone = request.whatsapp.replace(/[^0-9]/g, '');
                      
                      // Pre-build the luxury tailoring consultation message
                      const messageText = `Dear ${request.clientName},\n\nThis is the Master Tailor team at McCollins Group. We have received your bespoke request for the ${request.productName}.\n\nWhen would you be available for a brief consultation to discuss your measurements and design notes?`;
                      const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

                      return (
                        <tr key={request.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 md:px-8 py-5">
                            <span className="font-bold text-white text-sm tracking-wider block mb-1">{request.clientName}</span>
                            <span className="text-[10px] text-[#D4AF37] font-bold tracking-widest">{request.whatsapp}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm text-gray-200 font-medium block mb-2">{request.productName}</span>
                            <div className="flex gap-3">
                              {measures?.chest && <span className="bg-white/10 px-2 py-1 rounded text-[10px] text-gray-300">C: {measures.chest}</span>}
                              {measures?.waist && <span className="bg-white/10 px-2 py-1 rounded text-[10px] text-gray-300">W: {measures.waist}</span>}
                              {measures?.length && <span className="bg-white/10 px-2 py-1 rounded text-[10px] text-gray-300">L: {measures.length}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-xs text-gray-400 line-clamp-2 max-w-[250px] italic">
                              "{request.designNotes || "Standard fit, no additional notes provided."}"
                            </p>
                          </td>
                          {/* 🟢 HERE IS THE NEW INTERACTIVE STATUS DROPDOWN */}
                          <td className="px-6 py-5">
                             <BespokeStatusSelect requestId={request.id} initialStatus={request.status} />
                          </td>
                          <td className="px-6 md:px-8 py-5 text-right">
                            {/* Mobile-friendly visibility check for the button */}
                            <div className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <a 
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-white text-[#0F1115] hover:bg-[#D4AF37] px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> Consult
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RECOVERED CARTS (GUEST LEADS) SECTION */}
        <div className="mb-12">
          <div className="bg-white rounded-sm shadow-sm border border-[#D4AF37]/30 overflow-hidden animate-in fade-in duration-700 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
            <div className="px-6 md:px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-[#FDFBF7]">
              <div className="flex items-center gap-3">
                <Bookmark className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <h2 className="text-xl font-serif text-[#1A1A1A] mb-1">Recovered Carts</h2>
                  <p className="text-xs text-gray-500 font-medium">Guest leads who requested a secure link via WhatsApp.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900 bg-gray-100 px-4 py-1.5 rounded-sm">
                {savedCarts.length} Leads
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 bg-white">
                    <th className="px-6 md:px-8 py-4 font-bold">Client Number</th>
                    <th className="px-6 py-4 font-bold">Saved Items</th>
                    <th className="px-6 py-4 font-bold">Date Saved</th>
                    <th className="px-6 md:px-8 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {savedCarts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400 font-medium">
                        No saved carts yet. When a guest saves their cart, they will appear here.
                      </td>
                    </tr>
                  ) : (
                    savedCarts.map((cart) => {
                      const items = cart.cartItems as any[];
                      const itemSummary = items.map(i => `${i.quantity}x ${i.name}`).join(", ");
                      const cleanPhone = cart.whatsapp.replace(/[^0-9]/g, '');
                      
                      const messageText = `Hello! This is the McCollins Group Concierge. We noticed you saved some items for later: \n\n${itemSummary}\n\nHow can we assist you with completing your order today?`;
                      const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

                      return (
                        <tr key={cart.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-6 md:px-8 py-4">
                            <span className="font-bold text-[#1A1A1A] text-sm tracking-wider">{cart.whatsapp}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 line-clamp-1 max-w-[300px]">{itemSummary}</p>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 block">{items.length} Item(s)</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-500 font-medium">
                              {new Date(cart.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 md:px-8 py-4 text-right">
                            <div className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <a 
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> Message Client
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* THE ORDERS TABLE */}
        <div className="mb-12">
          <OrderListClient initialOrders={safeOrders} />
        </div>

        {/* INVENTORY MANAGEMENT SECTION */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-1000">
          <div className="px-6 md:px-8 py-6 border-b border-gray-200 flex justify-between items-center bg-[#FDFBF7]">
            <div>
              <h2 className="text-2xl font-serif text-[#1A1A1A] mb-1">Current Inventory</h2>
              <p className="text-xs text-gray-500 font-medium">Manage product visibility and core details.</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-4 py-1.5 rounded-sm border border-[#D4AF37]/20">
              {products.length} Pieces
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-400 bg-white">
                  <th className="px-6 md:px-8 py-5 font-bold">Product Details</th>
                  <th className="px-6 py-5 font-bold">Classification</th>
                  <th className="px-6 py-5 font-bold">Price (TSH)</th>
                  <th className="px-6 py-5 font-bold text-center">Status</th>
                  <th className="px-6 md:px-8 py-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Package className="w-12 h-12 mb-4 text-gray-300" strokeWidth={1} />
                        <h3 className="text-xl font-serif text-gray-800 mb-2">No Products Uploaded</h3>
                        <p className="text-sm text-gray-500">Your digital stockroom is currently empty.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product: any) => {
                    return (
                      <tr key={product.id} className="hover:bg-[#FDFBF7] transition-colors group">
                        <td className="px-6 md:px-8 py-5">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-16 rounded-sm bg-gray-50 overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center relative">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-gray-300" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors line-clamp-1">{product.name}</span>
                                {product.hoverImageUrl && (
                                  <span title="Secondary Image Active" className="flex items-center">
                                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">REF: {product.id.slice(-6)}</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-5">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className="text-[#1A1A1A] font-bold text-xs">
                              {product.brand || "Exclusive"}
                            </span>
                            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                              {product.department} • {product.category}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-5 text-[#1A1A1A] font-bold text-sm">
                          {product.price.toLocaleString()}
                        </td>
                        
                        <td className="px-6 py-5 text-center">
                          <ProductStatusToggle productId={product.id} initialStatus={product.isAvailable} />
                        </td>
                        
                        <td className="px-6 md:px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <Link 
                              href={`/admin/edit-product/${product.id}`}
                              className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-[#FDFBF7] rounded-sm transition-colors border border-transparent hover:border-[#D4AF37]/30" 
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <DeleteButton productId={product.id} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}