// app/components/ProductRecommendations.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PrismaClient } from '@prisma/client';
import { Sparkles } from 'lucide-react';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default async function ProductRecommendations({ 
  currentProductId, 
  category, 
  brand 
}: { 
  currentProductId: string, 
  category: string, 
  brand: string 
}) {
  
  // 1. FETCH ALL POTENTIAL MATCHES
  // We remove the limit. For a curated luxury catalog, we want to analyze 
  // every single related piece to ensure we never miss a Perfect Match.
  const rawMatches = await prisma.product.findMany({
    where: {
      isAvailable: true,
      id: { not: currentProductId }, 
      OR: [
        { category: category },
        { brand: brand }
      ]
    }
  });

  // 2. THE MATHEMATICAL SCORING ALGORITHM
  const scoredMatches = rawMatches.map(product => {
    let baseScore = 0;
    
    // Assign Base Weights
    if (product.category === category && product.brand === brand) baseScore = 3;
    else if (product.category === category) baseScore = 2;
    else if (product.brand === brand) baseScore = 1;

    // 🟢 The Genius Shuffle: Math.random() returns a decimal between 0 and 0.99.
    // Adding this decimal acts as an invisible tie-breaker. 
    // A Score 2 (e.g., 2.85) will NEVER beat a Score 3 (e.g., 3.12).
    const finalScore = baseScore + Math.random();

    return { ...product, finalScore };
  });

  // 3. STRICT SORT AND SLICE
  const recommendations = scoredMatches
    .sort((a, b) => b.finalScore - a.finalScore) // Highest score wins
    .slice(0, 4); // Keep only the top 4

  if (recommendations.length === 0) return null;

  return (
    <div className="w-full border-t border-gray-200 bg-white py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col items-center text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="w-4 h-4 text-[#D4AF37] mb-3" />
          <h2 className="text-3xl font-serif text-[#1A1A1A] mb-2">Curated Pairings</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">The Editorial Edit</p>
        </div>

        <div className="flex overflow-x-auto pb-8 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 md:px-0 md:mx-0 gap-6">
          
          {recommendations.map((product) => (
            <Link 
              href={`/product/${product.id}`} 
              key={product.id}
              className="w-[75vw] sm:w-[45vw] md:w-auto shrink-0 snap-center group flex flex-col"
            >
              <div className="relative w-full aspect-[4/5] bg-[#FDFBF7] rounded-sm overflow-hidden mb-4 shadow-sm border border-gray-100">
                <Image 
                  src={product.imageUrl} 
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 75vw, 25vw"
                  className={`object-cover mix-blend-multiply transition-transform duration-1000 group-hover:scale-105 ${product.hoverImageUrl ? 'group-hover:opacity-0' : ''}`}
                />
                {product.hoverImageUrl && (
                  <Image 
                    src={product.hoverImageUrl} 
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 75vw, 25vw"
                    className="object-cover mix-blend-multiply absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  />
                )}
              </div>

              <div className="flex flex-col items-center text-center px-2">
                <span className="text-[#D4AF37] font-bold text-[9px] uppercase tracking-[0.2em] mb-1.5">
                  {product.brand || "Exclusive"}
                </span>
                <h3 className="text-[#1A1A1A] font-serif text-lg leading-tight mb-2 group-hover:text-gray-600 transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <span className="text-sm font-bold text-[#1A1A1A]">
                  <span className="text-[10px] text-gray-500 mr-1 align-top relative top-0.5">TSH</span>
                  {/* Safe parsing for Prisma Decimals */}
                  {Number(product.price).toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}