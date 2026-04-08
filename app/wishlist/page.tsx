import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center font-sans text-black px-4">
      <div className="bg-gray-50 p-12 rounded-2xl flex flex-col items-center max-w-md w-full text-center border border-gray-100">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Heart className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-2 uppercase">Saved Items</h1>
        <p className="text-gray-500 text-sm mb-8">
          Keep track of the items you love. Click the heart icon on any product to save it here.
        </p>
        <Link 
          href="/" 
          className="w-full bg-black text-white text-[13px] font-bold uppercase tracking-widest py-4 px-8 hover:bg-zinc-800 transition-colors"
        >
          Discover Fashion
        </Link>
      </div>
    </div>
  );
}