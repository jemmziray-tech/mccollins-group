// app/api/chat/route.ts
export const dynamic = "force-dynamic"; 

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "Our concierge system is currently undergoing maintenance." }, { status: 500 });
    }

    let body;
    try { body = await req.json(); } catch { return NextResponse.json({ reply: "Invalid request format." }, { status: 400 }); }

    if (!body || !body.message || typeof body.message !== 'string') {
      return NextResponse.json({ reply: "I didn't quite catch that." }, { status: 400 });
    }

    const userMessage = body.message.trim();
    const userName = body.userName || "a Guest";
    const history = Array.isArray(body.history) ? body.history : []; 

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let inventoryList = "";
    try {
      const availableProducts = await prisma.product.findMany({
        where: { isAvailable: true, stock: { gt: 0 } },
        select: { name: true, price: true, category: true, department: true, description: true }
      });

      // Pass only the name and details (Removed IDs entirely so the AI doesn't get confused)
      inventoryList = availableProducts
        .map(p => `- NAME: ${p.name} | CATEGORY: ${p.category} | PRICE: Tsh ${p.price.toLocaleString()} | DESC: ${p.description}`)
        .join("\n");
    } catch (dbError) {
      inventoryList = "SYSTEM NOTE: Live database connection is currently paused.";
    }

    const chatTranscript = history.map((msg: any) => `${msg.role === 'user' ? userName : 'Assistant'}: ${msg.text}`).join("\n");

    // 🟢 UPGRADED PROMPT: Strict instructions to use Names, not Links or IDs.
    const systemPrompt = `
      You are the official McCollins Group Fashion Assistant, a premium, stylish, and highly intelligent personal shopper.
      You are chatting with: ${userName}.
      
      === LIVE INVENTORY DATA ===
      Below is our exact, real-time catalog.
      ${inventoryList}
      
      === HOW TO RECOMMEND PRODUCTS (CRITICAL RULE) ===
      When you recommend an item from the inventory list, you MUST output a special token using the EXACT Product Name like this:
      [PROD:Exact Product Name]

      Example: "I highly recommend the [PROD:McCollins Exclusive Piece] for your evening event."
      
      Do NOT use standard Markdown links (e.g. do not write [Name](/url)).
      ONLY use the [PROD:Name] format. The system will automatically convert this token into a beautiful clickable card.
      
      === CONVERSATION HISTORY ===
      ${chatTranscript || "No previous history."}
      ====================================
      
      Current message from ${userName}: "${userMessage}"
      
      Please reply using your Search & Recommendation Engine, keeping the previous conversation context in mind!
    `;

    const result = await model.generateContent(systemPrompt);
    const text = await result.response.text();

    return NextResponse.json({ reply: text }, { status: 200 });

  } catch (error: unknown) {
    console.error("[GEMINI_CHAT_ERROR]", error);
    let status = 500;
    let reply = "I apologize, but my styling systems are momentarily offline. Please try again in a moment.";

    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("429") || errorMessage.includes("quota")) { status = 429; reply = "I am currently assisting a large volume of clients. Please give me a brief moment."; } 
      else if (errorMessage.includes("503")) { status = 503; reply = "My connection is slightly delayed. Please try your request again."; }
    }
    return NextResponse.json({ reply }, { status });
  }
}