// app/components/FashionAssistant.tsx
"use client";

import React, { useState } from 'react';
import { X, Send, Loader2, Sparkles } from 'lucide-react';

// 1. Define your quick questions
const QUICK_QUESTIONS = [
  "👕 Show me latest shirts",
  "👖 Do you have denim?",
  "🚚 How does delivery work?",
  "💰 What is the price range?"
];

export default function FashionAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName] = useState<string | null>(null);

  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { 
      role: 'bot', 
      text: `Hi ${userName || 'there'}! I am the McCollins AI Assistant. Looking for something specific in our collection today?` 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- CORE MESSAGE LOGIC ---
  // Extracted this into a separate function so both the "Enter" key and "Quick Chips" can use it
  const processMessage = async (userText: string) => {
    if (!userText.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput(""); // Clear the input box instantly
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }), // Note: Your API currently expects { message: string } or { messages: array }. Adjust if needed based on your AI SDK!
      });

      if (!res.ok) throw new Error("Network response was not ok");
      
      const data = await res.json();
      
      // Bulletproof extraction
      let botText = "Sorry, I couldn't parse the response.";
      if (typeof data.reply === 'string') botText = data.reply;
      else if (data.reply?.reply) botText = data.reply.reply;
      else if (typeof data === 'string') botText = data;
      else botText = JSON.stringify(data.reply || data);

      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Connection fuzzy. Try again?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Triggered by the form submit (Enter key or Send button)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processMessage(input);
  };

  return (
    <div className="fixed bottom-24 right-8 z-50 font-sans">
      {/* The Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[320px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[450px] animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Header - Sleek Dark Design */}
          <div className="bg-[#131921] text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 p-1 rounded-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">McCollins AI Guide</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#F7F8FA] space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#131921] text-white rounded-tr-none shadow-md' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-xs text-gray-500 italic">Curating style...</span>
                </div>
              </div>
            )}
          </div>

          {/* QUICK ACTION CHIPS & INPUT FORM WRAPPER */}
          <div className="bg-white border-t border-gray-100 flex flex-col">
            
            {/* Quick Action Chips (Hidden scrollbar trick applied) */}
            <div className="flex gap-2 overflow-x-auto pb-2 pt-3 px-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {QUICK_QUESTIONS.map((question, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => processMessage(question)}
                  disabled={isLoading}
                  className="whitespace-nowrap bg-gray-50 hover:bg-[#febd69] hover:text-[#131921] text-gray-600 text-[11px] px-3 py-1.5 rounded-full font-medium transition-colors border border-gray-200 shadow-sm disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-3 pt-1">
              <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-[#febd69] focus:ring-2 focus:ring-[#febd69]/20 rounded-xl px-4 py-2.5 text-sm transition-all outline-none text-gray-900"
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="bg-[#febd69] hover:bg-[#f3a847] text-[#0F1111] p-2.5 rounded-xl disabled:opacity-50 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center bg-[#131921] text-white w-14 h-14 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all border-2 border-transparent hover:border-[#febd69]"
        >
          <Sparkles className="w-6 h-6 text-[#febd69]" />
        </button>
      )}
    </div>
  );
}