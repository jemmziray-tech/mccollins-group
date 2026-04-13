// app/admin/marketing/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, ImagePlus, Megaphone, ArrowLeft, ShieldCheck, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MarketingDashboard() {
  const router = useRouter();
  
  // --- HERO BANNER STATE ---
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    existingImageUrl: ''
  });
  const [image, setImage] = useState<File | null>(null);

  // --- TRUST BADGE STATE ---
  const [badges, setBadges] = useState<any[]>([]);
  const [isUploadingBadge, setIsUploadingBadge] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  // Load the current campaign and badges from the database when the page loads
  useEffect(() => {
    // 1. Fetch Hero Banner
    fetch('/api/admin/hero')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setFormData({
            title: data.title || '',
            subtitle: data.subtitle || '',
            buttonText: data.buttonText || '',
            buttonLink: data.buttonLink || '',
            existingImageUrl: data.backgroundImage || ''
          });
        }
      });

    // 2. Fetch Trust Badges
    fetch('/api/marketing/badges')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBadges(data);
        }
        setIsFetching(false);
      })
      .catch(() => setIsFetching(false));
  }, []);

  // --- HERO BANNER HANDLER ---
  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('subtitle', formData.subtitle);
      formPayload.append('buttonText', formData.buttonText);
      formPayload.append('buttonLink', formData.buttonLink);
      formPayload.append('existingImageUrl', formData.existingImageUrl);
      
      if (image) {
        formPayload.append('image', image);
      }

      const res = await fetch('/api/admin/hero', {
        method: 'POST',
        body: formPayload,
      });

      if (!res.ok) throw new Error('Update failed');
      const result = await res.json();
      
      if(result.campaign) {
          setFormData(prev => ({...prev, existingImageUrl: result.campaign.backgroundImage}));
      }

      setSuccess(true);
      setImage(null); 
      setTimeout(() => setSuccess(false), 4000);
    } catch (error) {
      alert("Error saving campaign.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- TRUST BADGE HANDLERS ---
  const handleAddBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput) return;
    setIsUploadingBadge(true);

    try {
      const res = await fetch("/api/marketing/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: linkInput, name: nameInput }),
      });

      if (res.ok) {
        const newBadge = await res.json();
        setBadges((prev) => [...prev, newBadge]); // Update UI instantly
        setLinkInput("");
        setNameInput("");
      } else {
        alert("Failed to add badge. Check API route.");
      }
    } catch (error) {
      alert("Error connecting to database.");
    } finally {
      setIsUploadingBadge(false);
    }
  };

  const handleDeleteBadge = async (id: string) => {
    if (!confirm("Are you sure you want to remove this badge from the live storefront?")) return;
    
    // Optimistic UI update (Remove instantly from screen)
    setBadges((prev) => prev.filter(badge => badge.id !== id));

    try {
      await fetch(`/api/marketing/badges?id=${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      alert("Failed to delete badge. Please refresh and try again.");
    }
  };

  if (isFetching) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]"><Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-gray-900 pb-20">
      
      {/* 🟢 LUXURY NAV */}
      <nav className="bg-[#0F1115] text-white px-6 py-4 flex justify-between items-center shadow-md border-b border-[#D4AF37]/20 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#D4AF37] p-2 rounded-sm shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <Megaphone className="w-5 h-5 text-[#0F1115]" />
          </div>
          <h1 className="text-xl font-serif tracking-tight">Marketing Campaigns</h1>
        </div>
        <Link href="/admin" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </nav>

      <div className="flex-1 p-8 md:p-12">
        <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* ========================================= */}
          {/* 1. HERO BANNER SECTION                    */}
          {/* ========================================= */}
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-serif tracking-tight text-[#1A1A1A]">Homepage Hero Banner</h2>
              <p className="text-gray-500 mt-2 font-medium text-sm">Update the main image and text that clients see when they land on your site.</p>
            </div>

            <form onSubmit={handleHeroSubmit} className="bg-white p-8 rounded-sm shadow-sm border border-gray-200 space-y-6">
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Main Headline</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-[#FDFBF7] border border-gray-200 px-4 py-3 rounded-sm focus:border-[#D4AF37] outline-none transition-all font-serif text-lg" placeholder="e.g. The Summer Collection" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subtitle</label>
                <textarea required value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className="w-full bg-[#FDFBF7] border border-gray-200 px-4 py-3 rounded-sm focus:border-[#D4AF37] outline-none transition-all h-20 text-sm" placeholder="A brief description of the campaign..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Button Text</label>
                  <input required type="text" value={formData.buttonText} onChange={(e) => setFormData({...formData, buttonText: e.target.value})} className="w-full bg-[#FDFBF7] border border-gray-200 px-4 py-3 rounded-sm focus:border-[#D4AF37] outline-none transition-all text-sm font-bold uppercase" placeholder="e.g. SHOP NOW" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Button Link</label>
                  <input required type="text" value={formData.buttonLink} onChange={(e) => setFormData({...formData, buttonLink: e.target.value})} className="w-full bg-[#FDFBF7] border border-gray-200 px-4 py-3 rounded-sm focus:border-[#D4AF37] outline-none transition-all text-sm" placeholder="e.g. /collections/summer" />
                </div>
              </div>

              <hr className="border-gray-100" />

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Background Image</label>
                <p className="text-xs text-gray-400 mb-4 font-medium">Leave this blank to keep the current image.</p>
                
                {formData.existingImageUrl && (
                  <div className="mb-4 w-full h-40 rounded-sm overflow-hidden relative border border-gray-200">
                    <img src={formData.existingImageUrl} alt="Current Background" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-[#0F1115]/80 text-[#D4AF37] text-[9px] px-3 py-1 rounded-sm uppercase font-bold tracking-widest backdrop-blur-sm border border-[#D4AF37]/30">Live Image</div>
                  </div>
                )}

                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-sm cursor-pointer bg-[#FDFBF7] hover:bg-white hover:border-[#D4AF37] transition-colors group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImagePlus className="w-6 h-6 text-gray-400 mb-2 group-hover:text-[#D4AF37] transition-colors" />
                      <p className="text-xs text-gray-500 font-bold tracking-wider uppercase group-hover:text-[#1A1A1A] transition-colors">{image ? image.name : "Upload New Visual (Optional)"}</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*,video/mp4,video/webm" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>

              <button disabled={isLoading} type="submit" className="w-full bg-[#1A1A1A] text-white font-bold uppercase tracking-[0.15em] text-[10px] py-4 rounded-sm hover:bg-[#D4AF37] hover:text-[#0F1115] transition-colors flex justify-center items-center gap-2 mt-4 shadow-sm active:scale-95">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Live to Store"}
              </button>

              {success && (
                <div className="bg-[#D4AF37]/10 text-[#997A00] border border-[#D4AF37]/30 p-4 rounded-sm flex items-center gap-3 animate-in slide-in-from-bottom-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Storefront updated successfully!</span>
                </div>
              )}
            </form>
          </div>

          {/* ========================================= */}
          {/* 2. TRUST BADGES SECTION                   */}
          {/* ========================================= */}
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-serif text-[#1A1A1A] flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#D4AF37]" /> Secured & Trusted By
              </h2>
              <p className="text-gray-500 mt-2 text-sm font-medium">Add payment and shipping logos to build trust. They will automatically animate in your footer.</p>
            </div>

            <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-200">
              
              {/* Add New Badge Form */}
              <form onSubmit={handleAddBadge} className="flex flex-col md:flex-row gap-4 mb-8">
                <input 
                  type="text" 
                  placeholder="Brand (e.g. Mastercard)" 
                  value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                  className="flex-1 bg-[#FDFBF7] border border-gray-200 rounded-sm px-4 py-3 text-sm outline-none focus:border-[#D4AF37] transition-all font-medium"
                />
                <input 
                  type="url" required
                  placeholder="Paste Image URL (.png format)" 
                  value={linkInput} onChange={(e) => setLinkInput(e.target.value)}
                  className="flex-[2] bg-[#FDFBF7] border border-gray-200 rounded-sm px-4 py-3 text-sm outline-none focus:border-[#D4AF37] transition-all font-medium"
                />
                <button type="submit" disabled={isUploadingBadge || !linkInput} className="bg-[#1A1A1A] text-white px-6 py-3 rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0F1115] disabled:opacity-50 flex items-center justify-center min-w-[140px] transition-colors shadow-sm active:scale-95">
                  {isUploadingBadge ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Badge"}
                </button>
              </form>

              {/* 🟢 Manage Existing Badges Grid */}
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Active Badges</h3>
                
                {badges.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-400 font-medium bg-gray-50 rounded-sm border border-gray-100 border-dashed">
                    No active trust badges. Add one above to display it in your footer.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {badges.map((badge) => (
                      <div key={badge.id} className="relative group bg-[#FDFBF7] border border-gray-200 rounded-sm p-4 flex items-center justify-center h-24 hover:border-[#D4AF37] transition-colors">
                        
                        {/* Delete Button (Appears on Hover) */}
                        <button 
                          onClick={() => handleDeleteBadge(badge.id)}
                          className="absolute -top-2 -right-2 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 p-1.5 rounded-sm shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                          title="Remove Badge"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <img 
                          src={badge.imageUrl} 
                          alt={badge.name} 
                          title={badge.name}
                          className="max-h-full max-w-full object-contain mix-blend-multiply opacity-70 group-hover:opacity-100 transition-opacity" 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>


              <p className="text-xs text-gray-400 mt-6 font-medium">* TIP: Search Google for "Mastercard logo transparent png", right-click the image, select "Copy Image Address", and paste it above!</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}