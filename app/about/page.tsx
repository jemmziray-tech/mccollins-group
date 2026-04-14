// app/about/page.tsx
import React from "react";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { Play } from "lucide-react";
import Footer from "@/app/components/SiteFooter"; // Adjust path if your footer is elsewhere

// Secure Database Connection
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default async function AboutPage() {
  // 🟢 Fetch the elevator pitch you saved in the Admin Command Center!
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "global" }
  });

  const defaultPitch = "McCollins Group: Curated luxury fashion and bespoke tailoring, delivered with uncompromising personal service.";
  const displayPitch = settings?.elevatorPitch || defaultPitch;

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1A1A1A] pt-32">
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="text-[#D4AF37] font-bold text-[10px] uppercase tracking-[0.2em] mb-4 block">
            Our Heritage
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-[#1A1A1A] leading-tight mb-6">
            Defining Modern Luxury in Tanzania
          </h1>
        </div>

        {/* The Brand Film / Video Section */}
        {/* Right now this is a beautiful placeholder. We can add a real YouTube or MP4 link here later! */}
        <div className="relative w-full aspect-video bg-[#0F1115] mb-16 group cursor-pointer overflow-hidden rounded-sm shadow-xl animate-in fade-in duration-1000 delay-300">
          {/* Simulated Video Thumbnail Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity duration-500"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000')" }}
          ></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-full border border-white/20 group-hover:scale-110 group-hover:bg-[#D4AF37] transition-all duration-300">
              <Play className="w-8 h-8 text-white group-hover:text-[#0F1115] ml-1" fill="currentColor" />
            </div>
            <span className="text-white text-[10px] font-bold uppercase tracking-widest mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Watch Brand Film
            </span>
          </div>
        </div>

        {/* 🟢 The Dynamic Elevator Pitch from your Database */}
        <div className="max-w-3xl mx-auto text-center animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
          <div className="w-10 h-px bg-[#D4AF37] mx-auto mb-8"></div>
          
          <p className="text-xl md:text-3xl font-serif text-gray-800 leading-relaxed italic">
            "{displayPitch}"
          </p>
          
          <div className="w-10 h-px bg-[#D4AF37] mx-auto mt-8 mb-12"></div>
          
          <p className="text-sm text-gray-500 leading-loose">
            Founded with a commitment to exceptional quality, McCollins Group operates beyond traditional retail. 
            We provide an end-to-end concierge experience. From exclusive, limited-edition pieces to our dedicated 
            Master Tailor queue for made-to-measure garments, every detail is crafted around you.
          </p>

          <Link 
            href="/?q=all" 
            className="inline-block mt-10 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-[#0F1115] px-8 py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] transition-colors"
          >
            Explore The Collection
          </Link>
        </div>

      </div>

      <Footer />
    </div>
  );
}