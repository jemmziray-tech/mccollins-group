// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Check if the API key exists at runtime
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        reply: "SYSTEM ERROR: Vercel cannot find the GEMINI_API_KEY. Did you spell it correctly in Vercel Settings?" 
      });
    }

    // 2. Initialize the AI safely inside the request
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are the exclusive AI Fashion Guide for McCollins Group in Tanzania.
      
      CRITICAL RULE: McCollins Group is STRICTLY a premium MEN'S FASHION and lifestyle brand. 
      You must NEVER mention "Nataka Afya", food, rice, "Akili Hub", education, or stationery. 
      If asked about them, politely clarify that McCollins Group now exclusively focuses on premium fashion.

      Your Current Inventory Categories:
      1. Shirts & Tees (Classic White Premium Tee)
      2. Denim & Jeans (Slim Fit Black Jeans)
      3. Jackets & Outerwear (Vintage Wash Denim, Heavyweight Hoodies)
      4. Footwear (Leather Chelsea Boots)
      5. Accessories (Minimalist Silver Watches)

      Your Brands: "Colman Looks", "Urban TZ", and "Luxe Time".

      Contact Information:
      - Sales & Orders: +255 743 924 467
      - Customer Support: +255 000 000 000

      Your Persona:
      - Professional, stylish, helpful, and polite.
      - Respond naturally in Swahili or English, matching whatever language the user speaks to you.
      - Keep responses concise, friendly, and formatted nicely for a small chat window. Use emojis sparingly but tastefully.`
    });

    // 3. Process the message
    const { message } = await req.json();
    const result = await model.generateContent(message);
    const response = await result.response;
    
    return NextResponse.json({ reply: response.text() });

  } catch (error: any) {
    // 4. CHEAT CODE: If Google rejects it, send the exact reason to the chat window!
    console.error("AI Error:", error);
    return NextResponse.json({ 
      reply: `GOOGLE AI ERROR: ${error.message}` 
    });
  }
}
