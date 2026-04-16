// app/components/LuxuryImage.tsx
"use client";

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

export default function LuxuryImage({ src, alt, className, ...props }: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Image
      src={src}
      alt={alt}
      // We merge the blur logic with whatever custom cinematic classes you pass in
      className={`
        transition-[filter,opacity] duration-[1500ms] ease-out
        ${isLoaded ? 'blur-0 opacity-100' : 'blur-xl opacity-0 bg-[#F4F4F4]'}
        ${className || ''}
      `}
      onLoad={() => setIsLoaded(true)}
      {...props}
    />
  );
}