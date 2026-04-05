"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define what a single item in our cart looks like
type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  size?: string; 
};

// Define everything our global brain can do
type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any, size?: string | null) => void;
  removeFromCart: (productId: string, size?: string | null) => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load the cart from local storage when the app starts
  useEffect(() => {
    const savedCart = localStorage.getItem("mccollins_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart data");
      }
    }
  }, []);

  // Save to local storage every time the cart changes
  useEffect(() => {
    localStorage.setItem("mccollins_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, size?: string | null) => {
    setCart((prevCart) => {
      // Check if the exact item (with the same size) is already in the cart
      const existingItem = prevCart.find(
        (item) => item.id === product.id && item.size === size
      );

      if (existingItem) {
        // If it's there, just increase the quantity
        return prevCart.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      // If it's not there, add it as a new item
      return [...prevCart, { 
        id: product.id, 
        name: product.name, 
        price: Number(product.price), 
        imageUrl: product.imageUrl, 
        quantity: 1, 
        size: size || undefined 
      }];
    });
  };

  const removeFromCart = (productId: string, size?: string | null) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === productId && item.size === size)));
  };

  // Automatically calculate the total price and total items
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, cartTotal, cartCount, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to easily use the cart anywhere in the app
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}