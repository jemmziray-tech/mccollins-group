import React from 'react';

export default function Hero() {
  return (
    <div className="bg-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-md">
          Welcome to McCollins Group
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light tracking-wide">
          Fashion • Food • Education
        </p>
        <a href="#products" className="inline-block bg-white text-gray-900 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition-transform duration-300">
          Shop Now
        </a>
      </div>
    </div>
  );
}