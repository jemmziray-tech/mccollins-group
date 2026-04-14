// app/components/ElevatorPitchEditor.tsx
"use client";

import React, { useState } from 'react';
import { Quote, Save, Loader2, CheckCircle2, Edit3 } from 'lucide-react';

export default function ElevatorPitchEditor({ initialPitch }: { initialPitch: string | null }) {
  const [pitch, setPitch] = useState(initialPitch || "McCollins Group: Curated luxury fashion and bespoke tailoring, delivered with uncompromising personal service.");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elevatorPitch: pitch }),
      });

      if (res.ok) {
        setIsSaved(true);
        setIsEditing(false);
        setTimeout(() => setIsSaved(false), 3000); // Hide success message after 3 seconds
      }
    } catch (error) {
      alert("Failed to save pitch.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden relative group">
      {/* Decorative Gold Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-yellow-200"></div>
      
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#FDFBF7] p-2.5 rounded-full border border-[#D4AF37]/30">
              <Quote className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-xl font-serif text-[#1A1A1A] leading-tight">Brand Identity</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Official Elevator Pitch</p>
            </div>
          </div>

          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-[#D4AF37] transition-colors p-2"
              title="Edit Pitch"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="animate-in fade-in duration-300">
            <textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              rows={4}
              className="w-full border border-[#D4AF37]/50 rounded-sm p-4 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none leading-relaxed italic bg-[#FDFBF7]"
              placeholder="Enter your brand's elevator pitch here..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={() => setIsEditing(false)}
                className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black px-4 py-2 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isLoading}
                className="bg-[#1A1A1A] hover:bg-[#D4AF37] hover:text-[#0F1115] text-white px-6 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 shadow-sm"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Save Pitch</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <p className="text-lg md:text-xl font-serif text-gray-800 leading-relaxed italic text-center px-4 md:px-10">
              "{pitch}"
            </p>
            
            {/* Success Notification Bubble */}
            {isSaved && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-50 text-green-600 border border-green-200 text-xs px-4 py-1.5 rounded-full flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in shadow-sm">
                <CheckCircle2 className="w-3 h-3" /> Successfully Saved
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}