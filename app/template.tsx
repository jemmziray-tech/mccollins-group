// app/template.tsx
"use client";

import React from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in duration-1000 ease-out fill-mode-both">
      {children}
    </div>
  );
}