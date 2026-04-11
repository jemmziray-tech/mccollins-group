// app/admin/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { 
  Plus, 
  ArrowLeft, 
  Edit, 
  DollarSign, 
  ShoppingBag, 
  AlertCircle,
  Package,
  Image as ImageIcon,
  Sparkles,
  Megaphone
} from "lucide-react";

// Import our interactive components
import DeleteButton from "./DeleteButton";
import OrderStatusSelect from "./OrderStatusSelect"; 
import ProductStatusToggle from "./ProductStatusToggle";

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

  // 3. CALCULATE LIVE BUSINESS METRICS
  const totalRevenue = orders
    .filter(order => order.status === "COMPLETED")
    .reduce((sum, order) => sum + order.totalAmount, 0);
    
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(order => order.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 pb-12">
      
      {/* Top Navigation Bar */}
      <nav className="bg-[#131921] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-[#febd69] p-2 rounded-lg">
            <Package className="w-5 h-5 text-[#131921]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Admin Control Center</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
          <Link 
            href="/admin/add-product" 
            className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </nav>

      {/* --- 🟢 NEW: QUICK ACCESS BAR --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-gradient-to-r from-[#131921] to-[#232f3e] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between shadow-lg border border-white/10 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-[#febd69] p-3 rounded-full shadow-inner">
              <Megaphone className="w-6 h-6 text-[#131921]" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-none">Storefront Marketing</h2>
              <p className="text-gray-400 text-xs mt-1">Update your homepage banner, ads, and trending slogans.</p>
            </div>
          </div>
          
          <Link 
            href="/admin/marketing" 
            className="bg-white hover:bg-gray-100 text-black px-6 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 flex items-center gap-2"
          >
            Open Marketing Portal
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* KPI Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-full text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900">Tsh {totalRevenue.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-full text-blue-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalOrdersCount}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-orange-100 p-4 rounded-full text-orange-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Orders</p>
              <h3 className="text-2xl font-bold text-orange-600">
                {pendingOrdersCount} Pending
              </h3>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gray-500" /> Recent Orders
            </h2>
            <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              {orders.length} Orders
            </span>
          </div>
          
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
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <ShoppingBag className="w-12 h-12 mb-3 text-gray-300" />
                        <p className="text-gray-500 font-medium">No orders have been placed yet!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono text-xs text-gray-500 mb-1">
                            #{order.id.slice(-6).toUpperCase()} 
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.createdAt.toLocaleDateString("en-GB", { 
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
                        {/* 🟢 THE FIX: Showing Product Names and Sizes instead of just "2 items" */}
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
                                  {/* If you save sizes to your order items, this will show it! */}
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

        {/* Inventory Management Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-500" /> Current Inventory
            </h2>
            <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              {products.length} Items
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 bg-white">
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Dept / Category</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold text-center">Visibility</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Package className="w-12 h-12 mb-3 text-gray-300" />
                        <p className="text-gray-500 font-medium">No products found in the database.</p>
                        <p className="text-sm mt-1">Click "Add Product" to create your first listing!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product: any) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center relative">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-gray-800 line-clamp-1">{product.name}</span>
                              {product.hoverImageUrl && (
                                <span title="Luxury Hover Enabled" className="flex items-center">
                                  <Sparkles className="w-3 h-3 text-[#febd69]" />
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 font-mono mt-0.5">#{product.id.slice(-6).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            {product.department || "Unisex"}
                          </span>
                          <span className="text-gray-600 text-xs font-medium">
                            {product.category || "Uncategorized"}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-gray-900 font-bold text-sm">
                        Tsh {product.price.toLocaleString()}
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <ProductStatusToggle productId={product.id} initialStatus={product.isAvailable} />
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <Link 
                            href={`/admin/edit-product/${product.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <DeleteButton productId={product.id} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}