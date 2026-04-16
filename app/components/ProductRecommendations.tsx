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
  
  // 1. FETCH A POOL OF POTENTIAL MATCHES
  // We pull up to 10 items so we have enough data to find the "best" matches.
  const rawMatches = await prisma.product.findMany({
    where: {
      isAvailable: true,
      id: { not: currentProductId }, // Never recommend the exact item they are viewing
      OR: [
        { category: category },
        { brand: brand }
      ]
    },
    take: 10, 
  });

  // 2. THE INTELLIGENT SCORING ALGORITHM
  const scoredMatches = rawMatches.map(product => {
    let score = 0;
    
    // Perfect Match: Same Category AND Same Brand
    if (product.category === category && product.brand === brand) {
      score += 3;
    } 
    // Strong Match: Same Category (e.g., they are looking at shirts, show more shirts)
    else if (product.category === category) {
      score += 2;
    } 
    // Vibe Match: Same Designer/Brand
    else if (product.brand === brand) {
      score += 1;
    }

    return { ...product, score };
  });

  // 3. SORT BY HIGHEST SCORE AND LIMIT TO EXACTLY 4
  const recommendations = scoredMatches
    .sort((a, b) => b.score - a.score) // Sort highest score to the top
    .slice(0, 4); // Strictly limit to 4 recommendations

  // If we don't have ANY matches, gracefully hide the section
  if (recommendations.length === 0) return null;

  return (
    <div className="w-full border-t border-gray-200 bg-white py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Luxury Section Header */}
        <div className="flex flex-col items-center text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="w-4 h-4 text-[#D4AF37] mb-3" />
          <h2 className="text-3xl font-serif text-[#1A1A1A] mb-2">Curated Pairings</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Complete the Editorial Look</p>
        </div>

        {/* MODERN SCROLLING: Grid on Desktop, Snap-Scroll Carousel on Mobile */}
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
                    alt={`${product.name} alternate view`}
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
                  {product.price.toLocaleString()}
                </span>
              </div>
            </Link>
          ))}

        </div>
      </div>
    </div>
  );
}