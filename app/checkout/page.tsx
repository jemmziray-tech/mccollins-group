"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

type CheckoutAvailability = {
  available: boolean;
  mode: "test" | "live" | "unavailable";
};

export default function SecureCheckoutPage() {
  const { cart, cartTotal } = useCart();
  const [availability, setAvailability] = useState<CheckoutAvailability | null>(null);
  const [details, setDetails] = useState({ name: "", email: "", phone: "", area: "" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/payments/status", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Payment availability could not be checked.");
        return response.json();
      })
      .then(setAvailability)
      .catch(() => setAvailability({ available: false, mode: "unavailable" }));
  }, []);

  async function payOnline(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!availability?.available || !cart.length || processing) return;
    setProcessing(true);
    setError("");
    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...details,
          cart: cart.map(({ id, quantity, size }) => ({ id, quantity, size })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not start payment.");
      const url = new URL(result.link);
      if (url.protocol !== "https:" || url.hostname !== "checkout.flutterwave.com") {
        throw new Error("Unexpected payment destination.");
      }
      window.location.assign(url.toString());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start payment. Please try again.");
      setProcessing(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] px-4 pt-36 pb-20">
      <div className="max-w-4xl mx-auto">
        <Link href="/cart" className="text-sm text-gray-600 underline">Back to cart</Link>
        <h1 className="text-4xl font-serif mt-5 mb-2">Secure online checkout</h1>
        <p className="text-gray-600 text-sm mb-8">Pay in Tanzanian shillings with a supported card or mobile-money service, processed securely by Flutterwave.</p>
        <div className="grid md:grid-cols-[1fr_320px] gap-8">
          <form onSubmit={payOnline} className="bg-white p-7 rounded-lg border border-gray-200 shadow-sm space-y-5">
            <h2 className="text-xl font-bold">Delivery details</h2>
            {([
              { key: "name", title: "Full name", type: "text", hint: "Your full name" },
              { key: "email", title: "Email address", type: "email", hint: "you@example.com" },
              { key: "phone", title: "Phone / mobile money number", type: "tel", hint: "07XXXXXXXX" },
              { key: "area", title: "Delivery area", type: "text", hint: "City and neighbourhood" },
            ] as const).map(({ key, title, type, hint }) => (
              <label key={key} className="block text-sm font-medium">
                {title}
                <input
                  type={type}
                  required
                  placeholder={hint}
                  value={details[key]}
                  onChange={(event) => setDetails((previous) => ({ ...previous, [key]: event.target.value }))}
                  className="block w-full border border-gray-300 rounded mt-2 px-4 py-3 focus:border-[#D4AF37] outline-none"
                />
              </label>
            ))}
            {availability?.mode === "test" && (
              <p className="text-amber-800 bg-amber-50 border border-amber-200 text-sm p-3 rounded">
                Test mode is enabled. Use Flutterwave test payment details only.
              </p>
            )}
            {availability && !availability.available && (
              <p className="text-amber-800 bg-amber-50 border border-amber-200 text-sm p-3 rounded">
                Online payments are not active yet. You can still place an order through WhatsApp checkout.
              </p>
            )}
            {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={!availability?.available || !cart.length || processing}
              className="w-full bg-black text-white uppercase tracking-wider text-xs font-bold rounded py-4 hover:bg-[#D4AF37] hover:text-black disabled:bg-gray-400 disabled:text-white disabled:cursor-not-allowed transition-colors"
            >
              {processing ? "Connecting to secure checkout..." : "Pay securely online"}
            </button>
            <p className="text-xs text-gray-500">You will be redirected to Flutterwave. We never store your card or mobile-money PIN.</p>
          </form>
          <aside className="bg-white p-7 rounded-lg border border-gray-200 shadow-sm self-start">
            <h2 className="text-xl font-bold mb-5">Order summary</h2>
            {cart.length === 0 ? <p className="text-gray-500 text-sm">Your cart is empty.</p> : (
              <ul className="space-y-4 text-sm">
                {cart.map((item) => (
                  <li key={item.id + (item.size || "")} className="flex justify-between gap-3">
                    <span>{item.quantity} × {item.name}{item.size ? " (" + item.size + ")" : ""}</span>
                    <span className="whitespace-nowrap font-medium">TSh {(item.quantity * item.price).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-between border-t mt-6 pt-5 font-bold text-lg">
              <span>Subtotal</span><span>TSh {cartTotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 mt-3">Delivery charges, if applicable, are arranged with McCollins separately.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
