// app/admin/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { 
  Plus, 
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
  Scissors,
  Ruler
} from "lucide-react";

// Import our interactive components
import DeleteButton from "./DeleteButton";
import ProductStatusToggle from "./ProductStatusToggle";
import OrderListClient from "./OrderListClient"; 
import RevenueChart from "./RevenueChart"; 
import BespokeStatusSelect from "../components/BespokeStatusSelect"; 
import ElevatorPitchEditor from "../components/ElevatorPitchEditor"; 

import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const products = await prisma.product.findMany({ where: { archivedAt: null }, orderBy: { createdAt: "desc" } });
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, items: { include: { product: true } } }
  });
  const totalClients = await prisma.user.count();
  const savedCarts = await prisma.savedCart.findMany({ orderBy: { createdAt: "desc" } });
  const bespokeRequests = await prisma.bespokeRequest.findMany({ orderBy: { createdAt: "desc" } });
  const settings = await prisma.storeSettings.findUnique({ where: { id: "global" } });

  const safeOrders = orders.map(order => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
  }));

  const totalRevenue = orders
    .filter(order => order.status === "COMPLETED")
    .reduce((sum, order) => sum + order.totalAmount, 0);
    
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(order => order.status === "PENDING").length;

  return (
    <div className="font-sans text-gray-900 pb-20">
      
      {/* MOBILE TOP HEADER (Sidebar is hidden on mobile) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-900" />
          <h1 className="font-bold tracking-tight text-sm">McCollins HQ</h1>
        </div>
        <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Exit</Link>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 mt-8 md:mt-12 relative z-10">
        
        {/* PAGE HEADER */}
        <div className="mb-10 text-white animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Overview</h1>
          <p className="text-gray-400 font-medium text-sm">Monitor business metrics, tailor queues, and storefront operations.</p>
        </div>
        
        {/* QUICK MARKETING ACCESS BAR */}
        <div className="bg-white rounded-lg p-5 md:p-6 flex flex-col md:flex-row items-center justify-between shadow-sm border border-gray-200 gap-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="flex items-center gap-5">
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-md">
              <Megaphone className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h2 className="text-gray-900 font-bold text-lg mb-1">Storefront Marketing</h2>
              <p className="text-gray-500 text-xs font-medium">Update your homepage banner, active campaigns, and trending editorial edits.</p>
            </div>
          </div>
          <Link 
            href="/admin/marketing" 
            className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-md font-bold text-[11px] transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
          >
            Open Portal
          </Link>
        </div>
        
        {/* ENTERPRISE KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <p className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</p>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 font-mono tracking-tight">Tsh {totalRevenue.toLocaleString()}</h3>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gray-500">
              <ShoppingBag className="w-4 h-4" />
              <p className="text-[11px] font-bold uppercase tracking-wider">Total Orders</p>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 font-mono tracking-tight">{totalOrdersCount}</h3>
          </div>

          <div className={`rounded-lg p-5 shadow-sm border flex flex-col gap-3 ${pendingOrdersCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
            <div className={`flex items-center gap-2 ${pendingOrdersCount > 0 ? 'text-amber-700' : 'text-gray-500'}`}>
              <AlertCircle className="w-4 h-4" />
              <p className="text-[11px] font-bold uppercase tracking-wider">Action Required</p>
            </div>
            <h3 className={`text-2xl font-bold font-mono tracking-tight ${pendingOrdersCount > 0 ? 'text-amber-900' : 'text-gray-900'}`}>
              {pendingOrdersCount} Pending
            </h3>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gray-500">
              <Package className="w-4 h-4" />
              <p className="text-[11px] font-bold uppercase tracking-wider">Catalog Size</p>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 font-mono tracking-tight">{products.length} Items</h3>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 flex flex-col gap-3 xl:col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-gray-500">
              <Users className="w-4 h-4" />
              <p className="text-[11px] font-bold uppercase tracking-wider">Registered VIPs</p>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 font-mono tracking-tight">{totalClients} Clients</h3>
          </div>
        </div>

        {/* 🟢 THE BRAND IDENTITY / ELEVATOR PITCH EDITOR */}
        <div className="mb-12">
          <ElevatorPitchEditor initialSettings={settings} />
        </div>

        {/* INJECT INTERACTIVE REVENUE GRAPH HERE */}
        <RevenueChart orders={safeOrders} />

        {/* THE NEW MASTER TAILOR VIP SECTION */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-700 relative">
            <div className="px-6 md:px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-md border border-gray-200 shadow-sm">
                  <Scissors className="w-4 h-4 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-0.5">Master Tailor Queue</h2>
                  <p className="text-xs text-gray-500 font-medium">Bespoke and made-to-measure requests.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 bg-gray-200/50 px-3 py-1 rounded-full border border-gray-200">
                {bespokeRequests.length} Requests
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500 bg-white">
                    <th className="px-6 md:px-8 py-4 font-bold">Client Profile</th>
                    <th className="px-6 py-4 font-bold">Garment Details</th>
                    <th className="px-6 py-4 font-bold">Client Notes</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 md:px-8 py-4 font-bold text-right">Consultation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bespokeRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <Ruler className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                        <p className="text-sm text-gray-500 font-medium">The tailor's queue is currently empty.</p>
                      </td>
                    </tr>
                  ) : (
                    bespokeRequests.map((request) => {
                      const measures = typeof request.measurements === 'string' ? JSON.parse(request.measurements) : request.measurements as any;
                      const cleanPhone = request.whatsapp.replace(/[^0-9]/g, '');
                      const messageText = `Dear ${request.clientName},\n\nThis is the Master Tailor team at McCollins Group. We have received your bespoke request for the ${request.productName}.\n\nWhen would you be available for a brief consultation to discuss your measurements and design notes?`;
                      const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

                      return (
                        <tr key={request.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-6 md:px-8 py-4">
                            <span className="font-bold text-gray-900 text-sm block mb-0.5">{request.clientName}</span>
                            <span className="text-xs text-gray-500 font-mono">{request.whatsapp}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700 font-medium block mb-2">{request.productName}</span>
                            <div className="flex gap-2">
                              {measures?.chest && <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-[10px] text-gray-600 font-mono">C:{measures.chest}</span>}
                              {measures?.waist && <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-[10px] text-gray-600 font-mono">W:{measures.waist}</span>}
                              {measures?.length && <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-[10px] text-gray-600 font-mono">L:{measures.length}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-gray-500 line-clamp-2 max-w-[250px]">
                              "{request.designNotes || "Standard fit, no additional notes provided."}"
                            </p>
                          </td>
                          <td className="px-6 py-4">
                             <BespokeStatusSelect requestId={request.id} initialStatus={request.status} />
                          </td>
                          <td className="px-6 md:px-8 py-4 text-right">
                            <div className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors shadow-sm">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-700 relative">
            <div className="px-6 md:px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-md border border-gray-200 shadow-sm">
                  <Bookmark className="w-4 h-4 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-0.5">Recovered Carts</h2>
                  <p className="text-xs text-gray-500 font-medium">Guest leads who requested a secure link via WhatsApp.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 bg-gray-200/50 px-3 py-1 rounded-full border border-gray-200">
                {savedCarts.length} Leads
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500 bg-white">
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
                            <span className="font-bold text-gray-900 font-mono text-sm tracking-wider">{cart.whatsapp}</span>
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
                                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors shadow-sm"
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-1000">
          <div className="px-6 md:px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-0.5">Current Inventory</h2>
              <p className="text-xs text-gray-500 font-medium">Manage product visibility and core details.</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 bg-gray-200/50 px-3 py-1 rounded-full border border-gray-200">
              {products.length} Items
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500 bg-white">
                  <th className="px-6 md:px-8 py-4 font-bold">Product Details</th>
                  <th className="px-6 py-4 font-bold">Classification</th>
                  <th className="px-6 py-4 font-bold">Price (TSH)</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                  <th className="px-6 md:px-8 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Package className="w-10 h-10 mb-4 text-gray-300" strokeWidth={1} />
                        <h3 className="text-base font-bold text-gray-800 mb-1">No Products Uploaded</h3>
                        <p className="text-sm text-gray-500">Your digital stockroom is currently empty.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product: any) => {
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 md:px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-md bg-gray-50 overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center relative">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-gray-300" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-sm text-gray-900 line-clamp-1">{product.name}</span>
                                {product.hoverImageUrl && (
                                  <span title="Secondary Image Active" className="flex items-center">
                                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-mono">REF: {product.id.slice(-6)}</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-gray-900 font-bold text-xs">
                              {product.brand || "Exclusive"}
                            </span>
                            <span className="text-gray-500 text-[10px] uppercase tracking-wider">
                              {product.department} • {product.category}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-gray-900 font-bold text-sm font-mono">
                          {product.price.toLocaleString()}
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          <ProductStatusToggle productId={product.id} initialStatus={product.isAvailable} />
                        </td>
                        
                        <td className="px-6 md:px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <Link 
                              href={`/admin/edit-product/${product.id}`}
                              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors border border-transparent" 
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