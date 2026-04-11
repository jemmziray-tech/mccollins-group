"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, ImagePlus, Megaphone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MarketingDashboard() {
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

  // Load the current campaign from the database when the page loads
  useEffect(() => {
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
        setIsFetching(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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
      
      // Only append a new image if the user actually selected one!
      if (image) {
        formPayload.append('image', image);
      }

      const res = await fetch('/api/admin/hero', {
        method: 'POST',
        body: formPayload,
      });

      if (!res.ok) throw new Error('Update failed');
      const result = await res.json();
      
      // Update the UI with the new image URL if one was created
      if(result.campaign) {
          setFormData(prev => ({...prev, existingImageUrl: result.campaign.backgroundImage}));
      }

      setSuccess(true);
      setImage(null); // Clear the file input
      setTimeout(() => setSuccess(false), 4000);
    } catch (error) {
      alert("Error saving campaign.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 pb-12">
      
      {/* Top Nav */}
      <nav className="bg-[#131921] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-[#febd69] p-2 rounded-lg">
            <Megaphone className="w-5 h-5 text-[#131921]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Marketing Campaigns</h1>
        </div>
        <Link href="/admin" className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </nav>

      <div className="flex-1 p-8 md:p-12">
        <div className="max-w-3xl mx-auto">
          
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight">Homepage Hero Banner</h2>
            <p className="text-gray-500 mt-2">Update the main image and text that customers see when they land on your site.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Main Headline</label>
              <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" placeholder="e.g. Summer Collection 2026" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Subtitle</label>
              <textarea required value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all h-20" placeholder="A brief description of the campaign..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Button Text</label>
                <input required type="text" value={formData.buttonText} onChange={(e) => setFormData({...formData, buttonText: e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" placeholder="e.g. SHOP NOW" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Button Link</label>
                <input required type="text" value={formData.buttonLink} onChange={(e) => setFormData({...formData, buttonLink: e.target.value})} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" placeholder="e.g. /?category=Shirts" />
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Background Image</label>
              <p className="text-[11px] text-gray-500 mb-4">Leave this blank to keep the current image.</p>
              
              {/* Show current image preview */}
              {formData.existingImageUrl && (
                <div className="mb-4 w-full h-32 rounded-lg overflow-hidden relative border border-gray-200">
                  <img src={formData.existingImageUrl} alt="Current Background" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded uppercase font-bold tracking-wider">Current Image</div>
                </div>
              )}

              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImagePlus className="w-6 h-6 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-500 font-bold">{image ? image.name : "Upload new image (Optional)"}</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*,video/mp4,video/webm" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>

            <button disabled={isLoading} type="submit" className="w-full bg-black text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl hover:bg-gray-800 transition-colors flex justify-center items-center gap-2 mt-4 shadow-md active:scale-95">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Live to Store"}
            </button>

            {success && (
              <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-bold">Homepage updated successfully!</span>
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
}