// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from "@/lib/prisma"; // 🟢 NEW: Connecting the AI to your database!

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        reply: "⚠️ ERROR: Vercel cannot find the API key." 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const body = await req.json();
    const userMessage = body.message;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 🟢 NEW: Fetch your LIVE INVENTORY from the database!
    // We only fetch items that are currently marked as available.
    const availableProducts = await prisma.product.findMany({
      where: { isAvailable: true },
      select: { name: true, price: true, category: true }
    });

    // Format the products into a clean text list for the AI to read
    const inventoryList = availableProducts
      .map(p => `- ${p.name} (Tsh ${p.price.toLocaleString()})`)
      .join("\n");

    // 🟢 NEW: Give the AI the live inventory and strict new rules!
    const systemPrompt = `
      You are the McCollins Group Fashion Assistant. 
      You are a stylish, helpful, and friendly AI working for a premium clothing store in Tanzania. 
      The store's private label is called "Colman Looks".
      
      Here is our CURRENT LIVE INVENTORY:
      ${inventoryList || "We are currently restocking."}
      
      Rules:
      1. If the user asks for an item that is on the LIVE INVENTORY list, enthusiastically tell them we have it and tell them the price!
      2. If they ask for something NOT on the list, politely apologize and suggest something else we DO have. Do NOT make up products.
      3. Keep your answers concise, friendly, and under 3 sentences.
      4. Delivery is handled securely via WhatsApp across Tanzania.
      
      Customer message: "${userMessage}"
    `;

    const result = await model.generateContent(systemPrompt);
    const text = await result.response.text();

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("AI Chat Error:", error);
    
    // 🟢 NEW: Handle Google's 503 Traffic Jam gracefully so customers don't see code errors!
    if (error.message && error.message.includes("503")) {
      return NextResponse.json({ 
        reply: "I'm helping a lot of shoppers right now! Give me just a few seconds and try asking again. 🛍️" 
      });
    }

    return NextResponse.json({ 
      reply: `⚠️ API Error: ${error.message || "Unknown error occurred"}` 
    });
  }
}