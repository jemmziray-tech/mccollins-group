// app/components/FashionAssistant.tsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import LuxuryImage from './LuxuryImage'; 
import { Sparkles, X, Loader2, SendHorizontal, UserCog } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function FashionAssistant({ initialProducts }: { initialProducts: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hujambo McCollins! I am your personal digital concierge. Looking for a bespoke look from the Colman Collection, or perhaps trending footwear? Tell me what you have in mind.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // 🟢 BULLETPROOF FIX: Constructing the object safely for TypeScript
    const userContent = input;
    setMessages(prev => [...prev, { role: 'user' as const, content: userContent }]);
    
    setInput('');
    setIsLoading(true);

    try {
      const recentHistory = messages.slice(-4); 

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userContent, 
          history: recentHistory,
          context: initialProducts.map(p => `${p.name} (ID: ${p.id}, Brand: ${p.brand}, Price: TSH ${p.price})`) 
        }),
      });
      const data = await res.json();
      
      // 🟢 BULLETPROOF FIX
      setMessages(prev => [...prev, { role: 'assistant' as const, content: data.reply }]);
    } catch (error) {
      console.error("AI Assistant error:", error);
      
      // 🟢 BULLETPROOF FIX
      setMessages(prev => [...prev, { role: 'assistant' as const, content: 'My apologies. My connection seems unstable. Please try asking again shortly.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant' as const, content: 'Hujambo McCollins. Ready for your next style query.' }]);
    if (messagesEndRef.current) setIsOpen(false);
  };

  const renderMessageContent = (content: string) => {
    const productRegex = /\[PROD:(\w+)\]/g; 
    let parts = content.split(productRegex);

    return parts.map((part, index) => {
      if (index % 2 === 1) { 
        const productId = part;
        const product = initialProducts.find(p => p.id === productId);
        
        if (product) {
          return (
            <div key={index} className="my-5 flex flex-col items-center bg-white border border-gray-100 p-4 rounded-sm shadow-inner gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700">
               <LuxuryImage src={product.imageUrl} alt={product.name} width={100} height={133} className="object-cover rounded-sm aspect-[3/4]" />
               <div className="text-center">
                 <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">{product.brand || "Exclusive"}</p>
                 <p className="text-[13px] font-serif text-gray-900 mt-1">{product.name}</p>
                 <p className="text-[11px] font-bold text-gray-900 mt-1.5">TSH {product.price.toLocaleString()}</p>
               </div>
               <Link href={`/product/${product.id}`} target="_blank" className="w-full">
                <button className="w-full bg-[#1A1A1A] hover:bg-gray-800 text-white text-[10px] uppercase font-bold tracking-[0.2em] py-3 rounded-sm transition-transform active:scale-95 shadow-lg">
                  Explore Piece
                </button>
               </Link>
            </div>
          );
        }
        return `[PROD:${productId}]`; 
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="fixed bottom-6 right-6 z-[100] p-5 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border border-[#D4AF37]/50 flex items-center justify-center bg-[#0F1111]"
      >
        <Sparkles className={`w-5 h-5 text-[#D4AF37] transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="fixed bottom-28 right-6 w-[380px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[80vh] bg-[#FDFBF7] shadow-3xl z-[110] rounded-sm overflow-hidden flex flex-col border border-gray-100 animate-in fade-in slide-in-from-bottom-5 duration-500">
          
          <div className="p-5 flex justify-between items-center bg-white border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="p-3 bg-[#0F1111] rounded-full border border-white/10">
                <UserCog className="w-5 h-5 text-[#D4AF37]" />
              </span>
              <div>
                <h3 className="text-xl font-serif text-gray-900">Digital Concierge.</h3>
                <p className="text-xs text-gray-500 mt-0.5">Assisting your fashion journey.</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X className="w-5 h-5"/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFBF7] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {messages.map((m, index) => (
              <div key={index} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                    p-4 max-w-[85%] text-sm font-light leading-relaxed whitespace-pre-wrap
                    ${m.role === 'user' 
                      ? 'bg-[#1A1A1A] text-white rounded-t-sm rounded-l-sm' 
                      : 'bg-white text-gray-900 border border-gray-100 shadow-inner rounded-t-sm rounded-r-sm'
                    }
                `}>
                  {renderMessageContent(m.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-4 bg-white text-gray-900 border border-gray-100 shadow-inner rounded-t-sm rounded-r-sm flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> Concierging...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-5 bg-white border-t border-gray-100">
            <div className="flex gap-2.5 border-b border-gray-200 focus-within:border-[#1A1A1A] pb-2 transition-colors">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Describe your desired look..." 
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 font-light"
              />
              <button onClick={handleSend} disabled={isLoading} className="text-[#D4AF37] hover:text-black transition-colors disabled:opacity-50">
                <SendHorizontal className="w-5 h-5" />
              </button>
            </div>
            {messages.length > 2 && (
              <button onClick={clearChat} className="mt-4 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-red-600 transition-colors w-full text-center">Clear Consultation</button>
            )}
          </div>
        </div>
      )}
    </>
  );
}