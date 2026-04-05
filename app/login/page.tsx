// app/login/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Phase 3: We will connect Supabase Auth here!
    console.log(isLogin ? "Logging in..." : "Creating account...", { email, password, name });
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4 selection:bg-[#febd69] selection:text-black animate-in fade-in duration-300 ease-in-out">
      
      {/* Distraction-Free Logo */}
      <Link href="/" className="mb-8 hover:opacity-80 transition-opacity">
        <h1 className="text-4xl font-extrabold tracking-tighter text-[#0F1111]">
          McCollins<span className="text-[#febd69]">.</span>
        </h1>
      </Link>

      {/* Main Auth Card */}
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-in zoom-in-95 duration-200">
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isLogin ? "Sign in" : "Create account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Name Input (Only shows if creating an account) */}
          {!isLogin && (
            <div className="space-y-1 animate-in slide-in-from-top-2 fade-in duration-300">
              <label className="text-sm font-semibold text-gray-700">Your name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First and last name"
                  // visibility fix: added 'placeholder:text-gray-500' 
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-[#f08804] focus:border-[#f08804] outline-none transition-all sm:text-sm text-gray-900"
                />
              </div>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                // visibility fix: added 'placeholder:text-gray-500'
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-[#f08804] focus:border-[#f08804] outline-none transition-all sm:text-sm text-gray-900"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              {isLogin && (
                <a href="#" className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline transition-colors">
                  Forgot your password?
                </a>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? "Enter your password" : "At least 6 characters"}
                // visibility fix: added 'placeholder:text-gray-500' and 'text-gray-900'
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-[#f08804] focus:border-[#f08804] outline-none transition-all sm:text-sm text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {!isLogin && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">Passwords must be at least 6 characters.</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] py-3 rounded-lg font-bold shadow-sm flex justify-center items-center gap-2 transition-transform active:scale-95 mt-4"
          >
            {isLogin ? "Sign in" : "Create your McCollins account"}
            {!isLogin && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Terms text */}
        <p className="text-xs text-gray-600 mt-6 leading-relaxed">
          By continuing, you agree to McCollins Group's <a href="#" className="text-[#007185] hover:underline">Conditions of Use</a> and <a href="#" className="text-[#007185] hover:underline">Privacy Notice</a>.
        </p>

        {/* Toggle between Login and Signup */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-center text-gray-600 mb-4">
            {isLogin ? "New to McCollins?" : "Already have an account?"}
          </p>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-[#0F1111] py-2.5 rounded-lg font-medium shadow-sm transition-colors"
          >
            {isLogin ? "Create your McCollins account" : "Sign in securely"}
          </button>
        </div>

      </div>
    </div>
  );
}
