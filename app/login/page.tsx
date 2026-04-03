"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Shield, User, ArrowLeft, ArrowRight, UserPlus, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react'; // <-- We import NextAuth here!

export default function LoginPage() {
  const router = useRouter();
  
  // UI States
  const [loginType, setLoginType] = useState<'customer' | 'admin'>('customer');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // <-- To show real errors like "Wrong password"

  // Form Data States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleTabChange = (type: 'customer' | 'admin') => {
    setLoginType(type);
    setErrorMsg(""); // Clear errors when switching tabs
    if (type === 'admin') {
      setIsSignUp(false);
    }
  };

  // REAL AUTHENTICATION SUBMISSION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (isSignUp) {
        // --- 1. REGISTRATION FLOW ---
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, password, role: 'CUSTOMER' }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText); // Will catch "Email already exists"
        }

        // If registration works, automatically sign them in!
        const signInRes = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (signInRes?.error) throw new Error(signInRes.error);

        router.push('/');
        router.refresh();

      } else {
        // --- 2. SIGN IN FLOW ---
        const res = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          throw new Error(res.error); // Will catch "Invalid password" or "User not found"
        }

        // Success! Send them to the right dashboard
        if (loginType === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      
      {/* Top Navigation / Back Button */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-[100]">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-700 hover:text-blue-700 font-medium transition-all bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Store
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSignUp ? "Create your Account" : "Welcome to McCollins"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignUp ? "Join us to track your orders easily" : "Sign in to access your secure portal"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {/* Toggle Buttons */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              onClick={() => handleTabChange('customer')}
              type="button"
              className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                loginType === 'customer' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              Customer
            </button>
            <button
              onClick={() => handleTabChange('admin')}
              type="button"
              className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                loginType === 'admin' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </button>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center text-sm">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Name Field (Sign Up Only) */}
            {isSignUp && loginType === 'customer' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserPlus className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={loginType === 'admin' ? 'admin@mccollins.com' : 'you@example.com'}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Main Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loginType === 'admin' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-blue-600 hover:bg-blue-700'
                } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </button>
            </div>
          </form>

          {/* Toggle between Sign In and Sign Up */}
          {loginType === 'customer' && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {isSignUp ? "Already have an account?" : "New to McCollins?"}
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <button 
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {isSignUp ? "Sign In instead" : "Create an account"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}