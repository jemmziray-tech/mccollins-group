// app/about/page.tsx
import React from "react";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import Footer from "@/app/components/SiteFooter"; 

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default async function AboutPage() {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "global" }
  });

  const defaultPitch = "McCollins Group: Curated luxury fashion and bespoke tailoring, delivered with uncompromising personal service.";
  const displayPitch = settings?.elevatorPitch || defaultPitch;
  const videoUrl = settings?.brandVideoUrl;

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1A1A1A] pt-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="text-[#D4AF37] font-bold text-[10px] uppercase tracking-[0.2em] mb-4 block">Our Heritage</span>
          <h1 className="text-4xl md:text-6xl font-serif text-[#1A1A1A] leading-tight mb-6">Defining Modern Luxury in Tanzania</h1>
        </div>

        {/* 🟢 THE DYNAMIC VIDEO PLAYER */}
        {videoUrl && (
          <div className="relative w-full aspect-video bg-[#0F1115] mb-16 rounded-sm shadow-xl overflow-hidden animate-in fade-in duration-1000 delay-300">
            {videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? (
              <iframe 
                className="w-full h-full"
                src={videoUrl.replace("watch?v=", "embed/")} 
                allow="autoplay; encrypted-media; picture-in-picture" 
                allowFullScreen
              ></iframe>
            ) : (
              <video 
                src={videoUrl} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover opacity-80"
              />
            )}
          </div>
        )}

        <div className="max-w-3xl mx-auto text-center animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
          <div className="w-10 h-px bg-[#D4AF37] mx-auto mb-8"></div>
          <p className="text-xl md:text-3xl font-serif text-gray-800 leading-relaxed italic">"{displayPitch}"</p>
          <div className="w-10 h-px bg-[#D4AF37] mx-auto mt-8 mb-12"></div>
          
          <p className="text-sm text-gray-500 leading-loose">
            Founded with a commitment to exceptional quality, McCollins Group operates beyond traditional retail. 
            We provide an end-to-end concierge experience. From exclusive, limited-edition pieces to our dedicated 
            Master Tailor queue for made-to-measure garments, every detail is crafted around you.
          </p>

          <Link href="/?q=all" className="inline-block mt-10 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-[#0F1115] px-8 py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] transition-colors">
            Explore The Collection
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}