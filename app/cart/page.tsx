import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function CartPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center font-sans text-black px-4">
      <div className="bg-gray-50 p-12 rounded-2xl flex flex-col items-center max-w-md w-full text-center border border-gray-100">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
          <ShoppingBag className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-2 uppercase">Your Cart is Empty</h1>
        <p className="text-gray-500 text-sm mb-8">
          Looks like you haven&apos;t added anything to your bag yet. Let&apos;s change that!
        </p>
        <Link 
          href="/" 
          className="w-full bg-black text-white text-[13px] font-bold uppercase tracking-widest py-4 px-8 hover:bg-zinc-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}