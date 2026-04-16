// app/components/RevealOnScroll.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

export default function RevealOnScroll({ 
  children, 
  className = "", 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Unobserve after revealing so it only animates once per visit
          observer.unobserve(entry.target); 
        }
      },
      {
        // 🟢 FIX 1: Trigger immediately when 1 pixel enters the screen
        threshold: 0, 
        // 🟢 FIX 2: Trigger the animation 100px BEFORE it even enters the viewport, 
        // guaranteeing no one stares at a blank white space.
        rootMargin: "100px 0px 100px 0px" 
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}