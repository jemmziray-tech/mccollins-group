"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ArrowUp, MoreHorizontal, Send, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

export interface StorySlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  link: string;
}

export interface StoryGroup {
  id: string;
  name: string;
  thumbnail: string;
  slides: StorySlide[];
}

interface StoryViewerProps {
  groups: StoryGroup[];
  initialGroupIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function StoryViewer({ groups, initialGroupIndex, isOpen, onClose }: StoryViewerProps) {
  const router = useRouter();
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [liked, setLiked] = useState(false);

  const SLIDE_DURATION = 5000;

  // Reset state when opening a new group
  useEffect(() => {
    if (isOpen) {
      setCurrentGroupIndex(initialGroupIndex);
      setCurrentSlideIndex(0);
      setIsPaused(false);
      setLiked(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, initialGroupIndex]);

  const currentGroup = groups[currentGroupIndex];
  const currentSlide = currentGroup?.slides[currentSlideIndex];

  const handleNextSlide = useCallback(() => {
    if (!currentGroup) return;
    setLiked(false);
    if (currentSlideIndex < currentGroup.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } else if (currentGroupIndex < groups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
      setCurrentSlideIndex(0);
    } else {
      onClose();
    }
  }, [currentGroup, currentSlideIndex, currentGroupIndex, groups.length, onClose]);

  const handlePrevSlide = useCallback(() => {
    if (!currentGroup) return;
    setLiked(false);
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    } else if (currentGroupIndex > 0) {
      setCurrentGroupIndex(prev => prev - 1);
      setCurrentSlideIndex(groups[currentGroupIndex - 1].slides.length - 1);
    } else {
      setCurrentSlideIndex(0); 
    }
  }, [currentGroup, currentSlideIndex, currentGroupIndex, groups]);

  // Auto-advance
  useEffect(() => {
    if (!isOpen || isPaused || !currentGroup) return;
    const timer = setTimeout(handleNextSlide, SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [isOpen, isPaused, currentSlideIndex, currentGroupIndex, handleNextSlide, currentGroup]);

  if (!isOpen || !currentGroup || !currentSlide) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, y: 100 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-[9999] bg-black md:bg-black/95 md:backdrop-blur-2xl flex items-center justify-center"
      >
        {/* Main Story Container - Mobile Full Screen, Desktop Constrained */}
        <div className="relative w-full h-[100dvh] md:max-w-[420px] md:h-[90vh] mx-auto bg-[#111] flex flex-col md:rounded-[2rem] overflow-hidden md:shadow-[0_0_50px_rgba(0,0,0,0.5)] md:border md:border-white/10">
          
          {/* Progress Bars (IG Style) */}
          <div className="absolute top-0 left-0 right-0 z-50 flex gap-1.5 px-2 pt-3 pb-8 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            {currentGroup.slides.map((_, idx) => (
              <div key={idx} className="h-[2.5px] flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full bg-white transition-all ease-linear shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                  style={{
                    width: idx < currentSlideIndex ? '100%' : idx === currentSlideIndex ? (isPaused ? 'auto' : '100%') : '0%',
                    transitionDuration: idx === currentSlideIndex && !isPaused ? `${SLIDE_DURATION}ms` : '0ms'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header (IG Style) */}
          <div className="absolute top-6 left-0 right-0 z-50 flex items-center justify-between px-3 mt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                <div className="w-full h-full rounded-full border border-black overflow-hidden bg-black">
                  <img src={currentGroup.thumbnail} alt={currentGroup.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex flex-col drop-shadow-md shadow-black">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-semibold text-[13px] leading-tight">{currentGroup.name}</span>
                  <span className="text-white/60 text-[11px] font-medium leading-tight mt-[1px]">2h</span>
                </div>
                <span className="text-white/80 text-[10px] leading-tight mt-[1px]">Audio by McCollins</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-white drop-shadow-md">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="p-1.5 text-white drop-shadow-md">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Media Area */}
          <div 
            className="relative flex-1 bg-black overflow-hidden"
            onPointerDown={() => setIsPaused(true)}
            onPointerUp={() => setIsPaused(false)}
            onPointerLeave={() => setIsPaused(false)}
          >
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentSlide.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                src={currentSlide.imageUrl} 
                alt={currentSlide.title}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            
            {/* Subtle Ken Burns Zoom while playing */}
            <motion.div 
               key={`overlay-${currentSlide.id}`}
               initial={{ scale: 1 }}
               animate={{ scale: isPaused ? 1 : 1.05 }}
               transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
               className="absolute inset-0 pointer-events-none"
            >
              <img src={currentSlide.imageUrl} alt="" className="w-full h-full object-cover opacity-0" />
            </motion.div>

            {/* Tap Zones */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-40" onClick={(e) => { e.stopPropagation(); handlePrevSlide(); }} />
            <div className="absolute inset-y-0 right-0 w-2/3 z-40" onClick={(e) => { e.stopPropagation(); handleNextSlide(); }} />

            {/* Bottom Content Area (IG Swipe Up Style) */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pt-32 pb-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-50 pointer-events-none flex flex-col items-center">
              
              <div className="text-center mb-6 max-w-[85%]">
                <h2 className="text-xl font-bold text-white mb-1 drop-shadow-lg">{currentSlide.title}</h2>
                <p className="text-white/90 text-sm drop-shadow-md">{currentSlide.subtitle}</p>
              </div>
              
              {/* Interactions Footer */}
              <div className="w-full flex items-center gap-3 pointer-events-auto">
                {/* Search/Reply Bar */}
                <div 
                  className="flex-1 h-11 rounded-full border border-white/40 bg-black/20 backdrop-blur-md px-4 flex items-center text-white/80 text-sm cursor-text hover:bg-black/40 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Send message...
                </div>
                
                {/* Like Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
                  className="w-10 h-10 flex items-center justify-center hover:scale-110 active:scale-90 transition-transform"
                >
                  <Heart className={`w-7 h-7 transition-colors duration-300 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
                
                {/* Share Button */}
                <button className="w-10 h-10 flex items-center justify-center hover:scale-110 active:scale-90 transition-transform text-white">
                  <Send className="w-6 h-6 -ml-1 -mt-1 transform rotate-12" />
                </button>
              </div>

              {/* View Product CTA */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                  router.push(currentSlide.link);
                }}
                className="mt-5 flex flex-col items-center gap-1 group pointer-events-auto animate-pulse"
              >
                <ArrowUp className="w-5 h-5 text-white/80 group-hover:-translate-y-1 transition-transform" />
                <span className="text-[11px] font-bold text-white/90 uppercase tracking-widest">View Product</span>
              </button>

            </div>
          </div>
        </div>

        {/* Desktop Navigation Hints */}
        <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 w-full justify-between px-[5vw] xl:px-[15vw] pointer-events-none z-0">
          <button onClick={(e) => { e.stopPropagation(); handlePrevSlide(); }} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-xl flex items-center justify-center text-white pointer-events-auto transition-all hover:scale-110 border border-white/20">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleNextSlide(); }} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-xl flex items-center justify-center text-white pointer-events-auto transition-all hover:scale-110 border border-white/20">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
