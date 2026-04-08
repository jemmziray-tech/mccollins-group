"use client";

import Link from 'next/link';
import { ShoppingBag, Trash2 } from 'lucide-react';
// Import your custom hook! (Adjust the path if your context folder is somewhere else)
import { useCart } from '../context/CartContext'; 

export default function CartPage() {
  // 🧠 CONNECTING THE BRAIN: We pull your live data straight from the context
  const { cart, removeFromCart, cartTotal } = useCart();

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-black font-sans py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black tracking-tight mb-8 uppercase">Your Cart</h1>

        {/* We now check your ACTUAL cart array length */}
        {cart.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white p-16 rounded-2xl flex flex-col items-center max-w-2xl mx-auto text-center border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-[#F7F8FA] rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-3 uppercase">Your Cart is Empty</h2>
            <p className="text-gray-500 text-sm mb-8">
              Looks like you haven&apos;t added anything to your bag yet. Let&apos;s change that!
            </p>
            <Link href="/" className="bg-black text-white text-[13px] font-bold uppercase tracking-widest py-4 px-10 hover:bg-[#E3000F] transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          /* POPULATED CART STATE */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Loop over your REAL cart data */}
              {cart.map((item) => (
                <div key={`${item.id}-${item.size || 'nosize'}`} className="bg-white p-6 rounded-xl border border-gray-100 flex items-center gap-6 shadow-sm">
                  <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {/* Using your actual imageUrl property */}
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-1">{item.name}</h3>
                    <p className="text-[#E3000F] font-bold text-sm">Tsh {item.price.toLocaleString()}</p>
                    
                    <div className="mt-2 flex gap-4 text-xs text-gray-500 font-medium">
                      <span>Qty: {item.quantity}</span>
                      {/* If the item has a size, display it! */}
                      {item.size && <span>Size: {item.size}</span>}
                    </div>
                  </div>
                  
                  {/* Wire up the Trash Button to your context function */}
                  <button 
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm h-fit">
              <h3 className="font-black text-lg uppercase tracking-wider mb-6 pb-4 border-b border-gray-100">Order Summary</h3>
              <div className="flex justify-between items-center mb-4 text-sm">
                <span className="text-gray-600">Subtotal</span>
                {/* Dynamically display the real cart total */}
                <span className="font-bold">Tsh {cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-6 text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-400 text-xs">Calculated at checkout</span>
              </div>
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100 text-lg">
                <span className="font-black">Total</span>
                {/* Dynamically display the real cart total */}
                <span className="font-black text-[#E3000F]">Tsh {cartTotal.toLocaleString()}</span>
              </div>
              
              {/* Note: We'll wire this WhatsApp button up later! */}
              <button className="w-full bg-[#FFD100] text-black font-black uppercase tracking-widest py-4 hover:bg-yellow-400 transition-colors rounded-md shadow-sm">
                Checkout via WhatsApp
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}