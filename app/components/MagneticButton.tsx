// app/components/MagneticButton.tsx
"use client";

import React, { useRef, useState } from 'react';

export default function MagneticButton({ 
  children, 
  onClick, 
  className = "",
  disabled = false,
  type = "button",
  form
}: { 
  children: React.ReactNode; 
  onClick?: (e: any) => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  form?: string;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || disabled) return;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    
    // Calculate distance from center (0.3 is the magnetic pull strength)
    // Lower number = stiffer button, Higher number = looser/more magnetic
    const x = (e.clientX - (left + width / 2)) * 0.3; 
    const y = (e.clientY - (top + height / 2)) * 0.3;
    
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    // Snap back to center smoothly when the mouse leaves
    setPosition({ x: 0, y: 0 }); 
  };

  return (
    <button
      ref={buttonRef}
      type={type}
      form={form}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      className={`transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      {children}
    </button>
  );
}