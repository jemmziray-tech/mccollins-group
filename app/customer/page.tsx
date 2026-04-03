import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Clock, CheckCircle, Truck, XCircle, ArrowLeft, LogOut, User } from "lucide-react";
import SignOutButton from "./SignOutButton"; // We will create this tiny button next!

// Helper to pick the right icon and color for the order status
const getStatusBadge = (status: string) => {
  switch (status.toUpperCase()) {
    case "PENDING":
      return { icon: Clock, color: "text-amber-600", bg: "bg-amber-50" };
    case "PROCESSING":
      return { icon: Package, color: "text-blue-600", bg: "bg-blue-50" };
    case "SHIPPED":
      return { icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50" };
    case "DELIVERED":
      return { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" };
    case "CANCELLED":
      return { icon: XCircle, color: "text-red-600", bg: "bg-red-50" };
    default:
      return { icon: Package, color: "text-gray-600", bg: "bg-gray-50" };
  }
};

export default async function CustomerDashboard() {
  // 1. Secure the page: Get the logged-in user
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // 2. Fetch all their orders from the database, including the products!
  const userOrders = await prisma.order.findMany({
    where: { 
      user: { email: session.user.email } 
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true, // Pulls in the product name and image
        }
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Store
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 flex items-center hidden sm:flex">
              <User className="w-4 h-4 mr-2" />
              {session.user.name || session.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-gray-500 mt-2">Track, manage, and view your recent purchases.</p>
        </div>

        {/* Orders List */}
        {userOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Looks like you haven't made your first purchase with McCollins Group!</p>
            <Link href="/#products" className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {userOrders.map((order) => {
              const StatusBadge = getStatusBadge(order.status);
              const Icon = StatusBadge.icon;

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  
                  {/* Order Header */}
                  <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Order <span className="font-medium text-gray-900">#{order.id.slice(-8).toUpperCase()}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                        <p className="text-base font-bold text-gray-900">Tsh {order.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className={`flex items-center px-3 py-1.5 rounded-full ${StatusBadge.bg} ${StatusBadge.color}`}>
                        <Icon className="w-4 h-4 mr-2" />
                        <span className="text-sm font-semibold tracking-wide">{order.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-6 py-4 divide-y divide-gray-100">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-4 flex items-center first:pt-0 last:pb-0">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="ml-4 flex-1">
                          <h4 className="text-base font-medium text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-500">{item.product.brand}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">Qty: {item.quantity}</p>
                          <p className="text-sm text-gray-500">Tsh {item.priceAtPurchase.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}