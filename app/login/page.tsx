// app/login/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(""); // <-- NEW: Error state
  const [isLoading, setIsLoading] = useState(false); // <-- NEW: Loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!isLogin) {
      // --- REGISTRATION FLOW ---
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to register account.");
          setIsLoading(false);
          return;
        }
        
        // If registration is successful, automatically log them in!
        const signInRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInRes?.error) {
          setError("Account created, but auto-login failed. Please log in.");
          setIsLogin(true);
        } else {
          window.location.href = "/"; // Success! Go to homepage.
        }

      } catch (err) {
        setError("Something went wrong on the server.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // --- LOGIN FLOW ---
      try {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setError("Invalid email or password.");
        } else {
          window.location.href = "/"; // Success! Go to homepage.
        }
      } catch (err) {
        setError("Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    }
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

        {/* --- GOOGLE SIGN IN BUTTON --- */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors mb-6 shadow-sm active:scale-95"
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google logo" 
            className="w-5 h-5" 
          />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Or continue with email
          </span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* --- ERROR MESSAGE DISPLAY --- */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 text-sm font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
            disabled={isLoading}
            className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] py-3 rounded-lg font-bold shadow-sm flex justify-center items-center gap-2 transition-transform active:scale-95 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Please wait..." : isLogin ? "Sign in" : "Create your McCollins account"}
            {!isLogin && !isLoading && <ArrowRight className="w-4 h-4" />}
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
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(""); // Clear errors when switching modes
            }}
            className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-[#0F1111] py-2.5 rounded-lg font-medium shadow-sm transition-colors"
          >
            {isLogin ? "Create your McCollins account" : "Sign in securely"}
          </button>
        </div>

      </div>
    </div>
  );
}