import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center font-sans text-black px-4 py-20">
      <div className="bg-white p-16 rounded-2xl flex flex-col items-center max-w-2xl w-full text-center border border-gray-100 shadow-sm">
        <div className="w-24 h-24 bg-[#F7F8FA] rounded-full flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-3 uppercase">Saved Items</h1>
        <p className="text-gray-500 text-sm mb-8">
          Keep track of the items you love. Click the heart icon on any product to save it here.
        </p>
        <Link 
          href="/" 
          className="bg-black text-white text-[13px] font-bold uppercase tracking-widest py-4 px-10 hover:bg-[#E3000F] transition-colors"
        >
          Discover Fashion
        </Link>
      </div>
    </div>
  );
}