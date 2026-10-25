"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import StoryViewer, { StoryGroup } from './StoryViewer';

// Categories with expanded data for stories
const CATEGORY_STORIES: StoryGroup[] = [
  {
    id: 'women',
    name: "Women",
    thumbnail: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=300&auto=format&fit=crop",
    slides: [
      { id: 'w1', imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop", title: "New Arrivals", subtitle: "Summer Collection", link: "/?q=women" },
      { id: 'w2', imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop", title: "Elegant Dresses", subtitle: "Perfect for evenings", link: "/?q=women" }
    ]
  },
  {
    id: 'men',
    name: "Men",
    thumbnail: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=300&auto=format&fit=crop",
    slides: [
      { id: 'm1', imageUrl: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop", title: "Sharp Suits", subtitle: "Tailored to perfection", link: "/?q=men" },
      { id: 'm2', imageUrl: "https://images.unsplash.com/photo-1490578474895-699bc4e3f44f?q=80&w=800&auto=format&fit=crop", title: "Casual Wear", subtitle: "Weekend ready", link: "/?q=men" }
    ]
  },
  {
    id: 'kids',
    name: "Kids",
    thumbnail: "https://images.unsplash.com/photo-1519241047957-be31d7379a5d?q=80&w=300&auto=format&fit=crop",
    slides: [
      { id: 'k1', imageUrl: "https://images.unsplash.com/photo-1519241047957-be31d7379a5d?q=80&w=800&auto=format&fit=crop", title: "Kids Playwear", subtitle: "Durable and fun", link: "/?q=kids" }
    ]
  },
  {
    id: 'shoes',
    name: "Shoes",
    thumbnail: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=300&auto=format&fit=crop",
    slides: [
      { id: 's1', imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop", title: "Sneakers", subtitle: "Step in style", link: "/?q=shoes" },
      { id: 's2', imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop", title: "Heels", subtitle: "Elevate your look", link: "/?q=shoes" }
    ]
  },
  {
    id: 'accessories',
    name: "Accessories",
    thumbnail: "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=300&auto=format&fit=crop",
    slides: [
      { id: 'a1', imageUrl: "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=800&auto=format&fit=crop", title: "Luxury Bags", subtitle: "Carry elegance", link: "/?q=accessories" }
    ]
  },
];

export default function CategoryBubbles() {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [seenStories, setSeenStories] = useState<Set<string>>(new Set());

  const handleOpenStory = (index: number, id: string) => {
    setSelectedStoryIndex(index);
    setSeenStories(prev => new Set(prev).add(id));
  };

  return (
    <>
      <section className="w-full bg-white pt-28 pb-6 md:pt-36 border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          
          {/* The Scrolling Container */}
          <div className="flex gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] justify-start md:justify-center">
            
            {CATEGORY_STORIES.map((group, index) => {
              const isSeen = seenStories.has(group.id);
              
              return (
                <button 
                  key={group.id} 
                  onClick={() => handleOpenStory(index, group.id)}
                  className="flex flex-col items-center gap-2 shrink-0 snap-start group outline-none"
                >
                  {/* The Bubble with Instagram style gradient ring */}
                  <div className={`p-[3px] rounded-full transition-transform duration-300 group-active:scale-95 ${
                    isSeen 
                      ? 'bg-gray-200' // Gray ring for seen stories
                      : 'bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888]' // Classic Instagram vibrant gradient
                  }`}>
                    <div className="w-[75px] h-[75px] md:w-[90px] md:h-[90px] rounded-full overflow-hidden border-2 border-white relative shadow-sm">
                      <img 
                        src={group.thumbnail} 
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                  </div>
                  
                  {/* The Label */}
                  <span className={`text-[11px] md:text-xs tracking-wide transition-colors duration-300 ${
                    isSeen ? 'text-gray-500 font-medium' : 'text-black font-semibold'
                  }`}>
                    {group.name}
                  </span>
                </button>
              );
            })}
            
          </div>
        </div>
      </section>

      {/* Story Viewer Modal */}
      <StoryViewer 
        groups={CATEGORY_STORIES}
        initialGroupIndex={selectedStoryIndex ?? 0}
        isOpen={selectedStoryIndex !== null}
        onClose={() => setSelectedStoryIndex(null)}
      />
    </>
  );
}