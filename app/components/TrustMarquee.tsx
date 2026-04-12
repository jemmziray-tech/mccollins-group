// app/components/TrustMarquee.tsx
import { prisma } from "@/lib/prisma";

export default async function TrustMarquee() {
  // Fetch active badges from the database
  const badges = await prisma.trustBadge.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' }
  });

  if (badges.length === 0) return null;

  // We duplicate the array a few times so the scrolling never visually "ends" or snaps
  const displayBadges = [...badges, ...badges, ...badges, ...badges, ...badges];

  return (
    <div className="bg-[#131921] py-4 overflow-hidden border-y border-white/10 relative w-full flex items-center">
      {/* 🟢 Left & Right Fade Gradients for a luxury look */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#131921] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#131921] to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee flex items-center gap-16 px-8">
        {displayBadges.map((badge, i) => (
          <img 
            key={`${badge.id}-${i}`} 
            src={badge.imageUrl} 
            alt={badge.name || "Trust Badge"} 
            title={badge.name || ""}
            className="h-8 md:h-10 w-auto object-contain opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-pointer" 
          />
        ))}
      </div>
    </div>
  );
}