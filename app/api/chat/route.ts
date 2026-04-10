// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // Check 1: Did Vercel load the key?
    if (!apiKey) {
      return NextResponse.json({ 
        reply: "⚠️ ERROR: Vercel cannot find the API key. It is returning undefined." 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const body = await req.json();
    const userMessage = body.message;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const systemPrompt = `
      You are the McCollins Group Fashion Assistant. 
      You are a stylish, helpful, and friendly AI working for a premium clothing store in Tanzania. 
      The store's private label is called "Colman Looks".
      
      Rules:
      - Keep your answers concise, friendly, and under 3 sentences if possible.
      - If asked about delivery, say it is handled securely via WhatsApp across Tanzania.
      - Respond to this customer's message: "${userMessage}"
    `;

    const result = await model.generateContent(systemPrompt);
    const text = await result.response.text();

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("AI Chat Error:", error);
    // 🟢 DEBUG MODE: This intercepts the crash and sends the exact error to your screen!
    return NextResponse.json({ 
      reply: `⚠️ API CRASHED: ${error.message || "Unknown error occurred"}` 
    });
  }
}