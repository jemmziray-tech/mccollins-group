"use client";

import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react'; 
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

const QUICK_QUESTIONS = [
  "✨ Take the Style Quiz",
  "📦 How does delivery work?",
  "💎 Show me McCollins Exclusives"
];

// 🟢 SMART CONCIERGE DATA
const QUIZ_STEPS = [
  {
    question: "Je, unatafuta nguo za nani leo? (Who are you shopping for?)",
    options: [
      { label: "Wanaume (Men)", value: "Men" },
      { label: "Wanawake (Women)", value: "Women" },
      { label: "Watoto (Kids)", value: "Kids" }
    ]
  },
  {
    question: "Kwenye mtoko gani? (What's the vibe?)",
    options: [
      { label: "Casual & Chill (Streetwear, Tees)", value: "Shirts Jeans Casual" },
      { label: "Office & Smart (Suits, Formal)", value: "Formal Suits Tailored" },
      { label: "Evening & Party (Dresses, Heels)", value: "Dresses Heels Evening" }
    ]
  },
  {
    question: "Chagua designer wako. (Choose your brand)",
    options: [
      { label: "Colman Looks Signature", value: "Colman Looks" },
      { label: "McCollins Exclusive", value: "McCollins Exclusive" },
      { label: "Nipe zote! (Surprise Me)", value: "" }
    ]
  }
];

export default function FashionAssistant() {
  const { data: session } = useSession(); 
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  // Quiz States
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);

  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: `Hi there! I am the McCollins AI Concierge. How can I style you today?` }
  ]);
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.name) {
      const firstName = session.user.name.split(' ')[0]; 
      setMessages([
        { role: 'bot', text: `Karibu tena **${firstName}**! I am the McCollins AI Concierge. How can I style you today?` }
      ]);
    }
  }, [session]);

  const processMessage = async (userText: string) => {
    if (!userText.trim()) return;

    // 🟢 Intercept the Style Quiz click
    if (userText === "✨ Take the Style Quiz") {
      setIsQuizMode(true);
      setQuizStep(0);
      setQuizAnswers([]);
      return;
    }

    const currentHistory = [...messages];
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput(""); 
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userText,
          userName: session?.user?.name || "a Guest",
          history: currentHistory 
        }), 
      });

      if (!res.ok) throw new Error("Network response was not ok");
      
      const data = await res.json();
      
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processMessage(input);
  };

  // 🟢 Handle Quiz Progression
  const handleQuizAnswer = (answer: string) => {
    const newAnswers = [...quizAnswers, answer];
    setQuizAnswers(newAnswers);

    if (quizStep < QUIZ_STEPS.length - 1) {
      setQuizStep(prev => prev + 1);
    } else {
      // Finish Quiz & Route to Search!
      setIsLoading(true);
      setTimeout(() => {
        const smartQuery = newAnswers.join(" ").trim();
        setIsQuizMode(false);
        setIsOpen(false);
        setIsLoading(false);
        router.push(`/?q=${encodeURIComponent(smartQuery)}`);
      }, 1000);
    }
  };

  return (
    <div className="fixed bottom-8 right-6 md:bottom-12 md:right-10 z-[250] font-sans">
      {isOpen && (
        <div className="mb-4 w-[340px] sm:w-[400px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-4 duration-300">
          
          <div className="bg-[#0F1115] text-[#D4AF37] p-5 flex justify-between items-center shadow-md border-b border-[#D4AF37]/20">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-sm">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <span className="font-serif font-bold text-[15px] tracking-tight block text-white">Style Concierge</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400">By McCollins</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-5 overflow-y-auto bg-[#FDFBF7] space-y-4">
            
            {/* 🟢 QUIZ MODE UI */}
            {isQuizMode ? (
              <div className="flex flex-col h-full justify-center animate-in fade-in duration-500">
                <div className="text-center mb-8">
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-2 block">Step {quizStep + 1} of 3</span>
                  <h3 className="text-xl font-serif text-[#1A1A1A]">{QUIZ_STEPS[quizStep].question}</h3>
                </div>
                
                <div className="space-y-3">
                  {QUIZ_STEPS[quizStep].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(option.value)}
                      className="w-full text-left bg-white border border-gray-200 hover:border-[#D4AF37] p-4 rounded-sm shadow-sm hover:shadow-md transition-all flex justify-between items-center group"
                    >
                      <span className="text-sm font-bold text-gray-800 group-hover:text-[#D4AF37] transition-colors">{option.label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                    </button>
                  ))}
                </div>

                {isLoading && (
                  <div className="mt-8 flex flex-col items-center text-[#D4AF37]">
                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">Curating your look...</span>
                  </div>
                )}
              </div>
            ) : (
              /* STANDARD CHAT UI */
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-sm text-[13px] leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-[#1A1A1A] text-white' 
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}>
                      {msg.role === 'bot' ? (
                        <div className="[&>p]:mb-2 last:[&>p]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>li]:mb-1 [&_strong]:font-bold [&_strong]:text-[#1A1A1A]">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 p-3 rounded-sm shadow-sm flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />
                      <span className="text-xs text-gray-500 italic">Thinking...</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* INPUT AREA (Hidden during quiz) */}
          {!isQuizMode && (
            <div className="bg-white border-t border-gray-100 flex flex-col">
              <div className="flex gap-2 overflow-x-auto pb-2 pt-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {QUICK_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => processMessage(question)}
                    disabled={isLoading}
                    className="whitespace-nowrap bg-white hover:bg-[#0F1115] hover:text-[#D4AF37] text-gray-600 text-[11px] uppercase tracking-wider px-4 py-2 rounded-sm transition-colors border border-gray-200 shadow-sm disabled:opacity-50 font-bold"
                  >
                    {question}
                  </button>
                ))}
              </div>

              <div className="p-4 pt-2">
                <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#D4AF37] outline-none rounded-sm px-4 py-3 text-sm transition-all text-gray-900 font-medium"
                  />
                  <button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black p-3 rounded-sm disabled:opacity-50 transition-colors active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center bg-[#0F1115] text-[#D4AF37] w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all border border-[#D4AF37]/30"
        >
          <Sparkles className="w-6 h-6 md:w-7 md:h-7" />
        </button>
      )}
    </div>
  );
}